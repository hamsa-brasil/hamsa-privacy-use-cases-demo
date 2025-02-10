// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// 导入必要的OpenZeppelin合约库以支持接口检查、ERC1155代币标准、可暂停功能以及访问控制。
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./TPFtAccessControl.sol"; // 自定义的访问控制合约
import "./ITPFt.sol"; // TPFt合约的接口定义

/**
 * @title TPFt 合约
 * 此合约实现了一个可定制、可暂停的ERC1155代币系统，专门用于处理具有特定属性的Token化支付工具（TPFt）。
 */
contract TPFt is ITPFt, ERC1155, TPFtAccessControl, Pausable {
    // 映射存储每个地址被冻结的TPFt余额
    mapping(address => uint256) private _frozenBalances;

    // 映射存储TPFt标识符与其实例ID之间的关系
    mapping(bytes32 => uint256) private _tpFtIds;

    // 当前TPFt实例ID计数器
    uint256 private _currentId = 1;

    /**
     * 构造函数初始化ERC1155代币URI，并赋予合约创建者默认管理员角色。
     */
    constructor()
        ERC1155("https://myapi.com/api/token/{id}.json")
        TPFtAccessControl()
    {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    // Events
    event HamsaTransferMade1155(
        address indexed from,
        address indexed to,
        uint256 value,
        uint256 fromBalance,
        uint256 toBalance,
        uint256 tokenId
    );
    event HamsaMintMade1155(
        address indexed account,
        address indexed minter,
        uint256 value,
        uint256 fromBalance,
        uint256 toBalance,
        uint256 tokenId
    );
    event HamsaBurnMade1155(
        address indexed burner,
        address indexed account,
        uint256 value,
        uint256 fromBalance,
        uint256 toBalance,
        uint256 tokenId
    );

    /**
     * 创建一个新的TPFt实例。此操作只能由具有MINTER_ROLE角色的账户执行。
     * @param tpftData 包含TPFt详细信息的数据结构
     */
    function createTPFt(
        TPFtData memory tpftData
    ) external onlyRole(MINTER_ROLE) {
        bytes32 key = keccak256(
            abi.encodePacked(
                tpftData.acronym,
                tpftData.code,
                tpftData.maturityDate
            )
        );
        require(_tpFtIds[key] == 0, "TPFt already exists");
        _tpFtIds[key] = _currentId;
        _currentId++;
    }

    /**
     * 铸造指定数量的TPFt给接收者地址。仅允许具有MINTER_ROLE的角色执行。
     * @param receiverAddress 接收代币的地址
     * @param tpftData 代币数据
     * @param tpftAmount 需要铸造的数量
     */
    function mint(
        address receiverAddress,
        TPFtData memory tpftData,
        uint256 tpftAmount
    ) external onlyRole(MINTER_ROLE) {
        require(!paused(), "ERC1155Pausable: token transfer while paused");
        uint256 id = _getTPFtId(tpftData);
        require(id != 0, "TPFt does not exist");
        uint256 balance = safeBalanceOf(receiverAddress, receiverAddress, id);
        _mint(receiverAddress, id, tpftAmount, "");

        emit HamsaMintMade1155(
            address(0),
            receiverAddress,
            tpftAmount,
            0,
            balance,
            id
        );
    }

    /**
     * 获取TPFt的ID，根据提供的TPFt数据。
     * @param tpftData 查询的TPFt数据
     * @return 返回TPFt的ID
     */
    function getTPFtId(
        TPFtData memory tpftData
    ) external view returns (uint256) {
        return _getTPFtId(tpftData);
    }

    /**
     * 直接部署功能，允许具有DIRECT_PLACEMENT_ROLE角色的账户从一个地址向另一个地址转移指定数量的TPFt。
     * @param from 转出地址
     * @param to 转入地址
     * @param tpftData TPFt数据
     * @param tpftAmount 转移的数量
     */
    function directPlacement(
        address from,
        address to,
        TPFtData memory tpftData,
        uint256 tpftAmount
    ) external onlyRole(DIRECT_PLACEMENT_ROLE) {
        uint256 id = _getTPFtId(tpftData);
        require(id != 0, "TPFt does not exist");
        require(!paused(), "ERC1155Pausable: token transfer while paused");
        safeTransferFrom(from, to, id, tpftAmount, "");
    }

    /**
     * 增加指定地址的TPFt冻结余额。
     * @param from 被冻结余额增加的地址
     * @param tpftData TPFt数据
     * @param tpftAmount 增加的冻结金额
     */
    function increaseFrozenBalance(
        address from,
        TPFtData memory tpftData,
        uint256 tpftAmount
    ) external onlyRole(FREEZER_ROLE) {
        uint256 id = _getTPFtId(tpftData);
        require(id != 0, "TPFt does not exist");
        _frozenBalances[from] += tpftAmount;
        require(!paused(), "ERC1155Pausable: token transfer while paused");
        safeTransferFrom(from, address(this), id, tpftAmount, "");
        emit FrozenBalance(from, _frozenBalances[from]);
    }

    /**
     * 减少指定地址的TPFt冻结余额。
     * @param from 被减少冻结余额的地址
     * @param tpftData TPFt数据
     * @param tpftAmount 减少的冻结金额
     */
    function decreaseFrozenBalance(
        address from,
        TPFtData memory tpftData,
        uint256 tpftAmount
    ) external onlyRole(FREEZER_ROLE) {
        uint256 id = _getTPFtId(tpftData);
        require(id != 0, "TPFt does not exist");
        require(
            _frozenBalances[from] >= tpftAmount,
            "Not enough frozen balance"
        );
        _frozenBalances[from] -= tpftAmount;
        require(!paused(), "ERC1155Pausable: token transfer while paused");
        safeTransferFrom(address(this), from, id, tpftAmount, "");
        emit FrozenBalance(from, _frozenBalances[from]);
    }

    // 控制合约的暂停与恢复功能，仅限管理员执行。
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    /**
     * 内部函数，根据TPFt数据获取其ID。
     * @param tpftData TPFt数据
     * @return 对应的TPFt ID
     */
    function _getTPFtId(
        TPFtData memory tpftData
    ) internal view returns (uint256) {
        bytes32 key = keccak256(
            abi.encodePacked(
                tpftData.acronym,
                tpftData.code,
                tpftData.maturityDate
            )
        );
        return _tpFtIds[key];
    }

    // 实现来自ERC1155、IERC165和AccessControl接口的supportsInterface函数。
    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(ERC1155, IERC165, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function balanceOf(
        address account,
        uint256 id
    )
        public
        view
        override(IERC1155, ERC1155)
        checkBalanceAccess(msg.sender, account)
        returns (uint256)
    {
        return super.balanceOf(account, id);
    }

    function safeBalanceOf(
        address caller,
        address account,
        uint256 id
    ) public view checkBalanceAccess(caller, account) returns (uint256) {
        return super.balanceOf(account, id);
    }

    function transfer1155(
        address to,
        uint256 id,
        uint256 amount
    ) external returns (bool) {
        uint256 fromBalance = safeBalanceOf(msg.sender, msg.sender, id);
        uint256 toBalance = safeBalanceOf(to, to, id);
        _safeTransferFrom(msg.sender, to, id, amount, "");
        emit HamsaTransferMade1155(
            msg.sender,
            to,
            amount,
            fromBalance,
            toBalance,
            id
        );
        return true;
    }

    function transferFrom1155(
        address from,
        address to,
        uint256 id,
        uint256 amount
    ) external returns (bool) {
        uint256 fromBalance = safeBalanceOf(from, from, id);
        uint256 toBalance = safeBalanceOf(to, to, id);
        _safeTransferFrom(from, to, id, amount, "");
        emit HamsaTransferMade1155(
            from,
            to,
            amount,
            fromBalance,
            toBalance,
            id
        );
        return true;
    }

    function burn1155(uint256 id, uint256 amount) external {
        uint256 balance = safeBalanceOf(msg.sender, msg.sender, id);
        _burn(msg.sender, id, amount);
        emit HamsaBurnMade1155(msg.sender, address(0), amount, balance, 0, id);
    }

    function mint1155(address to, uint256 id, uint256 amount) external {
        uint256 toBalance = safeBalanceOf(to, to, id);
        _mint(to, id, amount, "");
        emit HamsaMintMade1155(address(0), to, amount, 0, toBalance, id);
    }
}
