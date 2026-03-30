import { useState, useCallback, useRef } from 'react';
import { ethers } from 'ethers';
import {
  getProvider,
  connectWallet,
  ensureSepoliaNetwork,
  getWalletContract,
  SEPOLIA_EXPLORER_URL,
} from '@/lib/web3';
import { ETH_TO_USD_RATE } from '@/utils/constants';

// Status machine states
export const MM_STATUS = {
  IDLE:         'idle',
  CONNECTING:   'connecting',
  CONNECTED:    'connected',
  SWITCHING:    'switching_network',
  ON_SEPOLIA:   'on_sepolia',
  PROCESSING:   'processing',
  SUBMITTED:    'submitted',
  CONFIRMING:   'confirming',
  CONFIRMED:    'confirmed',
  FAILED:       'failed',
};

const INITIAL_STATE = {
  status:    MM_STATUS.IDLE,
  account:   null,
  txHash:    null,
  error:     null,
};

export default function useMetaMask() {
  const [state,   setState]   = useState(INITIAL_STATE);
  const providerRef            = useRef(null);
  const signerRef              = useRef(null);
  const contractRef            = useRef(null);

  const patch = (updates) => setState(s => ({ ...s, ...updates }));

  // ── Reset ──
  const reset = useCallback(() => {
    setState(INITIAL_STATE);
    providerRef.current  = null;
    signerRef.current    = null;
    contractRef.current  = null;
  }, []);

  // ── Connect MetaMask ──
  const connect = useCallback(async () => {
    patch({ status: MM_STATUS.CONNECTING, error: null });

    try {
      // Check MetaMask installed
      if (!window.ethereum) {
        patch({ status: MM_STATUS.FAILED, error: 'MetaMask not found. Please install MetaMask.' });
        return false;
      }

      // Request accounts
      const account = await connectWallet();
      patch({ account, status: MM_STATUS.CONNECTED });

      // Build provider + signer + contract
      const provider = getProvider();
      const signer   = provider.getSigner();
      const contract = getWalletContract(signer);

      providerRef.current  = provider;
      signerRef.current    = signer;
      contractRef.current  = contract;

      // Switch to Sepolia
      patch({ status: MM_STATUS.SWITCHING });
      await ensureSepoliaNetwork(provider);
      patch({ status: MM_STATUS.ON_SEPOLIA });

      // Listen for account / chain changes
      window.ethereum.removeAllListeners?.('accountsChanged');
      window.ethereum.removeAllListeners?.('chainChanged');

      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          patch({ status: MM_STATUS.IDLE, account: null, error: 'MetaMask disconnected.' });
        } else {
          patch({ account: accounts[0] });
        }
      });

      window.ethereum.on('chainChanged', () => {
        // Safest approach on chain change: reset and ask user to reconnect
        patch({ status: MM_STATUS.IDLE, error: 'Network changed. Please reconnect.' });
      });

      return true;
    } catch (err) {
      const msg = mapError(err);
      patch({ status: MM_STATUS.FAILED, error: msg });
      return false;
    }
  }, []);

  // ── Deposit: USD amount → ETH → contract ──
  const deposit = useCallback(async (usdAmount) => {
    if (!contractRef.current || !signerRef.current) {
      patch({ error: 'Not connected. Please connect MetaMask first.' });
      return { success: false };
    }

    patch({ status: MM_STATUS.PROCESSING, error: null, txHash: null });

    try {
      const ethAmount = usdAmount / ETH_TO_USD_RATE;
      const ethValue  = ethers.utils.parseEther(ethAmount.toFixed(18));

      console.log(`Depositing ${ethers.utils.formatEther(ethValue)} ETH ($${usdAmount})`);

      patch({ status: MM_STATUS.SUBMITTED });
      const tx = await contractRef.current.deposit({ value: ethValue });

      patch({ txHash: tx.hash, status: MM_STATUS.CONFIRMING });

      let receipt;
      try {
        receipt = await tx.wait(1);
      } catch (waitErr) {
        if (waitErr.code === 'TRANSACTION_REPLACED' && !waitErr.cancelled) {
          receipt = waitErr.receipt;
        } else {
          throw waitErr;
        }
      }

      if (receipt?.status === 1) {
        patch({ status: MM_STATUS.CONFIRMED });
        return { success: true, txHash: receipt.transactionHash };
      } else {
        throw new Error('Transaction reverted on-chain.');
      }
    } catch (err) {
      const msg = mapError(err);
      patch({ status: MM_STATUS.FAILED, error: msg });
      return { success: false, error: msg };
    }
  }, []);

  // ── Explorer URL for a tx hash ──
  const explorerUrl = (hash) => `${SEPOLIA_EXPLORER_URL}/tx/${hash}`;

  return {
    ...state,
    connect,
    deposit,
    reset,
    explorerUrl,
    isConnected: state.status === MM_STATUS.ON_SEPOLIA || state.status === MM_STATUS.CONFIRMED,
    isLoading:   [MM_STATUS.CONNECTING, MM_STATUS.SWITCHING, MM_STATUS.PROCESSING,
                  MM_STATUS.SUBMITTED,  MM_STATUS.CONFIRMING].includes(state.status),
  };
}

// ── Map ethers / MetaMask errors to human messages ──
function mapError(err) {
  if (!err) return 'An unknown error occurred.';
  const code = err.code;
  const msg  = (err.message || '').toLowerCase();

  if (code === 4001 || msg.includes('user rejected')) return 'You rejected the request in MetaMask.';
  if (code === -32002)                                  return 'MetaMask is already open. Check the extension.';
  if (code === 4902)                                    return 'Sepolia network not found. Please add it manually.';
  if (msg.includes('insufficient funds'))               return 'Insufficient SepoliaETH to cover gas fees.';
  if (msg.includes('metamask not found'))               return 'MetaMask not found. Please install MetaMask.';
  if (msg.includes('network changed'))                  return 'Network changed. Please reconnect.';
  if (err.reason)                                       return err.reason.replace('execution reverted: ', '');
  return err.message || 'Transaction failed.';
}