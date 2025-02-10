// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

import "./CBDCAccessControl.sol";

/**
 * @title RealDigital
 * @dev Real Digital contract implementation.
 */
//提前部署的 CBDC TOKEN（央行代币）
contract RealDigital is ERC20, CBDCAccessControl, Pausable {
    // Create a mapping between addresses and their frozen balance amounts.
    mapping(address => uint256) private _frozenBalances;

    // Defines an event that's triggered whenever the frozen balance of a wallet changes.
    event FrozenBalance(address indexed wallet, uint256 amount);

    // Modifier to check if an address has enough funds. Used in _beforeTokenTransfer.
    modifier checkFrozenBalance(address from, uint256 amount) {
        if (from != address(0)) {
            require(
                safeBalanceOf(from, from) - frozenBalanceOf(from) >= amount,
                "RealDigital: insufficient balance"
            );
        }
        _;
    }

    // Constructor is called when the contract is deployed. It sets the name and symbol of the token and sets up permission functions.
    constructor(
        string memory _name,
        string memory _symbol,
        address _authority
    ) ERC20(_name, _symbol) CBDCAccessControl(_authority) {}

    // The 'pause' function allows an address with PAUSER_ROLE to pause all token transfers.
    function pause() public whenNotPaused onlyRole(PAUSER_ROLE) {
        _pause();
    }

    // The 'unpause' function allows an address with PAUSER_ROLE to resume all token transfers.
    function unpause() public whenPaused onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    // Function that's called before any token transfer. It checks if the transfer is valid and allows for the transfer to be paused.
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    )
        internal
        virtual
        whenNotPaused
        checkFrozenBalance(from, amount)
        checkAccess(from, to)
    {}

    // The 'burn' function allows an address with BURNER_ROLE to burn a specific amount of tokens from its own balance.
    function burn(uint256 amount) public onlyRole(BURNER_ROLE) whenNotPaused {
        _beforeTokenTransfer(_msgSender(), address(0), amount);
        _burn(_msgSender(), amount);
    }

    // The 'burnFrom' function allows an address to burn a specific amount of tokens from any address, as long as the burner has enough 'allowance' permission from the address from where tokens will be burned.
    function burnFrom(
        address account,
        uint256 amount
    ) public virtual whenNotPaused {
        require(
            allowance(account, _msgSender()) >= amount,
            "ERC20: burn amount exceeds allowance"
        );
        uint256 decreasedAllowance = allowance(account, _msgSender()) - amount;
        _approve(account, _msgSender(), decreasedAllowance);
        _beforeTokenTransfer(account, address(0), amount);
        _burn(account, amount);
    }

    // The 'decimals' function returns the number of decimal places the token uses - in this case, 2.
    function decimals() public view virtual override returns (uint8) {
        return 2;
    }

    // Function to increment partially blocked tokens of a wallet. Only those with FREEZER_ROLE can execute.
    function increaseFrozenBalance(
        address from,
        uint256 amount
    ) public whenNotPaused onlyRole(FREEZER_ROLE) {
        _frozenBalances[from] += amount;
        emit FrozenBalance(from, _frozenBalances[from]);
    }

    // Function to decrement partially blocked tokens from a wallet. Only those with FREEZER_ROLE can execute.
    function decreaseFrozenBalance(
        address from,
        uint256 amount
    ) public whenNotPaused onlyRole(FREEZER_ROLE) {
        require(
            _frozenBalances[from] >= amount,
            "Frozen balance is not enough"
        );
        _frozenBalances[from] -= amount;
        emit FrozenBalance(from, _frozenBalances[from]);
    }

    // Returns the frozen balance of a specific account.
    function frozenBalanceOf(address account) public view returns (uint256) {
        return _frozenBalances[account];
    }

    // Function that allows an address with MINTER_ROLE to create a certain amount of tokens and send them to an address.
    function mint(
        address to,
        uint256 amount
    ) public whenNotPaused onlyRole(MINTER_ROLE) {
        _beforeTokenTransfer(address(0), to, amount);
        _mint(to, amount);
    }

    // Function to move tokens from one wallet to another. Only those with MOVER_ROLE can execute.
    function move(
        address from,
        address to,
        uint256 amount
    ) public whenNotPaused onlyRole(MOVER_ROLE) {
        _beforeTokenTransfer(from, to, amount);
        _transfer(from, to, amount);
    }

    // Function to destroy tokens from a wallet. Only those with MOVER_ROLE can execute.
    function moveAndBurn(
        address from,
        uint256 amount
    ) public whenNotPaused onlyRole(MOVER_ROLE) {
        move(from, address(this), amount);
        _burn(address(this), amount);
    }

    function transfer(
        address to,
        uint256 amount
    ) public override whenNotPaused returns (bool) {
        require(
            verifyAccount(_msgSender()),
            "Sender account is not authorized"
        );
        require(verifyAccount(to), "Receiver account is not authorized");

        move(msg.sender, to, amount);
        return true;
    }

    function approve(
        address spender,
        uint256 amount
    ) public override whenNotPaused returns (bool) {
        require(
            verifyAccount(_msgSender()),
            "Sender account is not authorized"
        );
        _approve(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public override whenNotPaused returns (bool) {
        require(
            allowance(from, msg.sender) >= amount,
            "ERC20: transfer amount exceeds allowance"
        );
        require(
            verifyAccount(from) && verifyAccount(to),
            "Either from or to account is not authorized"
        );

        move(from, to, amount);

        uint256 finalAmount = allowance(from, msg.sender) - amount;

        require(finalAmount >= 0, "ERC20: transfer amount exceeds allowance");

        _approve(from, msg.sender, finalAmount);

        return true;
    }

    function decreaseAllowance(
        address spender,
        uint256 subtractedValue
    ) public virtual whenNotPaused returns (bool) {
        require(verifyAccount(_msgSender()), "Account is not authorized");

        uint256 finalAmount = allowance(msg.sender, spender) - subtractedValue;

        require(finalAmount >= 0, "ERC20: decreased allowance below zero");

        _approve(msg.sender, spender, finalAmount);
        return true;
    }

    function increaseAllowance(
        address spender,
        uint256 addedValue
    ) public virtual whenNotPaused returns (bool) {
        require(verifyAccount(_msgSender()), "Account is not authorized");
        _approve(
            msg.sender,
            spender,
            allowance(msg.sender, spender) + addedValue
        );
        return true;
    }

    function safeBalanceOf(
        address caller,
        address account
    ) public view checkBalanceAccess(caller, account) returns (uint256) {
        return super.balanceOf(account);
    }

    function balanceOf(
        address account
    ) public view override(ERC20) returns (uint256) {
        return safeBalanceOf(_msgSender(), account);
    }
}
