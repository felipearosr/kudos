# Requirements Document

## Introduction

The Mantle Tip Jar is a decentralized application (dApp) called Kudos, that enables content creators to receive cryptocurrency tips from their fans through an embeddable widget. The core innovation is gasless tipping for fans, achieved through meta-transaction relaying on the Mantle network. The application provides a complete creator onboarding experience, dashboard management, and seamless Web3 integration while maintaining excellent user experience for both creators and fans.

## Requirements

### Requirement 1

**User Story:** As a content creator, I want to create an account and set up my tip jar profile, so that I can start receiving tips from my audience.

#### Acceptance Criteria

1. WHEN a creator visits the landing page THEN the system SHALL display a sign-up interface with username input and account creation button
2. WHEN a creator completes initial sign-up THEN the system SHALL redirect them to a profile completion page
3. WHEN a creator is on the profile completion page THEN the system SHALL provide fields for profile photo upload, name, website/social link, and about section
4. WHEN a creator completes their profile THEN the system SHALL redirect them to the payout method setup page
5. WHEN a creator is on the payout method setup page THEN the system SHALL provide wallet connection interface for Mantle network
6. IF a creator skips wallet connection THEN the system SHALL allow access to dashboard with limited functionality

### Requirement 2

**User Story:** As a content creator, I want to access a dashboard where I can manage my tip jar and view my earnings, so that I can track my income and withdraw funds.

#### Acceptance Criteria

1. WHEN a creator accesses their dashboard THEN the system SHALL display their current claimable balance from the smart contract
2. WHEN a creator views their dashboard THEN the system SHALL show a list of recent tips received with sender address, amount, and timestamp
3. WHEN a creator clicks the withdraw button THEN the system SHALL execute a blockchain transaction to transfer their claimable balance to their connected wallet
4. WHEN a creator accesses settings THEN the system SHALL display an embeddable iframe code snippet with their unique creator ID
5. WHEN a creator clicks copy on the embed code THEN the system SHALL copy the iframe code to their clipboard

### Requirement 3

**User Story:** As a content creator, I want to embed a tip button on my website or social media, so that fans can easily tip me without leaving the platform they're on.

#### Acceptance Criteria

1. WHEN the embed code is loaded on an external site THEN the system SHALL display a "Tip Me on Mantle" button
2. WHEN a fan clicks the tip button THEN the system SHALL open a modal with tipping interface
3. WHEN a fan is in the tipping modal THEN the system SHALL display amount input, wallet connection, and confirmation options
4. WHEN a fan enters a tip amount THEN the system SHALL validate the amount is greater than zero and within reasonable limits
5. WHEN a fan connects their wallet THEN the system SHALL enable the tip confirmation button

### Requirement 4

**User Story:** As a fan, I want to tip my favorite creator without paying gas fees, so that I can support them without additional transaction costs.

#### Acceptance Criteria

1. WHEN a fan confirms a tip THEN the system SHALL generate an EIP-712 typed data structure for meta-transaction signing
2. WHEN a fan signs the meta-transaction THEN the system SHALL send the signature and message to the relay service
3. WHEN the relay service receives a tip request THEN the system SHALL verify the signature authenticity using the fan's address
4. WHEN the signature is verified THEN the system SHALL execute the tip transaction on behalf of the fan using the relayer wallet
5. WHEN the tip transaction is successful THEN the system SHALL update the creator's claimable balance in the smart contract
6. WHEN the tip is processed THEN the system SHALL display a success message to the fan

### Requirement 5

**User Story:** As a system administrator, I want the application to be secure and handle blockchain interactions properly, so that users' funds are protected and the system operates reliably.

#### Acceptance Criteria

1. WHEN the smart contract is deployed THEN it SHALL implement EIP-712 meta-transaction support for gasless operations
2. WHEN a tip is processed THEN the smart contract SHALL only accept calls from the authorized relayer address
3. WHEN a creator withdraws funds THEN the smart contract SHALL transfer their entire claimable balance and reset it to zero
4. WHEN the relay service processes a request THEN it SHALL validate the signature matches the message payload and sender address
5. WHEN authentication is required THEN the system SHALL protect dashboard and onboarding routes from unauthorized access
6. WHEN Web3 operations are performed THEN the system SHALL handle connection errors and transaction failures gracefully

### Requirement 6

**User Story:** As a developer, I want the application to be built with modern Web3 and React patterns, so that it's maintainable and follows current best practices.

#### Acceptance Criteria

1. WHEN the application is built THEN it SHALL use Next.js 14+ with App Router architecture
2. WHEN styling is applied THEN the system SHALL use Tailwind CSS with Shadcn/ui components
3. WHEN Web3 functionality is implemented THEN the system SHALL use viem and wagmi for blockchain interactions
4. WHEN authentication is implemented THEN the system SHALL use Clerk for user management
5. WHEN smart contracts are developed THEN the system SHALL use Hardhat for development and deployment
6. WHEN the application is deployed THEN it SHALL be configured for Mantle Testnet with proper environment variables