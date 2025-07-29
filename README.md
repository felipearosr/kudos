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
All core pages and components have been implemented with static UI and full navigation:

#### Pages
- **Landing Page** (`/`): Split-screen design with feature highlights and sign-up form with navigation to onboarding
- **Complete Profile** (`/onboarding/complete-profile`): Avatar upload, name, website, and about sections with navigation to payout setup
- **Payout Method** (`/onboarding/payout-method`): Wallet connection interface with Mantle network info and navigation to dashboard
- **Creator Dashboard** (`/dashboard`): Balance display, recent tips table, withdraw functionality, and navigation to settings
- **Settings** (`/dashboard/settings`): Embed code generator with copy functionality, live preview, and navigation back to dashboard
- **Embed Widget** (`/embed/[creatorId]`): Interactive tip modal with amount selection and wallet connection simulation

#### UI Component Library (Shadcn/ui)
Complete implementation of all required UI components:
- **Button**: Variants (default, destructive, outline, secondary, ghost, link) with size options and asChild prop support
- **Input**: Styled form input with focus states and accessibility features
- **Textarea**: Multi-line text input with proper styling and focus states
- **Avatar**: Profile picture component with image and fallback support using Radix UI
- **Card**: Container components (Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter)
- **Table**: Complete table system (Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption)
- **Dialog**: Modal system (Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription) using Radix UI
- **Icons**: Lucide React icons throughout the interface

#### Navigation & User Flow
- **Complete Navigation**: All pages properly linked with Next.js Link components
- **Progress Indicators**: Visual progress tracking in onboarding flow
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Interactive Elements**: Functional buttons, modals, and form interactions

#### Features Implemented
- Mock data for dashboard tips and balance display
- Interactive tip modal with preset amounts (0.01, 0.05, 0.1, 0.25 MNT) and custom input
- Clipboard functionality for embed code copying with success feedback
- Dynamic embed code generation with creator ID
- Wallet connection simulation with status indicators
- USD conversion display for MNT amounts (mock rate: 1 MNT = $0.65)
- Form validation and user feedback throughout the application

### 🔄 Phase 1: Dynamic Frontend & Authentication (In Progress)
Authentication and Web3 infrastructure has been implemented:

#### Authentication System
- **Clerk Integration**: ClerkProvider configured in root layout for user management
- **Protected Routes**: Middleware protecting `/onboarding/*` and `/dashboard/*` routes
- **Public Routes**: Landing page (`/`), embed widgets (`/embed/*`), and API routes remain accessible
- **Sign-up Flow**: Clerk SignUp component integrated in landing page with custom styling

#### Web3 Infrastructure
- **Wagmi Configuration**: Complete Web3 provider setup with Mantle Testnet support
- **Network Configuration**: Mantle Testnet (Chain ID: 5003) with RPC endpoint configuration
- **Wallet Connectors**: Support for MetaMask, WalletConnect, and injected wallets
- **Query Client**: TanStack Query integration for efficient data fetching and caching

#### Provider Architecture
```typescript
<ClerkProvider>
  <Web3Provider>
    <QueryClientProvider>
      {children}
    </QueryClientProvider>
  </Web3Provider>
</ClerkProvider>
```

#### Environment Configuration
- **Clerk Keys**: Authentication keys for development and production
- **Web3 Settings**: Mantle RPC URL and chain ID configuration
- **Redirect URLs**: Post-authentication routing to onboarding flow

### ⏳ Phase 1: Remaining Tasks
- Convert dashboard to use real user authentication
- Implement live wallet connection in tip modal
- Replace mock data with user-specific information
- Add real-time balance updates

### ⏳ Phase 2: Backend & Blockchain Integration (Planned)
- Smart contract development and deployment
- Meta-transaction relay service
- EIP-712 signature verification
- Live blockchain interactions

## Tech Stack

- **Frontend**: Next.js 14+ with App Router, TypeScript
- **Styling**: Tailwind CSS with custom CSS variables and Shadcn/ui design system
- **UI Components**: Radix UI primitives with custom styling
- **Icons**: Lucide React
- **Utilities**: clsx and tailwind-merge for conditional styling
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