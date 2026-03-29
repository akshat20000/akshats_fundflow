// Stub — will be replaced in Section 3
import useAuthStore from '@/store/useAuthStore';
import useWalletStore from '@/store/useWalletStore';
import { Spinner } from '@/components/ui';

export default function Dashboard() {
  const { profile, signOut } = useAuthStore();
  const { balance } = useWalletStore();

  return (
    <div className="min-h-screen bg-main flex items-center justify-center">
      <div className="text-center">
        <i className="fas fa-wallet text-cyan text-4xl mb-4 block"
          style={{ filter: 'drop-shadow(0 0 12px rgba(0,212,255,0.5))' }} />
        <h1 className="font-display text-2xl font-bold text-primary-text mb-2">
          Welcome, {profile?.username || profile?.email || 'User'}
        </h1>
        <p className="text-secondary-text mb-1 text-sm">Balance: <span className="text-positive font-bold">${balance.toFixed(2)}</span></p>
        <p className="text-muted-text text-xs mb-8">Dashboard coming in Section 3</p>
        <button onClick={signOut}
          className="text-xs text-muted-text hover:text-negative transition-colors bg-transparent border-none cursor-pointer">
          Sign out
        </button>
      </div>
    </div>
  );
}