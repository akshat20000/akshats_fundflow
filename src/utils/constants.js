// ── Smart Contract ──
export const WALLET_CONTRACT_ADDRESS = '0xbf3c70F804a92fBe17e0C18DA7347559Bc6B5ae4';

export const WALLET_CONTRACT_ABI = [
  'function deposit() public payable',
  'function transfer(address to, uint256 amount) public',
  'function withdraw(uint256 amount) public',
  'function getBalance() public view returns (uint256)',
  'function getContractBalance() public view returns (uint256)',
  'event Deposit(address indexed user, uint256 amount)',
  'event Transfer(address indexed from, address indexed to, uint256 amount)',
  'event Withdrawal(address indexed user, uint256 amount)',
];

// ── Sepolia Network ──
export const SEPOLIA_CHAIN_ID    = '0xaa36a7';   // 11155111
export const SEPOLIA_RPC_URL     = 'https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161';
export const SEPOLIA_EXPLORER_URL = 'https://sepolia.etherscan.io';

// ── Conversion ──
export const ETH_TO_USD_RATE = 3500; // $3500 per ETH (adjust as needed)

// ── Sidebar nav items ──
export const NAV_ITEMS = [
  { id: 'home',     label: 'Home',            icon: 'fa-home' },
  { id: 'payments', label: 'Payments',        icon: 'fa-exchange-alt' },
  { id: 'contacts', label: 'Contacts',        icon: 'fa-address-book' },
  { id: 'groups',   label: 'Groups',          icon: 'fa-users' },
  { id: 'bills',    label: 'Bills & Recharge', icon: 'fa-file-invoice-dollar' },
  { id: 'activity', label: 'Activity',        icon: 'fa-list-alt' },
  { id: 'settings', label: 'Settings',        icon: 'fa-cog' },
];