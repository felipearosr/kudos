# Mantle Tip Jar

A decentralized application (dApp) that enables content creators to receive cryptocurrency tips from their fans through an embeddable widget. The core innovation is gasless tipping for fans, achieved through meta-transaction relaying on the Mantle network.

## Features

- **Gasless Tipping**: Fans can tip creators without paying gas fees through meta-transaction relaying
- **Creator Dashboard**: Manage tip jar profile and view earnings
- **Embeddable Widget**: Easy-to-embed tip button for websites and social media
- **Mantle Network**: Built on Mantle testnet for low-cost transactions

## Tech Stack

- **Frontend**: Next.js 14+ with App Router, TypeScript
- **Styling**: Tailwind CSS with Shadcn/ui components
- **Authentication**: Clerk (to be added)
- **Web3**: Wagmi + Viem (to be added)
- **Smart Contracts**: Hardhat + Solidity (to be added)
- **Network**: Mantle Testnet

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Development Phases

This project follows a three-phase development approach:

1. **Phase 0**: Static UI scaffolding with all pages and components
2. **Phase 1**: Dynamic frontend with authentication and mock data
3. **Phase 2**: Backend integration with smart contracts and blockchain functionality

## License

MIT