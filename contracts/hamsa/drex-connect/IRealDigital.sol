// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.7.0 <0.9.0;

interface IRealDigital {
    event FrozenBalance(address indexed wallet, uint256 amount);

    function pause() external;

    function unpause() external;

    function decimals() external view returns (uint8);

    function increaseFrozenBalance(address from, uint256 amount) external;

    function decreaseFrozenBalance(address from, uint256 amount) external;

    function frozenBalanceOf(address account) external view returns (uint256);

    function mint(address to, uint256 amount) external;

    function move(address from, address to, uint256 amount) external;

    function moveAndBurn(address from, uint256 amount) external;

    function decreaseAllowance(address spender, uint256 subtractedValue) external returns (bool);

    function increaseAllowance(address spender, uint256 addedValue) external returns (bool);

    // Inherited from ERC20 but repeated here for completeness
    function totalSupply() external view returns (uint256);

    function balanceOf(address account) external view returns (uint256);

    function allowance(address owner, address spender) external view returns (uint256);

    function approve(address spender, uint256 amount) external returns (bool);

    function transfer(address recipient, uint256 amount) external returns (bool);

    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);

    function burnFrom(address spender, uint256 amount) external returns (bool);
}