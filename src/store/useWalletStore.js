import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { getOrFetch, invalidate,TTL } from '@/utils/cache';
import { Keys } from '../utils/cache';


const useWalletStore = create((set, get) => ({
  // ── State ──
  balance:      0,
  transactions: [],
  contacts:     [],
  groups:       [],

  // Loading flags per resource
  loadingBalance:      false,
  loadingTransactions: false,
  loadingContacts:     false,
  loadingGroups:       false,

  // ── Setters (for direct updates from RPC responses) ──
  setBalance: (balance) => set({ balance: parseFloat(balance) || 0 }),

  // ── Fetch Balance & Profile ──
  fetchBalance: async (userId) => {
    if (!userId) return;
    set({ loadingBalance: true });
    const data = await getOrFetch(
    keys.profile(userId),
    async () => {
      const { data } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', userId)
        .maybeSingle();
      return data;
    },
    TTL.PROFILE
  );

  set({ balance: parseFloat(data?.balance || 0), loadingBalance: false });
},

  // ── Fetch Transactions ──
  fetchTransactions: async (userId) => {
  if (!userId) return;
  set({ loadingTransactions: true });

  const data = await getOrFetch(
    keys.transactions(userId),
    async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false });
      if (error) throw error;
      return data;
    },
    TTL.TRANSACTIONS
  );

  const parsed = (data || []).map(tx => ({
    ...tx,
    amount: parseFloat(tx.amount) || 0,
    timestamp: tx.timestamp ? new Date(tx.timestamp) : null,
  }));

  set({ transactions: parsed, loadingTransactions: false });
},

  // ── Fetch Contacts ──
  fetchContacts: async (userId) => {
  if (!userId) return;
  set({ loadingContacts: true });

  const data = await getOrFetch(
    keys.contacts(userId),
    async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', userId)
        .order('name', { ascending: true });
      if (error) throw error;
      return data;
    },
    TTL.CONTACTS
  );

  set({ contacts: data || [], loadingContacts: false });
},

  // ── Add Contact ──
  addContact: async (userId, name, detail) => {
    const { error } = await supabase
      .from('contacts')
      .insert({ user_id: userId, name: name.trim(), detail: detail.trim() });

    if (error) {
      if (error.code === '23505') return { success: false, error: 'Contact already exists.' };
      return { success: false, error: error.message };
    }

    await invalidate(keys.contacts(userId));
    await get().fetchContacts(userId);
    return { success: true };
  },

  // ── Find user by email (for adding contacts / groups) ──
  findUserByEmail: async (email) => {
    const { data } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle();
    return data;
  },

  // ── Fetch Groups ──
  fetchGroups: async () => {
  set({ loadingGroups: true });

  // Groups are user-specific but we don't have userId here easily.
  // Use a key based on the Supabase auth user instead.
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) { set({ loadingGroups: false }); return { error: null }; }

  const data = await getOrFetch(
    keys.groups(user.id),
    async () => {
      const { data, error } = await supabase
        .from('groups')
        .select(`
          id, name, created_by, total_contribution, created_at,
          group_members!inner (
            user_id, contribution_amount,
            profiles ( id, username, email )
          )
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    TTL.GROUPS
  );

  set({ groups: data || [], loadingGroups: false });
  return { error: null };
},

  // ── RPC: Add funds ──
  addFunds: async (amount, description = 'Added funds via web') => {
  const { data: newBalance, error } = await supabase.rpc('add_funds_and_log', {
    amount_to_add: amount,
    description_text: description,
  });
  if (error) return { success: false, error: error.message };

  const { data: { user } } = await supabase.auth.getUser();
  // Invalidate so next fetch goes to Supabase not cache
  await invalidate(keys.profile(user.id), keys.transactions(user.id));

  set({ balance: parseFloat(newBalance) });
  return { success: true, newBalance: parseFloat(newBalance) };
},

  // ── RPC: Log transaction ──
  logTransaction: async (type, amount, description) => {
  const { data: newBalance, error } = await supabase.rpc('log_transaction_and_update_balance', {
    transaction_type: type,
    transaction_amount: amount,
    transaction_description: description || '',
  });
  if (error) {
    const msg = error.message.includes('INSUFFICIENT_FUNDS') ? 'Insufficient balance.' : error.message;
    return { success: false, error: msg };
  }

  const { data: { user } } = await supabase.auth.getUser();
  await invalidate(keys.profile(user.id), keys.transactions(user.id));

  set({ balance: parseFloat(newBalance) });
  return { success: true };
},

  // ── RPC: Transfer funds ──
  transferFunds: async (recipientIdentifier, amount, note = '') => {
  const { data, error } = await supabase.rpc('transfer_funds', {
    recipient_identifier: recipientIdentifier.trim(),
    amount_to_transfer: parseFloat(amount.toFixed(2)),
    note,
  });
  if (error) {
    let msg = error.message;
    if (msg.includes('INSUFFICIENT_FUNDS'))  msg = 'Insufficient funds.';
    if (msg.includes('RECIPIENT_NOT_FOUND')) msg = `Recipient "${recipientIdentifier}" not found.`;
    if (msg.includes('SELF_TRANSFER_ERROR')) msg = 'Cannot send funds to yourself.';
    if (msg.includes('INVALID_AMOUNT'))      msg = 'Amount must be positive.';
    return { success: false, error: msg };
  }

  const { data: { user } } = await supabase.auth.getUser();
  await invalidate(keys.profile(user.id), keys.transactions(user.id));

  return { success: true, message: data };
},

  // ── RPC: Create group ──
  createGroup: async (groupName, memberIds) => {
    const { data, error } = await supabase.rpc('create_group_with_members', {
      group_name_param: groupName,
      member_ids_param: [...new Set(memberIds)],
    });
    if (error) return { success: false, error: error.message };
    await get().fetchGroups();
    return { success: true, data };
  },

  // ── RPC: Contribute to group ──
  contributeToGroup: async (groupId, amount) => {
  const { data: newBalance, error } = await supabase.rpc('contribute_to_group', {
    group_id_to_contribute: groupId,
    amount_to_contribute: amount,
  });
  if (error) {
    let msg = error.message;
    if (msg.includes('INSUFFICIENT_FUNDS')) msg = 'Insufficient wallet balance.';
    if (msg.includes('NOT_A_MEMBER'))       msg = 'You are not a member of this group.';
    return { success: false, error: msg };
  }

  const { data: { user } } = await supabase.auth.getUser();
  await invalidate(
    keys.profile(user.id),
    keys.transactions(user.id),
    keys.groups(user.id)
  );

  set({ balance: parseFloat(newBalance) });
  await get().fetchGroups();
  return { success: true };
},


  // ── RPC: Withdraw from group ──
  withdrawFromGroup: async (groupId, amount) => {
    const { data: newBalance, error } = await supabase.rpc('withdraw_from_group', {
      group_id_to_withdraw_from: groupId,
      amount_to_withdraw: amount,
    });
    if (error) {
      let msg = error.message;
      if (msg.includes('INSUFFICIENT_CONTRIBUTION')) msg = 'Withdrawal exceeds your contribution.';
      if (msg.includes('NOT_A_MEMBER'))              msg = 'You are not a member of this group.';
      return { success: false, error: msg };
    }

    const { data: { user } } = await supabase.auth.getUser();
  await invalidate(
    keys.profile(user.id),
    keys.transactions(user.id),
    keys.groups(user.id)
  );

    set({ balance: parseFloat(newBalance) });
    await get().fetchGroups();
    return { success: true };
  },

  // ── Load everything for the logged-in user ──
  loadAll: async (userId) => {
    await Promise.all([
      get().fetchBalance(userId),
      get().fetchTransactions(userId),
      get().fetchContacts(userId),
      get().fetchGroups(userId),
    ]);
  },

  // ── Reset on logout ──
  reset: () => set({
    balance: 0, transactions: [], contacts: [], groups: [],
  }),
}));

export default useWalletStore;