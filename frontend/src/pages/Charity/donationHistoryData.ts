import proof0 from '../../assets/images/charity/proof/proof0.png';
import proof1 from '../../assets/images/charity/proof/proof1.png';
import proof2 from '../../assets/images/charity/proof/proof2.png';

export type DepositTransaction = {
  blockTimestamp: number;
  amount: number;
  transactionHash: string;
  recipient: string;
  proof: string;
  link: string;
};

export const donationHistoryData: DepositTransaction[] = [
  {
    blockTimestamp: 1730470260, // 2024年11月1日 14:11 (UTC+0)
    amount: 360.0,
    transactionHash:
      '0xd64099a0db0aa9ecef65bac3573d238550fd223b5322787ca9bd3b00c5ffce03',
    recipient: 'Save the Children',
    proof: proof0,
    link: 'https://x.com/SavetheChildren',
  },
  {
    blockTimestamp: 1742436180,
    amount: 360.0,
    transactionHash:
      '0xa651e18cbb8229c15b5f324d9531dcfe730c9ccb58450893e5f9e41deb1026af',
    recipient: 'World Central Kitchen',
    proof: proof1,
    link: 'https://x.com/wckitchen',
  },
  {
    blockTimestamp: 1747726631,
    amount: 360.0,
    transactionHash:
      '0x4a4b0d1d295257126c668e358d7e5ddfb1fe68694665836b40a89b118dc9e343',
    recipient: 'Hong Kong Shark Foundation',
    proof: proof2,
    link: 'https://www.hksharkfoundation.org/',
  },
];
