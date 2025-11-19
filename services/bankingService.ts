
import { BankingCard, CardTransaction } from '../types';

const CARDS_KEY = 'nova_banking_cards';

// Initial Mock Data
const MOCK_CARDS: BankingCard[] = [
    {
        id: 'card_1',
        last4: '4242',
        expiry: '12/26',
        cvv: '321',
        holderName: 'John Doe',
        network: 'Visa',
        type: 'Debit',
        color: 'black',
        balance: 2450.50,
        currency: 'USD',
        isFrozen: false,
        settings: {
            onlinePayments: true,
            international: false,
            monthlyLimit: 5000,
            roundUpToSavings: true
        },
        transactions: [
            { id: 'tx_1', merchant: 'Starbucks', amount: 5.50, currency: 'USD', category: 'food', date: Date.now() - 100000, type: 'purchase', status: 'completed', icon: '☕' },
            { id: 'tx_2', merchant: 'Uber Technologies', amount: 24.00, currency: 'USD', category: 'travel', date: Date.now() - 86400000, type: 'purchase', status: 'completed', icon: '🚗' },
            { id: 'tx_3', merchant: 'Netflix Subscription', amount: 15.99, currency: 'USD', category: 'services', date: Date.now() - 172800000, type: 'purchase', status: 'completed', icon: '🎬' }
        ]
    },
    {
        id: 'card_2',
        last4: '8812',
        expiry: '09/28',
        cvv: '888',
        holderName: 'John Doe',
        network: 'Mastercard',
        type: 'Credit',
        color: 'gold',
        balance: 0,
        currency: 'USD',
        isFrozen: true,
        settings: {
            onlinePayments: false,
            international: true,
            monthlyLimit: 10000,
            roundUpToSavings: false
        },
        transactions: []
    }
];

export const bankingService = {
    init: () => {
        // In a real app, this would sync with a backend.
        // We'll seed if empty for demo purposes, but normally this comes from User object
    },

    // Simulate fetching full card details including unmasked PAN (requires auth in real life)
    getCardDetails: async (cardId: string): Promise<{pan: string, cvv: string}> => {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network/decryption
        return {
            pan: '4532 1234 5678 ' + (cardId === 'card_1' ? '4242' : '8812'),
            cvv: cardId === 'card_1' ? '321' : '888'
        };
    },

    toggleFreeze: async (cardId: string, currentState: boolean): Promise<boolean> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return !currentState;
    },

    updateSettings: async (cardId: string, settings: Partial<BankingCard['settings']>): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        // In a real app, we'd PATCH the server
    },

    topUpCard: async (cardId: string, amount: number): Promise<CardTransaction> => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return {
            id: 'tx_topup_' + Date.now(),
            merchant: 'Crypto Wallet Transfer',
            amount: amount,
            currency: 'USD',
            category: 'topup',
            date: Date.now(),
            type: 'topup',
            status: 'completed',
            icon: '🏦'
        };
    }
};
