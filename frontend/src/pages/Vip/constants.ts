export const progressStyle = [
  'linear-gradient(291deg, #FF8311 0%, #FFF500 125.7%)',
  'linear-gradient(294deg, #1CADFF 0%, #DBFF00 140.72%)',
  'linear-gradient(265deg, #9358F7 -0.27%, #7B78F2 27.13%, #6197EE 52.54%, #45B5E9 80.59%, #10D7E2 105.22%)',
  'linear-gradient(84deg, #73CCD8 5.47%, #2B6B9F 98.23%)',
];

export const vipDesc = [
  {
    condition: '≤ 1999 EXP',
    title: 'Basic Participant',
    privileges: [
      {
        title: '1. Limited voting power on proposals and governance',
        detail:
          'VIP 1 privileges include limited voting power on proposals and governance, with the ability to propose and vote on issues within a designated range of types, granting these proposals the lowest ranking and voting weight.',
      },
      {
        title:
          '2. Eligible to receive airdrops, subject to availability and distribution rules',
        detail:
          'VIP 1 users are eligible to receive airdrops, contingent upon availability and distribution rules. However, their eligibility for ordinary airdrops is subject to prioritization, with VIP 1 users having the lowest receiving priority when the total number of ordinary airdrops is limited. They are not entitled to exclusive airdrops reserved for high-level or specific users.',
      },
    ],
  },
  {
    condition: '2000 - 4999 EXP',
    title: 'Intermediate Participant',
    privileges: [
      {
        title:
          '1. Expanded voting power on proposals and governance, proportional to token holdings',
        detail:
          'VIP 2 privileges grant expanded voting power on proposals and governance, directly correlated with token holdings. Users can engage in most issues, with proposal ranking and voting weight determined by their EXP holdings.',
      },
      {
        title:
          '2. Priority access to airdrops and special campaigns, proportional to token holdings',
        detail:
          'VIP 2 users enjoy priority access to ordinary airdrops and special campaigns, with receiving and participation rights weighted according to their EXP holdings.',
      },
    ],
  },
  {
    condition: '5000 - 9999 EXP',
    title: 'Advanced Participant',
    privileges: [
      {
        title: '1. Full voting power on proposals and governance',
        detail:
          "VIP 3 privileges offer full voting power on proposals and governance, allowing users to engage with all issues. Proposal ranking and voting weight are directly tied to the user's EXP holdings.",
      },
      {
        title:
          '2. Exclusive access to airdrops, special campaigns, and community initiatives, proportional to token holdings',
        detail:
          'VIP 3 users gain exclusive access to airdrops, special campaigns, and community initiatives tailored to this tier, with participation opportunities proportional to their EXP holdings.',
      },
      {
        title:
          '3. Opportunity to participate in strategic decision-making processes',
        detail:
          "VIP 3 users can contribute significantly to strategic decision-making processes, participating in discussions concerning the protocol's major functions, project development direction, and more.",
      },
    ],
  },
  {
    condition: '≥ 10,000 EXP',
    title: 'Elite Participant',
    showMore: true,
    privileges: [
      {
        title:
          '1. Enhanced version of full voting power on proposals and governance, with additional weight based on token holdings',
        detail:
          'VIP 4 privileges elevate voting power on proposals and governance to its highest level, supplemented by additional weight determined by token holdings. VIP 4 users can propose and vote on all issues, with their proposals and votes carrying the utmost weight.',
      },
      {
        title:
          '2. Highest priority access to exclusive airdrops, special campaigns, and community initiatives, proportional to token holdings',
        detail:
          'VIP 4 users also enjoy the highest priority access to exclusive airdrops, special campaigns, and community initiatives tailored to this tier, with participation opportunities weighted according to EXP holdings.',
      },
      {
        title: '3. Higher staking rewards, proportional to token holdings',
        detail:
          'VIP 4 users receive higher staking rewards proportional to their token holdings.',
      },
      {
        title:
          '4. Financial incentives for locking tokens: the higher the lock-up amount, the higher the upper limit of the distributor profit split ratio that can be set',
        detail:
          'VIP 4 users benefit from financial incentives for locking tokens, with the upper limit of the distributor profit split ratio increasing in tandem with the lock-up amount.',
      },
    ],
  },
];
