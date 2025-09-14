const xlptAbi = [
  'event Minted(address account, uint256 amount)',
  'event Burned(address account, uint256 amount)',
  'function token2LpAmount(uint256 tokenAmount) external view returns (uint256 lpAmount)',
  'function lp2TokenAmount(uint256 lpAmount) external view returns (uint256 tokenAmount)',
];

export default xlptAbi;
