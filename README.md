
# Nova Crypto Wallet

Nova is a next-generation, mobile-first crypto wallet featuring real-time asset tracking, AI-driven market analysis, and secure P2P encrypted messaging.

## 🚀 Core Features

1.  **Self-Custodial Wallet**: Real-time key generation (BIP-39) via `ethers.js`. Your keys are generated client-side and never leave your device.
2.  **AI Market Advisor**: Integrated Google Gemini AI provides personalized portfolio analysis and market trend predictions.
3.  **Secure Messaging**: End-to-End encrypted chat (AES-GCM) allowing secure communication between buyers and sellers.
4.  **P2P Marketplace**: Buy and sell items directly within the app using crypto.
5.  **Privacy Focused**: No tracking, local key storage, and optional TOR connectivity (simulated in this build).

## 🛠 Tech Stack

*   **Frontend**: React Native (Expo) / React (Web Shim)
*   **State Management**: React Hooks + Context
*   **Crypto Core**: `ethers.js` (EVM), `bitcoinjs-lib` (mocked for web preview)
*   **AI**: Google Gemini API (`@google/genai`)
*   **Backend/Auth**: Supabase (Simulated/Client-side for prototype)
*   **Encryption**: Web Crypto API (`window.crypto.subtle`)
*   **Styling**: Tailwind CSS (NativeWind compatible)

## 📦 Installation

### Prerequisites
*   Node.js v18+
*   npm or yarn

### Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-username/nova-wallet.git
    cd nova-wallet
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Environment Variables**
    Create a `.env` file in the root directory:
    ```env
    API_KEY=your_gemini_api_key
    SUPABASE_URL=your_supabase_url
    SUPABASE_KEY=your_supabase_anon_key
    ```

4.  **Run the App**
    *   **Web Preview**:
        ```bash
        npm start
        # Press 'w' for web
        ```
    *   **iOS Simulator**:
        ```bash
        npm run ios
        ```
    *   **Android Emulator**:
        ```bash
        npm run android
        ```

## 🔒 Security Architecture

### Key Management
*   **Generation**: Keys are generated using cryptographically secure random number generators (CSPRNG) via `ethers.Wallet.createRandom()`.
*   **Storage**: In this prototype, keys are stored in `localStorage`. **For Production**: Use `Expo SecureStore` or `React Native Keychain` to store the mnemonic and private keys in the device's hardware-backed secure enclave.
*   **Recovery**: The 12-word BIP-39 mnemonic is the *only* way to recover funds. We do not store backups on our servers.

### Encryption
*   **Chat**: Messages are encrypted using a derived shared session key (simulated ECDH) with AES-GCM 256-bit encryption. The server (Supabase) only stores encrypted blobs.

### API Security
*   **API Keys**: Gemini API keys should be proxied through a backend server in a production environment to prevent exposure.

## ⚠️ Production Readiness Checklist

This codebase is a high-fidelity prototype. Before deploying to production, ensure the following:
1.  **Replace LocalStorage**: Implement `SecureStore` for sensitive data.
2.  **Backend Auth**: Set up real Row Level Security (RLS) on Supabase.
3.  **Audit**: Perform a security audit on the smart contract interactions.
4.  **Error Handling**: Improve network error boundaries and retry logic.
5.  **Performance**: Optimize large list rendering (FlashList) and image caching.
