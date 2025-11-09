# OYD Protocol

**Own Your Data**

> The first platform that turns consumer data into incentives. 


##  Overview

OYD Protocol is a revolutionary platform that allows users to get paid for their personal data while helping companies comply with India's Digital Personal Data Protection (DPDP) Act 2023. 

##  The Problem

### The Great Data Theft
Every day, major platforms extract massive value from user data while users receive nothing:

### The Legal Reality
- **DPDP Act 2023** is now enforceable (Sept 2025)
- Companies face **₹50+ crore fines** for non-compliance
- Users have legal rights to data transparency and control
- **Zero infrastructure exists** to help users monetize these rights

---

##  Our Solution

OYD Protocol creates a **win-win-win ecosystem**:

###  For Users
-  Get incentives from data that was being stolen anyway
-  Complete **transparency** about what data is collected
-  **Instant payments** in real money (PYUSD)
-  **Legal protection** under DPDP Act

###  For Web2 Companies  
-  **Automatic DPDP compliance** = no more ₹50+ crore fines
-  **Marketing advantage**: "We pay users for their data"
-  **Premium verified data** instead of bot-filled datasets
-  **Legal protection** with documented consent trails

###  For Data Buyers
-  **Premium human-verified data** 
-  **Subscription models** for consistent data access
-  **GDPR/DPDP compliant** data with proper consent
-  **Real-time insights** from verified humans, not bots

---

##  Architecture

### Multi-Chain Deployment Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER INTERACTION LAYER                       │
├─────────────────────────────────────────────────────────────────┤
│  Mock E-commerce                    │  User Dashboard     │
│  Platform                           │  (Earnings Tracker) │
└─────────────────┬───────────────────-───────────────────┬───────┘
                  │                                     │
┌─────────────────▼─────────────────────────────────────────────┐
│                    BLOCKCHAIN LAYER                           │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│  │    CELO     │    │BASE/POLYGON │    │  ETHEREUM   │        │
│  │  MAINNET    │    │   MAINNET   │    │   MAINNET   │        │
│  │             │    │             │    │             │        │
│  │ Self Proto  │    │  DataDAO    │    │   PYUSD     │        │
│  │ Identity    │    │ Contracts   │    │  Payments   │        │
│  │ Verification│    │ Storage     │    │ Distribution│        │
│  │ Sybil Check │    │ Tokenization│    │ Conversion  │        │
│  └─────────────┘    └─────────────┘    └─────────────┘        │
│                                                               │
└─────────────────┬───────────────────┬───────────────────┬─────┘
                  │                   │                   │
┌─────────────────▼───────────────────▼───────────────────▼───────┐
│                   VERIFICATION LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│  Reclaim Protocol  │  zkTLS Proofs   │  Data Authenticity       │
│  (Off-chain)       │  (Cryptographic)│  (Zero-Knowledge)        │
└─────────────────┬───────────────────┬───────────────────┬───────┘
                  │                   │                   │
┌─────────────────▼───────────────────▼───────────────────▼───────┐
│                    STORAGE LAYER                                │
├─────────────────────────────────────────────────────────────────┤
│      Lighthouse DataDAO        │         IPFS Storage           │
│     (Filecoin Network)         │      (Decentralized)           │
│   • Data Tokenization          │    • Encrypted Data Files      │
│   • DataCoin Minting           │    • Hash References           │
│   • Access Control             │    • Permanent Storage         │
└─────────────────────────────────────────────────────────────────┘
```

### 🔗 Chain-Specific Deployments

#### **CELO MAINNET**
-  **Self Protocol Integration**
-  Identity verification via Aadhaar
-  Zero-knowledge proofs for privacy
-  Sybil resistance mechanisms
-  Age verification and sanctions screening

#### **BASE/ MAINNET**  
-  **DataDAO Smart Contracts**
-  Data tokenization and storage
-  Subscription management for buyers
-  IPFS hash registry on-chain
-  Access control and permissions

#### **ETHEREUM/POLYGON**
-  **PYUSD Payment Rails**
-  Instant fiat conversions
-  Automated revenue distribution (70% user, 20% platform, 10% compliance)
-  Cross-border payment support
-  Smart contract automation

---

#### **Detailed Flow:**

1. **Data Collection** 
   - User browses mock e-commerce platform
   - User consents to sell data

   - System tracks interactions, purchases, searches

2. **Identity Verification** 
   - Self Protocol integration on Celo
   - Aadhaar-based verification (India-specific)
   - Zero-knowledge proofs maintain privacy
   - Sybil resistance prevents fake accounts

3. **Data Authentication** 
   - Reclaim Protocol generates zkTLS proofs  
   - Cryptographically proves data authenticity
   - No exposure of actual personal information
   - Creates tamper-proof evidence

4. **Storage & Tokenization** 
   - Data encrypted and stored on IPFS
   - Lighthouse DataDAO mints DataCoins
   - Smart contracts manage access control
   - Hash references stored on-chain

5. **Payment Processing** 
   - DataCoins converted to PYUSD
   - Instant settlement to user wallet
   - Automatic revenue splitting via smart contracts
   - Cross-border payment support

---

## 🛠️ Tech Stack

### **Frontend**
- **React.js** - User dashboard and admin panel
- **Next.js** - Mock e-commerce platform  
- **TailwindCSS** - Responsive styling
- **Web3.js** - Blockchain interactions

### **Blockchain Protocols**
- **Self Protocol** - Privacy-preserving identity verification
- **Reclaim Protocol** - zkTLS data authenticity proofs
- **Lighthouse** - DataDAO and IPFS storage infrastructure  
- **PYUSD** - Stablecoin payment rails

### **Smart Contracts**
- **Solidity** - Contract development
- **Hardhat** - Development framework



### **Storage & Infrastructure**  
- **IPFS** - Decentralized storage
- **Filecoin** - Permanent data persistence
- **MongoDB** - Off-chain metadata
- **Node.js** - Backend API services

---

##  Key Features

###  **Privacy-First Architecture**
- Zero-knowledge proofs preserve user privacy
- Data encrypted before storage  
- No personal information exposed to third parties
- Users maintain full control over data access

###  **Real Money Payments**
- PYUSD integration for instant fiat conversion
- Direct UPI/bank account deposits in India  
- Cross-border payment support
- Automated smart contract distributions

###  **Transparent Data Valuation**
- Real-time data value calculations
- Industry-standard pricing benchmarks
- Category-wise data pricing (location, demographics, behavior)
- User dashboard with earnings tracking

###  **DPDP Act Compliance**
- Built-in consent management
- Automated compliance reporting
- Legal-grade audit trails
- Data deletion and portability rights

###  **Multi-Chain Interoperability**  
- Seamless cross-chain data flow
- Optimized gas costs across networks
- Protocol-agnostic architecture
- Future-proof for new blockchains

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MetaMask or compatible Web3 wallet
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/oydprotocol.git
cd datasovereignty

# Install dependencies
npm install

# Install frontend dependencies
cd frontend
npm install

# Install contract dependencies  
cd ../contracts
npm install

# Copy environment variables
cp .env.example .env
# Add your API keys and contract addresses
```

### Environment Setup

```bash
# .env file
CELO_PRIVATE_KEY=your_celo_wallet_private_key
BASE_PRIVATE_KEY=your_base_wallet_private_key  
ETHEREUM_PRIVATE_KEY=your_ethereum_wallet_private_key

SELF_PROTOCOL_API_KEY=your_self_protocol_key
RECLAIM_PROTOCOL_API_KEY=your_reclaim_protocol_key
LIGHTHOUSE_API_KEY=your_lighthouse_api_key
PYUSD_CONTRACT_ADDRESS=your_pyusd_contract_address

MONGODB_URI=your_mongodb_connection_string
IPFS_GATEWAY_URL=your_ipfs_gateway
```
---

## 📈 Roadmap

### Phase 1: ETHGlobal MVP (✅ Current)
- Basic data collection and payment flow
- Self Protocol identity verification  
- PYUSD payment integration
- Deployed on testnet/mainnet

### Phase 2: Production Launch (Q1 2025)
- Partner with 3-5 major Indian e-commerce platforms
- Scale to 10,000+ active users
- Advanced analytics and insights
- Mobile app release

### Phase 3: Market Expansion (Q2-Q3 2025)  
- Expand to Southeast Asia markets
- Enterprise data buyer dashboard
- Compliance with additional regulations (EU GDPR, California CCPA)

### Phase 4: Global Scale (Q4 2025+)
- 1M+ active users across multiple countries
- Integration with major social media platforms  
- Data marketplace with advanced trading features
---

##  License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

##  Acknowledgments

- **ETHGlobal** for hosting this amazing hackathon
- **Self Protocol** for privacy-preserving identity infrastructure  
- **Reclaim Protocol** for zkTLS data verification
- **Lighthouse** for DataDAO and IPFS storage solutions
- **PayPal** for PYUSD integration and payment rails
- **Indian Government** for the progressive DPDP Act 2023

---

##  Final Note

OYD Protocol represents more than just a hackathon project—it's the foundation for a new economic model where users finally profit from their digital existence. With India's DPDP Act creating the regulatory foundation and 500+ million potential users, we're building the infrastructure for the largest digital rights revolution in human history.

**Join us in turning digital slavery into digital sovereignty.** 

---

*Built with ❤️ for ETHGlobal by the OYD Protocolteam*