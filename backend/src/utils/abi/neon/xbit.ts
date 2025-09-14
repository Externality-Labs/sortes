const xbitAbi = [
  // events
  'event TokenDeposited(address tokenAddress, uint256 tokenAmount, uint256 lpAmount, address user)',
  'event TokenWithdrawn(address tokenAddress, uint256 lpAmount, uint256 tokenAmount, address user)',
  'event TableRegistered(uint256 tableId, address owner)',
  'event PlayRequested(address player, address inputToken, uint256 inputAmount, uint256 repeats, address outputToken, uint256 tableId, uint256 playId, uint256 requestId, tuple(address maintainer, uint256 maintainerAmount, address claimer, uint256 claimerAmount, address donation, uint256 donationAmount) sharing)',
  'event PlayFulfilled(tuple(bool fulfilled, uint256 id, uint256 blockNumber, address player, address inputToken, uint256 inputAmount, uint256 repeats, address outputToken, uint256 tableId, uint256 requestId, uint256 randomWord, uint256[] outcomeLevels, uint256 outputTotalAmount, uint256 outputXexpAmount) status)',
  'event ShootRequested(address player, address inputToken, uint256 inputAmount, uint256 repeats, address outputToken, uint256 outputAmount, uint256 shootId, uint256 requestId, tuple(address maintainer, uint256 maintainerAmount, address claimer, uint256 claimerAmount, address donation, uint256 donationAmount) sharing)',
  'event ShootFulfilled(tuple(bool fulfilled, uint256 id, uint256 blockNumber, address player, address inputToken, uint256 inputAmount, uint256 repeats, address outputToken, uint256 outputAmount, uint256 requestId, uint256 mProbability, uint256 randomWord, bool[] results, uint256 outputTotalAmount, uint256 outputXexpAmount) status)',
  // functions
  // Deposit token to the pool. [EMIT TokenDeposited event]
  'function deposit(address tokenAddress, uint256 tokenAmount) external returns (uint256 lpAmount)',
  // Withdraw token from the pool. [EMIT TokenWithdrawn event]
  'function withdraw(address tokenAddress, uint256 lpAmount) external returns (uint256 tokenAmount)',
  // Get pool size of the token. [use token.balanceOf(address(xbit)) instead]
  // "function getPoolSize(address tokenAddress) external view returns (uint256 poolSize)",
  // Register a probability table, which must be valid. [EMIT TableRegistered event]
  'function registerTable(tuple(uint8[] relatives, uint256[] mExpectations, uint256[] mRewards, uint256 mFeeRatio, address owner, string name, uint256 id) table) external returns (uint256 tableId)',
  // Get a probability table by id.
  'function getTable(uint256 id) external view returns (tuple(uint8[] relatives, uint256[] mExpectations, uint256[] mRewards, uint256 mFeeRatio, address owner, string name, uint256 id) table)',
  // List all table ids of the owner.
  'function listTableIds(address owner) external view returns (uint256[] tableIds)',
  // List all tables of the owner.
  'function listTables(address owner) external view returns (tuple(uint8[] relatives, uint256[] mExpectations, uint256[] mRewards, uint256 mFeeRatio, address owner, string name, uint256 id)[] tables)',
  // Play with token. [EMIT PlayRequested event]
  'function play(address player, address inputToken, uint256 inputAmount, uint256 repeats, address outputToken, uint256 tableId) external returns (uint256 playId)',
  // List the play ids of the player.
  'function listPlayIds(address player) external view returns (uint256[] playIds)',
  // Get the play status by id.
  'function getPlayStatusById(uint256 playId) external view returns (tuple(bool fulfilled, uint256 id, uint256 blockNumber, address player, address inputToken, uint256 inputAmount, uint256 repeats, address outputToken, uint256 tableId, uint256 requestId, uint256 randomWord, uint256[] outcomeLevels, uint256 outputTotalAmount, uint256 outputXexpAmount) status)',
  // Shoot with token. [EMIT ShootRequested event]
  'function shoot(address player, address inputToken, uint256 inputAmount, uint256 repeats, address outputToken, uint256 outputAmount) external returns (uint256 shootId)',
  // List the request ids of the player.
  'function listShootIds(address player) external view returns (uint256[] shootIds)',
  // Get the shoot status by id.
  'function getShootStatusById(uint256 shootId) external view returns (tuple(bool fulfilled, uint256 id, uint256 blockNumber, address player, address inputToken, uint256 inputAmount, uint256 repeats, address outputToken, uint256 outputAmount, uint256 requestId, uint256 mProbability, uint256 randomWord, bool[] results, uint256 outputTotalAmount, uint256 outputXexpAmount) status)',
  // Get LP token address of the token.
  'function getLp(address token) public view returns (address lp)',
];

/*
struct PlayStatus {
    bool fulfilled;
    uint256 id; // start from 0
    uint256 blockNumber;
    address player;
    address inputToken;
    uint256 inputAmount;
    uint256 repeats;
    address outputToken;
    uint256 tableId; // probability table id
    uint256 requestId;
    // below to be fulfilled
    uint256 randomWord; // returned by VRF
    uint256[] outcomeLevels;
    uint256 outputTotalAmount;
    uint256 outputXexpAmount;
}
=> tuple(bool fulfilled, uint256 id, uint256 blockNumber, address player, address inputToken, uint256 inputAmount, uint256 repeats, address outputToken, uint256 tableId, uint256 requestId, uint256 randomWord, uint256[] outcomeLevels, uint256 outputTotalAmount, uint256 outputXexpAmount)

struct ShootStatus {
    bool fulfilled;
    uint256 id; // start from 0
    uint256 blockNumber;
    address player;
    address inputToken;
    uint256 inputAmount;
    uint256 repeats;
    address outputToken;
    uint256 outputAmount;
    uint256 requestId;
    // below to be fulfilled
    uint256 mProbability; // probability * 1e6
    uint256 randomWord; // returned by VRF
    bool[] results;
    uint256 outputTotalAmount; // sum(results) * outputAmount
    uint256 outputXexpAmount; // proportional to inputAmount
}
=> tuple(bool fulfilled, uint256 id, uint256 blockNumber, address player, address inputToken, uint256 inputAmount, uint256 repeats, address outputToken, uint256 outputAmount, uint256 requestId, uint256 mProbability, uint256 randomWord, bool[] results, uint256 outputTotalAmount, uint256 outputXexpAmount)

struct ProbabilityTable {
  // level == index
  uint8[] relatives; // reward is relative to: 0 = pool, 1 = input
  uint256[] mExpectations; // always relative to input; absolute expectation = input_amount * expectation / 1e6
  uint256[] mRewards; // absolute reward = reward * pool_size / 1e6 or reward * input_amount / 1e6
  uint256 mFeeRatio; // ratio (mFeeRatio / 1e6) of the reward shared to the table owner
  address owner; // must be filled as a valid address string
  string name; // can be empty
  uint256 id; // auto filled, start from 0
}
=> tuple(uint8[] relatives, uint256[] mExpectations, uint256[] mRewards, uint256 mFeeRatio, address owner, string name, uint256 id)

struct Sharing {
  address maintainer;
  uint256 maintainerAmount;
  address claimer;
  uint256 claimerAmount;
  address donation;
  uint256 donationAmount;
}
=> tuple(address maintainer, uint256 maintainerAmount, address claimer, uint256 claimerAmount, address donation, uint256 donationAmount)
*/

export default xbitAbi;
