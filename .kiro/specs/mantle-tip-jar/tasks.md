# Implementation Plan

- [x] 1. Phase 0: Project Setup and Static UI Foundation
  - Initialize Next.js project with TypeScript and configure development environment
  - Install and configure Tailwind CSS, Shadcn/ui, and essential UI components
  - Initialize git, create a .gitignore, and a simple readme file
  - _Requirements: 6.1, 6.2_

- [x] 1.1 Initialize Next.js project and install core dependencies
  - Create new Next.js 14+ project with App Router and TypeScript
  - Install Tailwind CSS, Shadcn/ui CLI, and Lucide React icons
  - Configure Shadcn/ui with default settings and install Button, Input, Textarea, Avatar, Card components
  - _Requirements: 6.1, 6.2_

- [x] 1.2 Create landing page with static sign-up interface
  - Build app/page.tsx with split-screen layout (yellow left section, white right section)
  - Implement static sign-up form with username input and styled button
  - Add feature highlight cards and branding elements using Tailwind CSS
  - _Requirements: 1.1_

- [x] 1.3 Build complete profile onboarding page
  - Create app/onboarding/complete-profile/page.tsx with Shadcn components
  - Implement Avatar upload placeholder, Name input, Website input, and About textarea
  - Add Next.js Link navigation to payout method setup page
  - _Requirements: 1.2, 1.3_

- [x] 1.4 Create payout method setup page
  - Build app/onboarding/payout-method/page.tsx with wallet connection UI
  - Implement "Connect Your Mantle Wallet" button and helper text
  - Add skip option with navigation to dashboard page
  - _Requirements: 1.4, 1.5_

- [x] 2. Phase 0: Static Dashboard and Embed Components
  - Create static dashboard interface and embeddable tip widget
  - Build complete user interface without functionality
  - _Requirements: 2.1, 2.2, 3.1_

- [x] 2.1 Build static creator dashboard page
  - Create app/dashboard/page.tsx with claimable balance display
  - Implement recent tips table with mock data using Shadcn Table component
  - Add withdraw funds button and navigation to settings
  - _Requirements: 2.1, 2.2_

- [x] 2.2 Create settings page with embed code display
  - Build app/dashboard/settings/page.tsx with iframe code snippet
  - Implement copy-to-clipboard functionality for embed code
  - Style code block with syntax highlighting and copy button
  - _Requirements: 2.4, 2.5_

- [x] 2.3 Build embeddable tip widget page
  - Create app/embed/[creatorId]/page.tsx with dynamic routing
  - Implement "Tip Me on Mantle" button with branded styling
  - Build tip modal using Shadcn Dialog component with amount input and wallet connection UI
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 3. Phase 1: Authentication Integration and Web3 Setup
  - Integrate Clerk authentication and Wagmi Web3 providers
  - Replace static components with dynamic, authenticated interfaces
  - _Requirements: 5.5, 6.3, 6.4_

- [x] 3.1 Install and configure authentication and Web3 dependencies
  - Install @clerk/nextjs, wagmi, viem, and @tanstack/react-query packages
  - Set up environment variables for Clerk authentication keys
  - Create .env.local template with required environment variables
  - _Requirements: 6.4, 5.5_

- [x] 3.2 Set up authentication providers and middleware
  - Configure ClerkProvider in app/layout.tsx with proper settings
  - Create middleware.ts to protect /onboarding and /dashboard routes
  - Replace static sign-up form with Clerk SignUp component
  - _Requirements: 5.5, 1.1_

- [x] 3.3 Create Web3 provider configuration
  - Build Web3Provider component with Wagmi configuration for Mantle Testnet
  - Configure Mantle Testnet network settings and RPC endpoints
  - Wrap application with Web3Provider in layout.tsx
  - _Requirements: 6.3, 1.5_

- [x] 3.4 Convert dashboard to dynamic authenticated component
  - Update app/dashboard/page.tsx to use "use client" directive
  - Implement useUser hook from Clerk for user authentication
  - Replace mock data with hardcoded values for claimable balance and recent tips
  - Add console.log simulation for withdraw functionality with success toast
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 4. Phase 1: Interactive Tip Flow and Settings
  - Build interactive tipping modal with wallet connection
  - Implement dynamic settings page with user-specific embed codes
  - _Requirements: 3.2, 3.3, 4.1, 4.2_

- [x] 4.1 Update settings page with dynamic embed code generation
  - Modify app/dashboard/settings/page.tsx to use Clerk useUser hook
  - Generate dynamic iframe src URL with user ID from Clerk
  - Implement clipboard copy functionality with success feedback
  - _Requirements: 2.4, 2.5_

- [x] 4.2 Build interactive tip modal with wallet connection
  - Update tip modal in embed page to use Wagmi useConnect hook
  - Implement real wallet connection with Mantle network validation
  - Add amount validation and tip confirmation button state management
  - _Requirements: 3.3, 3.4, 3.5, 4.1_

- [x] 4.3 Simulate complete tip flow with mock backend
  - Implement EIP-712 typed data structure creation on client
  - Add console.log simulation for signature request and API call
  - Create setTimeout delay to mimic network requests and show loading states
  - Display success message and close modal after simulated completion
  - _Requirements: 4.1, 4.2, 4.6_

- [x] 5. Phase 2: Smart Contract Development and Deployment
  - Develop TipJar smart contract with EIP-712 meta-transaction support
  - Set up Hardhat development environment and deploy to Mantle Testnet
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 5.1 Set up Hardhat development environment
  - Install Hardhat, Solidity compiler, and deployment dependencies
  - Configure hardhat.config.js with Mantle Testnet network settings
  - Set up project structure for contracts, scripts, and tests
  - _Requirements: 6.5, 5.1_

- [x] 5.2 Develop TipJar smart contract with meta-transaction support
  - Write TipJar.sol contract with tip, getClaimableBalance, and withdraw functions
  - Implement EIP-712 domain separator and signature verification
  - Add access control for relayer-only tip function calls
  - Include replay protection with nonce tracking
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 5.3 Create comprehensive smart contract tests
  - Write Hardhat tests for all contract functions using Waffle matchers
  - Test normal operations, edge cases, and security scenarios
  - Verify EIP-712 signature validation and replay protection
  - Test access control and unauthorized access prevention
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 5.4 Deploy smart contract to Mantle Testnet
  - Create deployment script using Ethers.js v6
  - Deploy TipJar contract to Mantle Testnet with proper configuration
  - Save deployed contract address to environment variables
  - Verify contract deployment and basic functionality
  - _Requirements: 5.1, 5.2_

- [x] 6. Phase 2: Backend Relay Service Implementation
  - Build API route for meta-transaction relaying
  - Implement signature verification and smart contract interaction
  - _Requirements: 4.3, 4.4, 4.5, 5.4_

- [x] 6.1 Create relay API route with signature verification
  - Build app/api/relay-tip/route.ts POST endpoint
  - Implement EIP-712 signature verification using viem recoverTypedDataAddress
  - Add comprehensive input validation and error handling
  - Set up relayer wallet configuration with private key from environment
  - _Requirements: 4.3, 4.4, 5.4_

- [x] 6.2 Implement smart contract interaction in relay service
  - Initialize viem walletClient with relayer private key and Mantle transport
  - Call tip function on deployed TipJar contract with verified parameters
  - Handle transaction success/failure and return appropriate responses
  - Add transaction hash and status to API response
  - _Requirements: 4.4, 4.5, 5.2_

- [x] 6.3 Add security measures and rate limiting to relay service
  - Implement rate limiting to prevent API abuse
  - Add request logging and error tracking
  - Validate tip amounts and creator addresses
  - Ensure proper error responses for all failure scenarios
  - _Requirements: 5.4, 4.4_

- [ ] 7. Phase 2: Frontend Integration with Live Blockchain
  - Connect frontend components to real smart contract and relay service
  - Replace mock data with live blockchain interactions
  - _Requirements: 2.1, 2.3, 4.1, 4.2, 4.5, 4.6_

- [ ] 7.1 Update tip modal with real EIP-712 signing
  - Replace console.log simulation with actual EIP-712 typed data construction
  - Implement useSignTypedData hook from Wagmi for signature requests
  - Add proper error handling for signature rejection and wallet errors
  - _Requirements: 4.1, 4.2_

- [ ] 7.2 Connect tip modal to live relay service
  - Replace setTimeout simulation with real fetch call to /api/relay-tip
  - Send signature and message payload in POST request body
  - Handle API response success/failure and update UI accordingly
  - Display transaction hash and confirmation status to user
  - _Requirements: 4.3, 4.4, 4.5, 4.6_

- [ ] 7.3 Update dashboard with live smart contract data
  - Replace hardcoded balance with useReadContract hook to call getClaimableBalance
  - Connect to deployed TipJar contract using contract address from environment
  - Handle loading states and error conditions for contract reads
  - _Requirements: 2.1, 5.2_

- [ ] 7.4 Implement live withdraw functionality
  - Replace console.log withdraw with useWriteContract hook
  - Call withdraw function on TipJar smart contract
  - Handle transaction confirmation and update balance display
  - Add transaction status feedback and error handling
  - _Requirements: 2.3, 5.3_

- [ ] 8. Phase 2: Final Integration and Environment Setup
  - Complete environment configuration and deployment preparation
  - Ensure all components work together in production environment
  - _Requirements: 6.6_

- [ ] 8.1 Complete environment variable configuration
  - Document all required environment variables in .env.example
  - Include Clerk keys, Mantle RPC URL, private keys, and contract address
  - Add environment variable validation in application startup
  - _Requirements: 6.6_

- [ ] 8.2 Add comprehensive error handling and user feedback
  - Implement proper error boundaries for React components
  - Add loading states for all async operations
  - Create user-friendly error messages for common failure scenarios
  - Test error handling across all user flows
  - _Requirements: 5.6_

- [ ] 8.3 Optimize application for production deployment
  - Configure Next.js for optimal production builds
  - Add proper TypeScript types for all components and functions
  - Implement proper SEO meta tags and Open Graph data
  - Test application performance and bundle size optimization
  - _Requirements: 6.1, 6.6_