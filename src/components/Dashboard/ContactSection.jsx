import { useState } from 'react';
import useWalletStore from '@/store/useWalletStore';
import useAuthStore from '@/store/useAuthStore';
import { ContactItem, SectionHeader, SearchInput } from '@/components/shared';
import { Card, CardHeader, Modal, Alert, EmptyState, Spinner } from '@/components/ui';

export default function ContactsSection({ onNavigate }) {
  const { contacts, loadingContacts, findUserByEmail, addContact } = useWalletStore();
  const { user } = useAuthStore();

  const [search,     setSearch]     = useState('');
  const [modalOpen,  setModalOpen]  = useState(false);
  const [form,       setForm]       = useState({ name: '', email: '' });
  const [formErr,    setFormErr]    = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg,  setSubmitMsg]  = useState(null);

  // Filtered contacts
  const filtered = contacts.filter(c => {
    const t = search.toLowerCase();
    return c.name.toLowerCase().includes(t) || (c.detail || '').toLowerCase().includes(t);
  });

  // Handle send → navigate to payments pre-filled
  function handleSend(contact) {
    sessionStorage.setItem('ff_send_to', contact.detail);
    onNavigate('payments');
  }

  function openModal() {
    setForm({ name: '', email: '' });
    setFormErr({});
    setSubmitMsg(null);
    setModalOpen(true);
  }

  function handleChange(field) {
    return (e) => {
      setForm(f => ({ ...f, [field]: e.target.value }));
      if (formErr[field]) setFormErr(er => ({ ...er, [field]: '' }));
      if (submitMsg) setSubmitMsg(null);
    };
  }

  function validate() {
    const e = {};
    if (!form.name.trim())  e.name  = 'Name is required.';
    if (!form.email.trim()) e.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email.';
    return e;
  }

  async function handleAddContact(e) {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) { setFormErr(v); return; }

    setSubmitting(true);
    setSubmitMsg(null);

    // 1. Check if user exists in FundFlow
    const found = await findUserByEmail(form.email.trim());
    if (!found) {
      setSubmitMsg({ success: false, message: 'No FundFlow user found with that email.' });
      setSubmitting(false);
      return;
    }

    // 2. Add to contacts
    const res = await addContact(user.id, form.name.trim(), form.email.trim());
    if (res.success) {
      setSubmitMsg({ success: true, message: `${form.name} added to your contacts!` });
      setForm({ name: '', email: '' });
      setTimeout(() => setModalOpen(false), 1200);
    } else {
      setSubmitMsg({ success: false, message: res.error });
    }
    setSubmitting(false);
  }

  return (
    <div>
      <SectionHeader title="Contacts" subtitle={`${contacts.length} saved contact${contacts.length !== 1 ? 's' : ''}`}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search contacts..." />
        <button
          onClick={openModal}
          className="btn-primary text-sm"
        >
          <i className="fas fa-plus" />
          Add Contact
        </button>
      </SectionHeader>

      <Card>
        <CardHeader title="All Contacts" icon="fa-address-book" />

        {loadingContacts ? (
          <div className="flex items-center justify-center py-12 gap-3">
            <Spinner size="md" className="text-cyan" />
            <span className="text-secondary-text text-sm">Loading contacts...</span>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={search ? 'fa-search' : 'fa-user-plus'}
            message={search
              ? `No contacts matching "${search}"`
              : 'No contacts yet. Add your first contact above.'
            }
          />
        ) : (
          <div>
            {filtered.map(c => (
              <ContactItem key={c.id} contact={c} onSend={handleSend} />
            ))}
          </div>
        )}
      </Card>

      {/* ── Add Contact Modal ── */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Contact"
        icon="fa-user-plus"
      >
        {submitMsg && (
          <div className="mb-4">
            <Alert message={submitMsg.message} variant={submitMsg.success ? 'success' : 'danger'} />
          </div>
        )}

        <form onSubmit={handleAddContact} noValidate>
          <div className="mb-4">
            <label className="ff-label">Contact Name</label>
            <input
              type="text"
              value={form.name}
              onChange={handleChange('name')}
              placeholder="e.g. Jane Doe"
              className={`ff-input ${formErr.name ? 'border-negative/50' : ''}`}
              disabled={submitting}
            />
            {formErr.name && <p className="mt-1.5 text-xs text-negative">{formErr.name}</p>}
          </div>

          <div className="mb-6">
            <label className="ff-label">FundFlow Email</label>
            <div className="relative">
              <i className="fas fa-envelope absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-text text-sm pointer-events-none" />
              <input
                type="email"
                value={form.email}
                onChange={handleChange('email')}
                placeholder="their@email.com"
                className={`ff-input pl-10 ${formErr.email ? 'border-negative/50' : ''}`}
                disabled={submitting}
              />
            </div>
            {formErr.email && <p className="mt-1.5 text-xs text-negative">{formErr.email}</p>}
            <p className="mt-1.5 text-2xs text-muted-text">
              We'll verify this email exists in FundFlow before adding.
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-cyan text-void
              font-bold text-sm rounded-lg py-3.5 border-none cursor-pointer
              transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            style={!submitting ? { boxShadow: '0 4px 20px rgba(0,212,255,0.25)' } : {}}
          >
            {submitting ? (
              <><i className="fas fa-spinner animate-spin-slow" /> Checking...</>
            ) : (
              <><i className="fas fa-check" /> Add Contact</>
            )}
          </button>
        </form>
      </Modal>
    </div>
  );
}