
import { Proposal, Asset } from '../types';

export const governanceService = {
  
  /**
   * Fetches proposals relevant to the user's holdings.
   * In a real app, this would query Snapshot.org or on-chain Governor contracts.
   */
  getProposals: async (assets: Asset[]): Promise<Proposal[]> => {
    await new Promise(resolve => setTimeout(resolve, 800)); // Network delay

    const proposals: Proposal[] = [
      {
        id: 'prop_1',
        daoName: 'Uniswap',
        daoIcon: '🦄',
        assetSymbol: 'UNI',
        title: 'Deploy Uniswap V3 on Polygon zkEVM',
        description: 'This proposal seeks to deploy Uniswap V3 to Polygon zkEVM. Polygon zkEVM is a ZK-Rollup that provides EVM equivalence.',
        startDate: Date.now() - 172800000, // 2 days ago
        endDate: Date.now() + 259200000, // 3 days left
        status: 'Active',
        totalVotes: 4500000,
        userVotingPower: 0,
        options: [
          { id: 'opt_1', label: 'For', votes: 4200000 },
          { id: 'opt_2', label: 'Against', votes: 150000 },
          { id: 'opt_3', label: 'Abstain', votes: 150000 }
        ]
      },
      {
        id: 'prop_2',
        daoName: 'Aave',
        daoIcon: '👻',
        assetSymbol: 'AAVE',
        title: 'Add rETH to Aave V3 Ethereum Market',
        description: 'Rocket Pool ETH (rETH) is a decentralized liquid staking derivative. This proposal adds rETH as collateral on Aave V3.',
        startDate: Date.now() - 86400000,
        endDate: Date.now() + 432000000,
        status: 'Active',
        totalVotes: 12000,
        userVotingPower: 0,
        options: [
          { id: 'opt_1', label: 'YAE', votes: 11500 },
          { id: 'opt_2', label: 'NAY', votes: 500 }
        ]
      },
      {
        id: 'prop_3',
        daoName: 'Compound',
        daoIcon: '🟢',
        assetSymbol: 'COMP',
        title: 'Reduce Reserve Factor for USDC',
        description: 'Proposal to lower the reserve factor for USDC market from 15% to 10% to incentivize more borrowing.',
        startDate: Date.now() - 604800000,
        endDate: Date.now() - 86400000, // Ended yesterday
        status: 'Passed',
        totalVotes: 850000,
        userVotingPower: 0,
        options: [
          { id: 'opt_1', label: 'For', votes: 600000 },
          { id: 'opt_2', label: 'Against', votes: 250000 }
        ]
      }
    ];

    // Update voting power based on user assets
    return proposals.map(p => {
       const asset = assets.find(a => a.symbol === p.assetSymbol);
       // Mock: 1 Token = 1 Vote Power
       return {
         ...p,
         userVotingPower: asset ? asset.balance : 0
       };
    });
  },

  castVote: async (proposalId: string, optionId: string, power: number): Promise<boolean> => {
     await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate signing
     return true;
  }
};
