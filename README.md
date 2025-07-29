# Mantle Tip Jar

A decentralized application (dApp) that enables content creators to receive cryptocurrency tips from their fans through an embeddable widget. The core innovation is gasless tipping for fans, achieved through meta-transaction relaying on the Mantle network.

## Features

- **Gasless Tipping**: Fans can tip creators without paying gas fees through meta-transaction relaying
- **Creator Dashboard**: Complete dashboard with earnings overview and recent tips table
- **Embeddable Widget**: Interactive tip modal with wallet connection and amount selection
- **Settings Management**: Dynamic embed code generation with copy-to-clipboard functionality
- **Onboarding Flow**: Complete profile setup and payout method configuration
- **Mantle Network**: Built for Mantle testnet with low-cost transactions

## Current Implementation Status

### ✅ Phase 0: Static UI Foundation (Complete)
All core pages and components have been implemented with static UI:

#### Pages
- **Landing Page** (`/`): Split-screen design with feature highlights and sign-up form
- **Complete Profile** (`/onboarding/complete-profile`): Avatar upload, name, website, and about sections
- **Payout Method** (`/onboarding/payout-method`): Wallet connection interface with Mantle network info
- **Creator Dashboard** (`/dashboard`): Balance display, recent tips table, and withdraw functionality
- **Settings** (`/dashboard/settings`): Embed code generator with copy functionality and live preview
- **Embed Widget** (`/embed/[creatorId]`): Interactive tip modal with amount selection and wallet connection

#### Components
- **UI Components**: Button, Input, Textarea, Avatar, Card, Table, Dialog from Shadcn/ui
- **Icons**: Lucide React icons throughout the interface
- **Responsive Design**: Mobile-first approach with Tailwind CSS

#### Features Implemented
- Mock data for dashboard tips and balance
- Interactive tip modal with preset amounts and custom input
- Clipboard functionality for embed code copying
- Progress indicators for onboarding flow
- Dynamic embed code generation with creator ID
- Wallet connection simulation
- USD conversion display for MNT amounts

### 🔄 Phase 1: Dynamic Frontend & Authentication (Next)
- Clerk authentication integration
- Wagmi Web3 provider setup
- Real wallet connection with Mantle network
- User session management
- Protected routes middleware

### ⏳ Phase 2: Backend & Blockchain Integration (Planned)
- Smart contract development and deployment
- Meta-transaction relay service
- EIP-712 signature verification
- Live blockchain interactions

## Tech Stack

- **Frontend**: Next.js 14+ with App Router, TypeScript
- **Styling**: Tailwind CSS with Shadcn/ui components
- **Icons**: Lucide React
- **Authentication**: Clerk (to be integrated)
- **Web3**: Wagmi + Viem (to be integrated)
- **Smart Contracts**: Hardhat + Solidity (to be developed)
- **Network**: Mantle Testnet

## Project Structure

```
app/
├── page.tsx                           # Landing page with sign-up
├── layout.tsx                         # Root layout with global styles
├── globals.css                        # Global CSS with Tailwind
├── onboarding/
│   ├── complete-profile/page.tsx      # Profile setup form
│   └── payout-method/page.tsx         # Wallet connection setup
├── dashboard/
│   ├── page.tsx                       # Main dashboard with balance & tips
│   └── settings/page.tsx              # Embed code and settings
└── embed/
    └── [creatorId]/page.tsx           # Embeddable tip widget

components/
└── ui/                                # Shadcn/ui components
    ├── button.tsx
    ├── input.tsx
    ├── textarea.tsx
    ├── avatar.tsx
    ├── card.tsx
    ├── table.tsx
    └── dialog.tsx

.kiro/
└── specs/
    └── mantle-tip-jar/
        ├── design.md                  # Detailed design document
        ├── requirements.md            # Project requirements
        └── tasks.md                   # Implementation tasks
```

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Key Features Detail

### Dashboard (`/dashboard`)
- **Claimable Balance**: Displays current MNT balance with USD conversion
- **Recent Tips Table**: Shows sender addresses, amounts, timestamps, and status
- **Withdraw Button**: Styled for future blockchain integration
- **Navigation**: Links to settings page

### Embed Widget (`/embed/[creatorId]`)
- **Interactive Modal**: Opens tip interface on button click
- **Amount Selection**: Preset buttons (0.01, 0.05, 0.1, 0.25 MNT) plus custom input
- **Wallet Connection**: Mock wallet connection with status indicator
- **Responsive Design**: Works across different embed contexts
- **Gasless Info**: Explains gas fee coverage to users

### Settings (`/dashboard/settings`)
- **Dynamic Embed Code**: Generates iframe code with creator ID
- **Copy Functionality**: One-click clipboard copying with success feedback
- **Live Preview**: Shows how widget appears on external sites
- **Usage Instructions**: Clear guidance for embedding

### Onboarding Flow
- **Profile Setup**: Avatar upload, display name, website, and about sections
- **Payout Configuration**: Wallet connection with Mantle network details
- **Progress Tracking**: Visual progress indicators across steps

## Development Phases

This project follows a three-phase development approach:

1. **Phase 0**: Static UI scaffolding with all pages and components ✅
2. **Phase 1**: Dynamic frontend with authentication and mock data 🔄
3. **Phase 2**: Backend integration with smart contracts and blockchain functionality ⏳

## License

MIT