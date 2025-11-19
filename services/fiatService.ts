
import { FiatQuote } from '../types';

// Mock Providers
const PROVIDERS = [
    { id: 'moonpay', name: 'MoonPay', logo: '🟣' },
    { id: 'transak', name: 'Transak', logo: '🔵' },
    { id: 'ramp', name: 'Ramp', logo: '🟢' },
    { id: 'stripe', name: 'Stripe', logo: '⚪' }
];

export const fiatService = {
    
    getQuotes: async (fiatAmount: number, fiatCurrency: string, cryptoSymbol: string, cryptoPrice: number): Promise<FiatQuote[]> => {
        // Simulate API latency
        await new Promise(resolve => setTimeout(resolve, 1500));

        const quotes: FiatQuote[] = PROVIDERS.map(provider => {
            // Randomize fee between 1% and 4%
            const feePercent = 0.01 + Math.random() * 0.03;
            const fee = fiatAmount * feePercent;
            const netAmount = fiatAmount - fee;
            
            // Slight rate variation
            const rateVariation = 0.98 + Math.random() * 0.04; 
            const effectiveRate = cryptoPrice * rateVariation;
            
            const cryptoAmount = netAmount / effectiveRate;

            return {
                providerId: provider.id,
                providerName: provider.name,
                providerLogo: provider.logo,
                cryptoAmount: parseFloat(cryptoAmount.toFixed(6)),
                fiatAmount: fiatAmount,
                fiatCurrency: fiatCurrency,
                fee: parseFloat(fee.toFixed(2)),
                rate: parseFloat(effectiveRate.toFixed(2)),
                deliveryTime: Math.random() > 0.5 ? 'Instant' : '5-10 mins',
                paymentMethods: ['Credit Card', 'Apple Pay', 'Bank Transfer'],
                isBestRate: false
            };
        });

        // Find best rate (highest crypto amount)
        const maxCrypto = Math.max(...quotes.map(q => q.cryptoAmount));
        quotes.forEach(q => {
            if (q.cryptoAmount === maxCrypto) q.isBestRate = true;
        });

        return quotes.sort((a, b) => b.cryptoAmount - a.cryptoAmount);
    },

    processPayment: async (providerId: string, amount: number, paymentDetails: any): Promise<boolean> => {
        // Simulate processing
        await new Promise(resolve => setTimeout(resolve, 3000));
        return true;
    }
};
