# FundFlow — Digital Wallet with Web3 Integration

<div align="center">

![FundFlow](https://img.shields.io/badge/FundFlow-v1.0.0-00d4ff?style=for-the-badge&logo=ethereum)
![React](https://img.shields.io/badge/React-18.2-61dafb?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-5.0-a855f7?style=for-the-badge&logo=vite)
![Supabase](https://img.shields.io/badge/Supabase-2.0-3ecf8e?style=for-the-badge&logo=supabase)
![Ethereum](https://img.shields.io/badge/Ethereum-Sepolia-627eea?style=for-the-badge&logo=ethereum)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=for-the-badge&logo=tailwindcss)

**A production-grade digital wallet application combining modern fintech UI with real Ethereum blockchain deposits.**

[Live Demo](https://akshatsfundflow.vercel.app) · [Report Bug](https://github.com/akshat20000/FundFlow/issues) · [Request Feature](https://github.com/akshat20000/FundFlow/issues)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running Locally](#running-locally)
- [Supabase Setup](#supabase-setup)
  - [Database Schema](#database-schema)
  - [Row Level Security](#row-level-security)
  - [RPC Functions](#rpc-functions)
- [Smart Contract](#smart-contract)
  - [Contract Overview](#contract-overview)
  - [Deploying to Sepolia](#deploying-to-sepolia)
- [Application Pages](#application-pages)
- [Dashboard Sections](#dashboard-sections)
- [State Management](#state-management)
- [MetaMask Integration](#metamask-integration)
- [Deployment](#deployment)
- [Environment Variables Reference](#environment-variables-reference)
- [Known Limitations](#known-limitations)
- [Contributing](#contributing)

---

## Overview

FundFlow is a full-stack digital wallet prototype that demonstrates what a modern fintech application looks like when built with a production-quality architecture. It combines:

- **Real authentication** via Supabase Auth with email confirmation
- **Real database operations** via PostgreSQL with Row Level Security
- **Real blockchain transactions** via MetaMask and an Ethereum Sepolia testnet smart contract
- **Simulated payments** for Credit Card, Net Banking, and PayPal (demo mode)
- **P2P money transfers** between registered FundFlow users
- **Group wallets** for shared expenses and contribution tracking

The entire frontend is built in React 18 with Vite, styled with Tailwind CSS, and uses Zustand for global state management. The backend is entirely serverless — Supabase handles auth, the database, and all sensitive financial logic through PostgreSQL RPC functions.

---

## Features

### Authentication
- Email + password sign-up with username
- Email confirmation flow
- Secure sign-in with detailed error messages
- Password strength indicator on sign-up
- Protected routes — unauthenticated users are redirected to sign-in

### Dashboard
- Real-time balance display
- This-month income/expense/transaction stats
- Recent activity feed
- Quick send to saved contacts
- Quick action shortcuts

### Payments
- **Send Money** — P2P transfer to any FundFlow user by email or username
- Contact autocomplete in the send form
- **Add Money** — multi-stage modal with 4 payment options:
  - Credit/Debit Card (simulated)
  - Net Banking (simulated)
  - PayPal (simulated)
  - MetaMask on Ethereum Sepolia (real blockchain transaction)
- Quick-select amount chips ($10 / $25 / $50 / $100 / $250)

### Contacts
- Add contacts by FundFlow email (verified against the database before saving)
- Full-text search
- Quick Send button navigates to Payments pre-filled

### Groups
- Create shared wallets with multiple members
- Contribute funds from your personal wallet to a group
- Track each member's individual contribution with a progress bar
- Withdraw your contributed amount back to your wallet at any time

### Activity
- Full transaction history with search and type filter
- Manual income/expense logging
- Total income, total expense, and transaction count stats

### Bills & Recharge
- 8 category cards (Electricity, Water, Internet, Mobile, DTH, Gas, Insurance, Credit Card)
- UI preview — real payment integrations planned for a future update

### Settings
- Edit full name and phone number
- Read-only display of username and email
- Security status panel (email verified, password, 2FA)
- Web3 wallet info panel

---

## Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Frontend framework | React | 18.2 | Component-based UI |
| Build tool | Vite | 5.0 | Dev server and bundling |
| Styling | Tailwind CSS | 3.4 | Utility-first design system |
| Routing | React Router | 6.22 | Client-side routing |
| Global state | Zustand | 4.5 | Auth and wallet state |
| Backend (BaaS) | Supabase | 2.39 | Auth, PostgreSQL, RPC |
| Blockchain | Ethereum (Sepolia) | — | Testnet deposits |
| Web3 library | ethers.js | 5.7.2 | Contract interaction |
| Wallet | MetaMask | browser ext | Transaction signing |
| Smart contract | Solidity | 0.8.x | SimpleWallet contract |
| Fonts | Syne + DM Sans | — | Display + body typography |
| Icons | Font Awesome | 6.4 | UI icons |
| Deployment | Vercel | — | Hosting |

---

## Project Structure

```
fundflow-react/
│
├── public/
│   └── favicon.svg
│
├── src/
│   ├── lib/                          # External service clients
│   │   ├── supabase.js               # Supabase singleton client
│   │   └── web3.js                   # ethers helpers: connect, switch network, contract factory
│   │
│   ├── store/                        # Zustand global state
│   │   ├── useAuthStore.js           # User session, profile, sign-in/up/out
│   │   └── useWalletStore.js         # Balance, transactions, contacts, groups + all RPC calls
│   │
│   ├── hooks/
│   │   └── useMetaMask.js            # MetaMask state machine hook
│   │
│   ├── utils/
│   │   ├── constants.js              # Contract address, ABI, chain config, nav items
│   │   └── format.js                 # Currency, date, ETH formatters
│   │
│   ├── components/
│   │   ├── ui/
│   │   │   └── index.jsx             # Button, Input, Select, Card, Modal, Badge, Spinner, Alert
│   │   │
│   │   ├── layout/
│   │   │   ├── AuthLayout.jsx        # Shared wrapper for auth pages
│   │   │   ├── ProtectedRoute.jsx    # Auth guard — redirects unauthenticated users
│   │   │   ├── Sidebar.jsx           # Navigation sidebar with user card
│   │   │   └── DashboardLayout.jsx   # Shell: sidebar + topbar + scrollable content
│   │   │
│   │   ├── dashboard/
│   │   │   ├── HomeSection.jsx       # Balance card, stats, recent activity, quick send
│   │   │   ├── PaymentsSection.jsx   # Send money form + payment history
│   │   │   ├── ContactsSection.jsx   # Contact list + add contact modal
│   │   │   ├── GroupsSection.jsx     # Groups grid + create/contribute/withdraw modals
│   │   │   ├── ActivitySection.jsx   # Full transaction log + log transaction modal
│   │   │   ├── BillsSection.jsx      # Bill category cards (UI preview)
│   │   │   ├── SettingsSection.jsx   # Profile form + security + web3 info
│   │   │   └── SectionStubs.jsx      # Re-export barrel for all section components
│   │   │
│   │   ├── modals/
│   │   │   ├── AddMoneyModal.jsx     # 4-stage modal: amount → method → pay → success
│   │   │   └── index.js              # Barrel export
│   │   │
│   │   └── shared/
│   │       ├── TransactionItem.jsx   # Single transaction row (compact + full modes)
│   │       ├── TransactionList.jsx   # List wrapper with skeleton loading + filters
│   │       ├── ContactItem.jsx       # Single contact row (compact + full modes)
│   │       ├── GroupItem.jsx         # Group card with contribution bar + actions
│   │       ├── BalanceCard.jsx       # Hero balance display with stats row
│   │       ├── StatCard.jsx          # Metric card with icon and trend
│   │       ├── SectionHeader.jsx     # Standardised section title + action slot
│   │       ├── SearchInput.jsx       # Pill search field with clear button
│   │       └── index.js              # Barrel export
│   │
│   ├── pages/
│   │   ├── Landing.jsx               # Marketing page
│   │   ├── SignIn.jsx                # Sign-in form
│   │   ├── SignUp.jsx                # Sign-up form with password strength
│   │   └── Dashboard.jsx             # Route-level page: loads data, renders sections
│   │
│   ├── App.jsx                       # BrowserRouter + route definitions
│   ├── main.jsx                      # React 18 createRoot entry point
│   └── index.css                     # Tailwind directives + component classes
│
├── contracts/
│   └── SimpleWallet.sol              # Solidity smart contract
│
├── index.html                        # HTML shell with font + FA CDN links
├── package.json
├── vite.config.js                    # Path alias @ → src/
├── tailwind.config.js                # Design tokens
├── postcss.config.js
├── vercel.json                       # SPA rewrite rule
├── .env.example                      # Environment variable template
└── .gitignore
```

---

## Architecture

### Data Flow

```
User Action
    │
    ▼
React Component
    │  calls
    ▼
Zustand Store (useWalletStore / useAuthStore)
    │  calls
    ▼
Supabase Client (supabase.js)
    │  calls
    ▼
Supabase PostgreSQL (RLS-protected)
    │  via RPC for financial ops
    ▼
PostgreSQL RPC Function (SECURITY DEFINER)
    │  returns new balance
    ▼
Store updates state → Components re-render
```

### Why RPC Functions for Financial Operations

All balance mutations (adding funds, transferring, contributing to groups, withdrawing) are performed via PostgreSQL `SECURITY DEFINER` functions rather than direct table updates. This means:

- The client can **never** directly UPDATE the `profiles.balance` column
- All balance changes are **atomic** — the balance update and the transaction log happen in a single database transaction
- Server-side validation runs in the database — amounts, recipient existence, and balance sufficiency are all checked before any mutation occurs

### Authentication Flow

```
1. User submits sign-in form
2. useAuthStore.signIn() calls supabase.auth.signInWithPassword()
3. Supabase returns session + user object
4. onAuthStateChange listener fires with SIGNED_IN event
5. loadAll(user.id) fetches balance, transactions, contacts, groups in parallel
6. React Router redirects to /dashboard
7. ProtectedRoute checks useAuthStore.user — renders Outlet if present
```

### MetaMask Deposit Flow

```
1. User enters USD amount in AddMoneyModal
2. Selects MetaMask payment method
3. useMetaMask.connect() requests eth_requestAccounts from MetaMask
4. ensureSepoliaNetwork() switches/adds Sepolia chain (Chain ID: 11155111)
5. User clicks "Confirm Deposit"
6. USD amount converted to ETH: amount / ETH_TO_USD_RATE
7. walletContract.deposit({ value: ethValue }) — MetaMask shows transaction popup
8. User confirms in MetaMask
9. tx.wait(1) waits for 1 block confirmation
10. On receipt.status === 1: supabase.rpc('add_funds_and_log') updates balance in DB
11. If DB update fails: tx hash stored in localStorage for recovery
12. Balance and transaction list refresh — success screen shown
```

---

## Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Git**
- **Supabase account** — [supabase.com](https://supabase.com) (free tier is sufficient)
- **MetaMask browser extension** — for Web3 deposits ([metamask.io](https://metamask.io))
- **Remix IDE** — for smart contract deployment ([remix.ethereum.org](https://remix.ethereum.org))
- **Sepolia testnet ETH** — free from faucets listed below

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/akshat20000/FundFlow.git
cd FundFlow/fundflow-react

# 2. Install dependencies
npm install
```

### Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

Open `.env` and set:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Both values are found in your Supabase project under **Project Settings → API**.

> **Security note:** The Supabase anon key is safe to expose in the browser — it is intentionally public and protected by Row Level Security policies. Never expose your Supabase `service_role` key.

### Running Locally

```bash
npm run dev
```

Visit `http://localhost:5173`. The app will hot-reload on file changes.

---

## Supabase Setup

### Step 1 — Create a new project

Go to [supabase.com](https://supabase.com), create a new project, and note your project URL and anon key.

### Step 2 — Disable email confirmation (optional, for development)

Go to **Authentication → Email** and turn off "Enable email confirmations" to skip the confirmation step during development. Re-enable for production.

### Step 3 — Run the SQL schema

Open the **SQL Editor** in your Supabase dashboard and run the following script in full:

### Database Schema

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    username TEXT UNIQUE,
    email TEXT,
    full_name TEXT,
    phone_number TEXT,
    balance DECIMAL(12,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions table
CREATE TABLE public.transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'bill', 'recharge')),
    amount DECIMAL(12,2) NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'completed',
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Contacts table
CREATE TABLE public.contacts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    name TEXT NOT NULL,
    detail TEXT NOT NULL,
    icon TEXT DEFAULT 'fa-user-circle',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, detail)
);

-- Groups table
CREATE TABLE public.groups (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    total_contribution DECIMAL(12,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Group members table
CREATE TABLE public.group_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    contribution_amount DECIMAL(12,2) DEFAULT 0.00,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(group_id, user_id)
);

-- Group transactions table
CREATE TABLE public.group_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    type TEXT NOT NULL CHECK (type IN ('contribution', 'withdrawal')),
    amount DECIMAL(12,2) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Auto-create Profile on Sign-Up

```sql
-- Trigger: automatically create a profile row when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    INSERT INTO public.profiles (id, username, email)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'username',
        NEW.email
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Row Level Security

```sql
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_transactions ENABLE ROW LEVEL SECURITY;

-- Profiles: any authenticated user can read (needed for contact lookup and send money)
-- but only the owner can insert/update their own row
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Transactions: users can only see and create their own
CREATE POLICY "transactions_select" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "transactions_insert" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Contacts: users manage only their own
CREATE POLICY "contacts_all" ON public.contacts FOR ALL USING (auth.uid() = user_id);

-- Groups: user sees groups where they are a member
CREATE POLICY "groups_select" ON public.groups FOR SELECT
    USING (id IN (SELECT group_id FROM public.group_members WHERE user_id = auth.uid()));
CREATE POLICY "groups_insert" ON public.groups FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "groups_update" ON public.groups FOR UPDATE USING (auth.uid() = created_by);

-- Group members: simple policy avoids infinite recursion
CREATE POLICY "group_members_select" ON public.group_members FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "group_members_insert" ON public.group_members FOR INSERT WITH CHECK (true);
CREATE POLICY "group_members_update" ON public.group_members FOR UPDATE USING (auth.uid() = user_id);

-- Group transactions
CREATE POLICY "group_transactions_select" ON public.group_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "group_transactions_insert" ON public.group_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### RPC Functions

All financial mutations go through these server-side PostgreSQL functions. They run as `SECURITY DEFINER`, meaning they execute with database-owner privileges and bypass RLS — this ensures the function can atomically update both the sender's and recipient's balance in a single transaction.

```sql
-- 1. Add funds and log transaction (called after MetaMask deposit or simulated payment)
CREATE OR REPLACE FUNCTION add_funds_and_log(
    amount_to_add DECIMAL,
    description_text TEXT DEFAULT 'Added funds'
) RETURNS DECIMAL LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE new_balance DECIMAL;
BEGIN
    UPDATE profiles SET balance = balance + amount_to_add, updated_at = NOW()
    WHERE id = auth.uid() RETURNING balance INTO new_balance;
    INSERT INTO transactions (user_id, type, amount, description, status)
    VALUES (auth.uid(), 'income', amount_to_add, description_text, 'completed');
    RETURN new_balance;
END; $$;

-- 2. Log a manual income or expense transaction
CREATE OR REPLACE FUNCTION log_transaction_and_update_balance(
    transaction_type TEXT,
    transaction_amount DECIMAL,
    transaction_description TEXT DEFAULT ''
) RETURNS DECIMAL LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    new_balance DECIMAL;
    balance_delta DECIMAL;
BEGIN
    IF transaction_type NOT IN ('income','expense','bill','recharge') THEN
        RAISE EXCEPTION 'Invalid transaction type';
    END IF;
    balance_delta := CASE WHEN transaction_type = 'income' THEN transaction_amount ELSE -transaction_amount END;
    UPDATE profiles SET balance = balance + balance_delta, updated_at = NOW()
    WHERE id = auth.uid() RETURNING balance INTO new_balance;
    IF new_balance < 0 THEN RAISE EXCEPTION 'INSUFFICIENT_FUNDS'; END IF;
    INSERT INTO transactions (user_id, type, amount, description, status)
    VALUES (auth.uid(), transaction_type, transaction_amount, transaction_description, 'completed');
    RETURN new_balance;
END; $$;

-- 3. Peer-to-peer transfer between two users
CREATE OR REPLACE FUNCTION transfer_funds(
    recipient_identifier TEXT,
    amount_to_transfer DECIMAL,
    note TEXT DEFAULT ''
) RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    sender_id UUID := auth.uid();
    recipient_profile RECORD;
    sender_balance DECIMAL;
BEGIN
    IF amount_to_transfer <= 0 THEN RAISE EXCEPTION 'INVALID_AMOUNT'; END IF;
    SELECT id, username INTO recipient_profile FROM profiles
    WHERE LOWER(email) = LOWER(recipient_identifier)
       OR LOWER(username) = LOWER(recipient_identifier)
    LIMIT 1;
    IF NOT FOUND THEN RAISE EXCEPTION 'RECIPIENT_NOT_FOUND'; END IF;
    IF recipient_profile.id = sender_id THEN RAISE EXCEPTION 'SELF_TRANSFER_ERROR'; END IF;
    SELECT balance INTO sender_balance FROM profiles WHERE id = sender_id;
    IF sender_balance < amount_to_transfer THEN RAISE EXCEPTION 'INSUFFICIENT_FUNDS'; END IF;
    UPDATE profiles SET balance = balance - amount_to_transfer WHERE id = sender_id;
    UPDATE profiles SET balance = balance + amount_to_transfer WHERE id = recipient_profile.id;
    INSERT INTO transactions (user_id, type, amount, description, status)
    VALUES (sender_id, 'expense', amount_to_transfer,
            COALESCE(NULLIF(note,''), 'Sent to ' || recipient_identifier), 'completed');
    INSERT INTO transactions (user_id, type, amount, description, status)
    VALUES (recipient_profile.id, 'income', amount_to_transfer,
            'Received from ' || COALESCE((SELECT username FROM profiles WHERE id = sender_id), 'user'), 'completed');
    RETURN 'Transfer successful';
END; $$;

-- 4. Create a group and add members
CREATE OR REPLACE FUNCTION create_group_with_members(
    group_name_param TEXT,
    member_ids_param UUID[]
) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    new_group_id UUID;
    member_id UUID;
BEGIN
    INSERT INTO groups (name, created_by) VALUES (group_name_param, auth.uid())
    RETURNING id INTO new_group_id;
    INSERT INTO group_members (group_id, user_id) VALUES (new_group_id, auth.uid())
    ON CONFLICT DO NOTHING;
    FOREACH member_id IN ARRAY member_ids_param LOOP
        INSERT INTO group_members (group_id, user_id) VALUES (new_group_id, member_id)
        ON CONFLICT DO NOTHING;
    END LOOP;
    RETURN new_group_id;
END; $$;

-- 5. Contribute funds from wallet to a group
CREATE OR REPLACE FUNCTION contribute_to_group(
    group_id_to_contribute UUID,
    amount_to_contribute DECIMAL
) RETURNS DECIMAL LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    user_balance DECIMAL;
    new_balance DECIMAL;
BEGIN
    IF amount_to_contribute <= 0 THEN RAISE EXCEPTION 'INVALID_AMOUNT'; END IF;
    SELECT balance INTO user_balance FROM profiles WHERE id = auth.uid();
    IF user_balance < amount_to_contribute THEN RAISE EXCEPTION 'INSUFFICIENT_FUNDS'; END IF;
    IF NOT EXISTS (SELECT 1 FROM group_members
                   WHERE group_id = group_id_to_contribute AND user_id = auth.uid()) THEN
        RAISE EXCEPTION 'NOT_A_MEMBER';
    END IF;
    UPDATE profiles SET balance = balance - amount_to_contribute
    WHERE id = auth.uid() RETURNING balance INTO new_balance;
    UPDATE group_members SET contribution_amount = contribution_amount + amount_to_contribute
    WHERE group_id = group_id_to_contribute AND user_id = auth.uid();
    UPDATE groups SET total_contribution = total_contribution + amount_to_contribute
    WHERE id = group_id_to_contribute;
    INSERT INTO transactions (user_id, type, amount, description, status)
    VALUES (auth.uid(), 'expense', amount_to_contribute, 'Group contribution', 'completed');
    RETURN new_balance;
END; $$;

-- 6. Withdraw contributed funds from a group back to wallet
CREATE OR REPLACE FUNCTION withdraw_from_group(
    group_id_to_withdraw_from UUID,
    amount_to_withdraw DECIMAL
) RETURNS DECIMAL LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    user_contribution DECIMAL;
    new_balance DECIMAL;
BEGIN
    IF amount_to_withdraw <= 0 THEN RAISE EXCEPTION 'INVALID_AMOUNT'; END IF;
    SELECT contribution_amount INTO user_contribution FROM group_members
    WHERE group_id = group_id_to_withdraw_from AND user_id = auth.uid();
    IF NOT FOUND THEN RAISE EXCEPTION 'NOT_A_MEMBER'; END IF;
    IF user_contribution < amount_to_withdraw THEN RAISE EXCEPTION 'INSUFFICIENT_CONTRIBUTION'; END IF;
    UPDATE profiles SET balance = balance + amount_to_withdraw
    WHERE id = auth.uid() RETURNING balance INTO new_balance;
    UPDATE group_members SET contribution_amount = contribution_amount - amount_to_withdraw
    WHERE group_id = group_id_to_withdraw_from AND user_id = auth.uid();
    UPDATE groups SET total_contribution = total_contribution - amount_to_withdraw
    WHERE id = group_id_to_withdraw_from;
    INSERT INTO transactions (user_id, type, amount, description, status)
    VALUES (auth.uid(), 'income', amount_to_withdraw, 'Group withdrawal', 'completed');
    RETURN new_balance;
END; $$;
```

---

## Smart Contract

### Contract Overview

`SimpleWallet.sol` is a Solidity contract deployed on the Ethereum Sepolia testnet. It stores per-address ETH balances and supports deposit, transfer (on-chain), and withdrawal.

```solidity
// Key functions:
function deposit() external payable          // Deposit ETH into the contract
function transfer(address to, uint256 amount) external  // Transfer to another address
function withdraw(uint256 amount) external   // Withdraw ETH back to your wallet
function getBalance() external view returns (uint256)   // Read your balance
```

Security features:
- **Reentrancy guard** — prevents reentrancy attacks on `withdraw()`
- **Max transfer limit** — 100 ETH per transaction
- **CEI pattern** — Checks-Effects-Interactions applied to `withdraw()`

> **Note:** The contract stores ETH balances separately from the FundFlow USD balance. When you deposit via MetaMask, the ETH goes into the contract and the equivalent USD amount (converted at `ETH_TO_USD_RATE`) is credited to your FundFlow balance in Supabase.

### Deploying to Sepolia

1. Get free Sepolia ETH from one of these faucets:
   - [sepoliafaucet.com](https://sepoliafaucet.com)
   - [faucet.sepolia.dev](https://faucet.sepolia.dev)
   - [alchemy.com/faucets/ethereum-sepolia](https://www.alchemy.com/faucets/ethereum-sepolia)

2. Open [remix.ethereum.org](https://remix.ethereum.org)

3. Create a new file `SimpleWallet.sol` and paste the contract code from `contracts/SimpleWallet.sol`

4. Compile: **Solidity Compiler** tab → select compiler `0.8.x` → click **Compile**

5. Deploy: **Deploy & Run Transactions** tab
   - Environment: **Injected Provider - MetaMask**
   - Make sure MetaMask is connected to **Sepolia**
   - Click **Deploy**
   - Confirm the transaction in MetaMask

6. Copy the deployed contract address from the **Deployed Contracts** section

7. Update `src/utils/constants.js`:
   ```js
   export const WALLET_CONTRACT_ADDRESS = '0xYOUR_NEW_CONTRACT_ADDRESS';
   ```

### Sepolia Network Config

| Field | Value |
|-------|-------|
| Network Name | Sepolia |
| Chain ID | 11155111 (`0xaa36a7`) |
| RPC URL | `https://sepolia.infura.io/v3/...` |
| Currency Symbol | SepoliaETH |
| Block Explorer | https://sepolia.etherscan.io |

---

## Application Pages

| Route | Component | Access | Description |
|-------|-----------|--------|-------------|
| `/` | `Landing.jsx` | Public | Marketing page |
| `/signin` | `SignIn.jsx` | Public | Email/password sign-in |
| `/signup` | `SignUp.jsx` | Public | Registration with username |
| `/dashboard` | `Dashboard.jsx` | Protected | Main app (redirects to `/signin` if not authenticated) |
| `/dashboard#home` | `HomeSection` | Protected | Default dashboard view |
| `/dashboard#payments` | `PaymentsSection` | Protected | Send money |
| `/dashboard#contacts` | `ContactsSection` | Protected | Contact management |
| `/dashboard#groups` | `GroupsSection` | Protected | Group wallets |
| `/dashboard#bills` | `BillsSection` | Protected | Bills (UI preview) |
| `/dashboard#activity` | `ActivitySection` | Protected | Transaction history |
| `/dashboard#settings` | `SettingsSection` | Protected | Profile settings |

---

## Dashboard Sections

### HomeSection
Displays a greeting, the `BalanceCard` (shows balance, UPI ID, Add Money + Send buttons, and this-month stats), 4 stat cards, a recent activity list, and a quick-send contact list. The Add Money button opens `AddMoneyModal`.

### PaymentsSection
Contains the Send Money form with a `datalist` for contact autocomplete. Validates recipient exists in the app, checks the amount against the user's live balance, prevents self-send, and calls the `transfer_funds` RPC. Shows payment history on the right.

### ContactsSection
Full-text searchable contact list. The Add Contact modal first calls `findUserByEmail` to verify the person exists in FundFlow before inserting into the `contacts` table. Clicking Send on any contact stores the email in `sessionStorage` and navigates to Payments, where it's auto-filled.

### GroupsSection
Renders a grid of `GroupItem` cards. The Create Group modal resolves each contact's email to their Supabase user ID (async), then calls `create_group_with_members`. Contribute and Withdraw modals enforce balance and contribution limits client-side before calling their respective RPC functions.

### ActivitySection
Shows running totals for income and expenses, pill-style type filters, a full-text search bar, and the complete transaction list in full mode (shows datetime, monospace ID, and status badge). The Log Transaction modal calls `log_transaction_and_update_balance`.

### BillsSection
8 category cards as a UI preview. All buttons are disabled with a "coming soon" banner. Autopay section shows an empty state.

### SettingsSection
Left column: profile form (read-only username/email, editable full name/phone). Right column: security status panel (email verified, password, 2FA) and a Web3 info panel showing network, contract name, and deposit method.

---

## State Management

FundFlow uses **Zustand** for global state. There are two stores:

### useAuthStore

```js
// State
user      // Supabase auth user object (null if signed out)
profile   // Database profile row (username, email, balance, etc.)
loading   // true during initial session check
error     // last auth error message

// Actions
initialize()              // Check existing session on app load
signIn(email, password)   // Sign in and fetch profile
signUp(email, password, username) // Register new user
signOut()                 // Sign out and clear state
fetchProfile()            // Re-fetch profile from database
updateProfile(data)       // Update full_name / phone_number
```

### useWalletStore

```js
// State
balance       // Current USD balance (number)
transactions  // Array of transaction objects
contacts      // Array of contact objects
groups        // Array of group objects with nested members

// Data fetching
loadAll(userId)           // Fetch everything in parallel
fetchBalance(userId)
fetchTransactions(userId)
fetchContacts(userId)
fetchGroups()

// RPC mutations (all return { success, error })
addFunds(amount, description)
logTransaction(type, amount, description)
transferFunds(recipient, amount, note)
createGroup(name, memberIds)
contributeToGroup(groupId, amount)
withdrawFromGroup(groupId, amount)

// Utility
findUserByEmail(email)    // Check if email belongs to a FundFlow user
addContact(userId, name, detail)
reset()                   // Clear all wallet state on sign-out
```

---

## MetaMask Integration

The `useMetaMask` hook encapsulates all Web3 logic behind a clean state machine.

### States

```
IDLE → CONNECTING → CONNECTED → SWITCHING → ON_SEPOLIA
                                                │
                                          ┌─────┴──────┐
                                      PROCESSING    (ready for deposit)
                                          │
                                       SUBMITTED
                                          │
                                       CONFIRMING
                                          │
                                    CONFIRMED / FAILED
```

### Usage

```jsx
const mm = useMetaMask();

// Connect and switch to Sepolia
await mm.connect();

// Deposit USD amount (converts to ETH internally)
const result = await mm.deposit(50); // $50
if (result.success) {
  console.log(result.txHash);
}

// Read state
mm.status       // current state machine status
mm.account      // connected wallet address
mm.txHash       // submitted transaction hash
mm.error        // last error message
mm.isConnected  // true when on Sepolia and ready
mm.isLoading    // true during any async operation

// Reset
mm.reset();
```

### Error Handling

The hook maps all ethers.js and MetaMask error codes to human-readable messages:

| Error Code | User Message |
|-----------|-------------|
| `4001` | "You rejected the request in MetaMask." |
| `-32002` | "MetaMask is already open. Check the extension." |
| `4902` | "Sepolia network not found. Please add it manually." |
| `INSUFFICIENT_FUNDS` | "Insufficient SepoliaETH to cover gas fees." |
| `TRANSACTION_REPLACED` | Handled transparently (uses replacement receipt) |

---

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub

2. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub

3. Configure:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

4. Add environment variables under **Settings → Environment Variables**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

5. Deploy

The `vercel.json` at the project root handles SPA routing (prevents 404 on hard refresh):

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Netlify

1. Push to GitHub

2. Go to [app.netlify.com](https://app.netlify.com) → Add new site → Import from GitHub

3. Configure:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`

4. Add environment variables under **Site configuration → Environment variables**

5. Add a `_redirects` file to the `public/` folder:
   ```
   /* /index.html 200
   ```

### Build for Production

```bash
npm run build
# Output is in dist/
```

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | ✅ Yes | Your Supabase project URL, e.g. `https://abc123.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | ✅ Yes | Your Supabase anon/public key |

All environment variables must be prefixed with `VITE_` to be exposed to the Vite frontend bundle.

The smart contract address and Sepolia network configuration are hardcoded in `src/utils/constants.js` since they are public chain data — not secrets.

---

## Known Limitations

| Limitation | Notes |
|-----------|-------|
| **Bills section is UI-only** | Real payment gateway integration for bills is not implemented |
| **ETH/USD rate is hardcoded** | `ETH_TO_USD_RATE = 3500` in `constants.js`. For production, this should be fetched from a price oracle |
| **Sepolia testnet only** | The smart contract is on testnet. Mainnet deployment would require an audit |
| **No real 2FA** | The security panel shows 2FA as "Off" — implementation is planned |
| **No password reset** | "Forgot password" link is present but not wired up |
| **Group members must be contacts** | You can only add FundFlow users who are already in your contacts list to a group |
| **No file uploads** | Profile picture is an initial avatar — no image upload |
| **Balance in USD only** | The app operates in USD with ETH used only for blockchain deposits |

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you'd like to change.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## Authors

- **Akshat Prashar** — [@akshat20000](https://github.com/akshat20000)
- **Aaryan**

---

## License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">
  Built with React, Supabase & Ethereum · © 2025 FundFlow
</div>
