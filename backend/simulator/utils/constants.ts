// useful ABIs only
export const erc20Abi = [
  // Read-Only Functions
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  // Authenticated Functions
  'function transfer(address to, uint amount) returns (bool)',
  'function deposit() public payable',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function mint(address to, uint256 amount) public',
];

/*
struct Swap {
  // level == index + 1
  bool[] relatives; // whether the reward is relative to pool size
  uint256[] expectations; // unit is USDT amount; probability = expectation / reward
  uint256[] rewards; // if relative, real absolute reward = reward * pool_size / 1e6; else unit is USDT amount
  uint256 millionth_ratio; // ratio (millionth_ratio / 1e6) of the reward shared to the swap owner
  address owner; // auto filled as msg.sender
  string name; // can be empty
  uint256 id; // auto filled
}
*/

export const xbitAbi = [
  // # Xbit inherits from ERC20
  ...erc20Abi,
  // owner of Xbit contract can set maintainer
  'function setMaintainer(address new_maintainer) public',
  // owner and maintainer can trigger pool transfer from USDT to WBTC
  // EMIT event TransportUSDT2WBTC
  'function transport(uint256 amount_usdt) public',
  // save WBTC to Xbit contract pool
  // EMIT event SaveWBTC
  'function save(uint256 amount_wbtc) public',
  // unlock XBIT such that it can be withdrawn
  // EMIT event UnlockXBIT
  'function unlockXbit() public',
  // withdraw WBTC from Xbit contract pool, with a withdraw fee
  // EMIT event WithdrawWBTC
  'function withdraw(uint256 amount_xbit) public',
  // register a swap
  // EMIT event SwapRegistered
  'function registerSwap(tuple(bool[] relatives, uint256[] expectations, uint256[] rewards, uint256 millionth_ratio, address owner, string name, uint256 id) swap) public returns (uint256)',
  // list swap ids by owner address
  'function listSwapIds(address owner) public view returns (uint256[] swapIds)',
  // list swaps by owner address
  'function listSwaps(address owner) public view returns (tuple(bool[] relatives, uint256[] expectations, uint256[] rewards, uint256 millionth_ratio, address owner, string name, uint256 id)[] swaps)',
  // get swap by swap id
  'function getSwap(uint256 swapId) public view returns (tuple(bool[] relatives, uint256[] expectations, uint256[] rewards, uint256 millionth_ratio, address owner, string name, uint256 id) swap)',
  // execute an unsafe swap
  // EMIT event RequestedRandomness
  'function unsafeSwap(uint256 amount_usdt, uint256 swapId, uint256 random_word) returns (uint256)',
  // execute a safe swap
  // EMIT event RequestedRandomness
  'function safeSwap(uint256 amount_usdt, uint256 swapId) returns (uint256)',
  // run the second step of a safe lottery: reveal
  // EMIT event LotteryOutcome
  'function reveal(uint256 requestId) public',
  // get lottery request ids by address
  'function getRequestIdByAddress(address player) public view returns (uint256[] memory)',
  // get lottery request status by id
  'function getRequestStatusById(uint256 requestId) public view returns (tuple(bool exists, uint256 requestId, uint256 initialBlock, address player, address referrer, uint256 usdtIn, uint256 wbtcTicket, uint256 quantity, bool fulfilled, uint256 randomWord, uint256[] rewardLevels, uint256 xexpOut, uint256 wbtcOut, uint256 wbtcFee) memory)',
  // estimate WBTC amount by USDT amount using uniswap v2
  'function estimateUSDT2WBTC(uint amountIn) public view returns (uint)',
  // get prize pool size in USDT amount
  'function getPrizePoolSizeInUSDT() public view returns (uint256)',
  // events
  'event SaveWBTC(uint256 amount_wbtc, uint256 amount_xbit, address player)',
  'event UnlockXBIT(uint256 block_number, address player)',
  'event WithdrawWBTC(uint256 amount_xbit, uint256 amount_wbtc, address player)',
  'event TransportUSDT2WBTC(uint256 amount_usdt, uint256 amount_wbtc, address caller)',
  'event SwapRegistered(uint256 swapId, address owner)',
  'event RequestedRandomness(uint256 reqId, address invoker)',
  'event LotteryOutcome(uint256 reqId, tuple(bool exists, uint256 requestId, uint256 initialBlock, address player, uint256 swapId, uint256 usdtIn, uint256 wbtcTicket, uint256 quantity, bool fulfilled, uint256 randomWord, uint256[] rewardLevels, uint256 xexpOut, uint256 wbtcOut, uint256 wbtcFee) status)',
];
