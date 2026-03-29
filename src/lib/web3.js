import { ethers } from 'ethers';
import { WALLET_CONTRACT_ADDRESS, WALLET_CONTRACT_ABI, SEPOLIA_CHAIN_ID, SEPOLIA_RPC_URL, SEPOLIA_EXPLORER_URL } from '@/utils/constants';

// Get ethers Web3Provider from MetaMask
export function getProvider() {
  if (!window.ethereum) throw new Error('MetaMask not found. Please install MetaMask.');
  return new ethers.providers.Web3Provider(window.ethereum, 'any');
}

// Request MetaMask accounts and return first
export async function connectWallet() {
  if (!window.ethereum) throw new Error('MetaMask not found. Please install MetaMask.');
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
  if (!accounts || accounts.length === 0) throw new Error('No accounts found or access denied.');
  return accounts[0];
}

// Ensure user is on Sepolia; switch/add if not
export async function ensureSepoliaNetwork(provider) {
  const network = await provider.getNetwork();
  const currentChainId = `0x${network.chainId.toString(16)}`;
  if (currentChainId === SEPOLIA_CHAIN_ID) return;

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: SEPOLIA_CHAIN_ID }],
    });
    // Wait for provider to update
    await new Promise(r => setTimeout(r, 600));
  } catch (err) {
    if (err.code === 4902) {
      // Chain not in MetaMask — add it
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: SEPOLIA_CHAIN_ID,
          chainName: 'Sepolia',
          nativeCurrency: { name: 'SepoliaETH', symbol: 'SepoliaETH', decimals: 18 },
          rpcUrls: [SEPOLIA_RPC_URL],
          blockExplorerUrls: [SEPOLIA_EXPLORER_URL],
        }],
      });
      await new Promise(r => setTimeout(r, 600));
    } else if (err.code === 4001) {
      throw new Error('You rejected the network switch request.');
    } else {
      throw new Error(`Failed to switch network: ${err.message}`);
    }
  }
}

// Build contract instance with signer
export function getWalletContract(signer) {
  return new ethers.Contract(WALLET_CONTRACT_ADDRESS, WALLET_CONTRACT_ABI, signer);
}

export { SEPOLIA_EXPLORER_URL };