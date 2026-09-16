'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  PhxButton,
  PhxChip,
  PhxChipGroup,
  PhxDataTable,
  PhxIconButton,
  PhxModal,
  PhxSelect,
  PhxSnackbar,
  PhxTextField,
} from '@Allegion/phoenix-react';
import type { DataTableColumn, DataTableBulkAction } from '@Allegion/phoenix-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type CredentialStatus = 'active' | 'expiring' | 'expired' | 'revoked';
type StatusFilter = 'all' | CredentialStatus;

interface Credential {
  id: string;
  name: string;
  keyId: string;
  status: CredentialStatus;
  createdAt: string;
  createdBy: string;
  expiresAt: string | null;
  lastUsed: string | null;
  scopes: string;
}

type ModalState =
  | { kind: 'none' }
  | { kind: 'create' }
  | { kind: 'key-reveal'; keyValue: string; name: string; isRotation: boolean }
  | { kind: 'rotate-confirm'; credential: Credential }
  | { kind: 'revoke-confirm'; credential: Credential }
  | { kind: 'bulk-revoke-confirm'; eligibleIds: string[] };

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<CredentialStatus, string> = {
  active:   'Active',
  expiring: 'Expiring Soon',
  expired:  'Expired',
  revoked:  'Revoked',
};

const STATUS_CHIP_VARIANT: Record<CredentialStatus, string> = {
  active:   'success',
  expiring: 'warning',
  expired:  'error',
  revoked:  'neutral',
};

const STATUS_FILTERS: Array<{ value: StatusFilter; label: string }> = [
  { value: 'all',      label: 'All'           },
  { value: 'active',   label: 'Active'        },
  { value: 'expiring', label: 'Expiring Soon' },
  { value: 'expired',  label: 'Expired'       },
  { value: 'revoked',  label: 'Revoked'       },
];

const SCOPE_OPTIONS = [
  { value: 'read-only',        label: 'Read Only (doors, users, reports)' },
  { value: 'read-write-doors', label: 'Read/Write Doors'                  },
  { value: 'full-access',      label: 'Full Access (all resources)'        },
  { value: 'admin',            label: 'Admin (all + org management)'       },
];

const SCOPE_DISPLAY: Record<string, string> = {
  'read-only':        'read:doors · read:users · read:reports',
  'read-write-doors': 'read:doors · write:doors',
  'full-access':      'read:doors · write:doors · read:users · write:users · read:reports',
  'admin':            'read:* · write:* · admin',
};

const EXPIRATION_OPTIONS = [
  { value: '30d',  label: '30 days'       },
  { value: '90d',  label: '90 days'       },
  { value: '1y',   label: '1 year'        },
  { value: '2y',   label: '2 years'       },
  { value: 'none', label: 'No expiration' },
];

const EXPIRATION_DISPLAY: Record<string, string | null> = {
  '30d':  'Jul 11, 2026',
  '90d':  'Sep 9, 2026',
  '1y':   'Jun 11, 2027',
  '2y':   'Jun 11, 2028',
  'none': null,
};

// ─── Fake data ────────────────────────────────────────────────────────────────

const INITIAL_CREDENTIALS: Credential[] = [
  {
    id: '1', name: 'Production API', keyId: 'sk_live_4Xm9...kL3p',
    status: 'active', createdAt: 'Jan 12, 2026', createdBy: 'Alice Johnson',
    expiresAt: 'Dec 31, 2026', lastUsed: '2 hours ago',
    scopes: 'read:doors · write:doors',
  },
  {
    id: '2', name: 'Reporting Service', keyId: 'sk_live_2Rf7...pQ8n',
    status: 'expiring', createdAt: 'Mar 3, 2025', createdBy: 'Bob Chen',
    expiresAt: 'Jul 1, 2026', lastUsed: 'Yesterday',
    scopes: 'read:reports',
  },
  {
    id: '3', name: 'Mobile App Backend', keyId: 'sk_live_9Yw2...mN5t',
    status: 'active', createdAt: 'Feb 18, 2026', createdBy: 'Alice Johnson',
    expiresAt: 'Feb 18, 2027', lastUsed: '5 min ago',
    scopes: 'read:doors · read:users',
  },
  {
    id: '4', name: 'Legacy Sync Tool', keyId: 'sk_live_7Bk1...xH6r',
    status: 'expired', createdAt: 'Jan 5, 2025', createdBy: 'Carol Martinez',
    expiresAt: 'Jan 5, 2026', lastUsed: '3 months ago',
    scopes: 'read:doors · write:doors · read:users',
  },
  {
    id: '5', name: 'Webhook Listener', keyId: 'sk_live_3Qd4...vF2c',
    status: 'revoked', createdAt: 'Nov 22, 2024', createdBy: 'David Kim',
    expiresAt: null, lastUsed: '45 days ago',
    scopes: 'read:doors',
  },
  {
    id: '6', name: 'Analytics Dashboard', keyId: 'sk_live_8Zp5...jG9w',
    status: 'active', createdAt: 'Apr 1, 2026', createdBy: 'Eva Patel',
    expiresAt: 'Apr 1, 2027', lastUsed: '1 day ago',
    scopes: 'read:reports · read:users',
  },
  {
    id: '7', name: 'Dev Integration Test', keyId: 'sk_live_6Nc8...aE4s',
    status: 'expiring', createdAt: 'Jun 15, 2025', createdBy: 'Bob Chen',
    expiresAt: 'Jun 25, 2026', lastUsed: '1 week ago',
    scopes: 'read:doors · write:doors · write:users · read:reports',
  },
  {
    id: '8', name: 'Old Webhook (Deprecated)', keyId: 'sk_live_1Lt3...oW7b',
    status: 'revoked', createdAt: 'Aug 10, 2024', createdBy: 'Carol Martinez',
    expiresAt: null, lastUsed: '6 months ago',
    scopes: 'read:doors',
  },
];

// ─── Column definitions (static — no handler refs needed) ─────────────────────

const TABLE_COLUMNS: DataTableColumn<Credential>[] = [
  {
    key: 'name',
    header: 'Name',
    cell: row => row.name,
    sortable: true,
    supportingText: row => row.scopes,
  },
  {
    key: 'keyId',
    header: 'Key ID',
    cell: row => row.keyId,
    cellLeadingIcon: 'key',
  },
  {
    key: 'status',
    header: 'Status',
    cell: row => STATUS_LABELS[row.status],
    cellType: 'chip',
    chipVariant: (row: Credential) => STATUS_CHIP_VARIANT[row.status],
    sortable: true,
    width: 160,
  },
  {
    key: 'expiresAt',
    header: 'Expires',
    cell: row => row.expiresAt ?? 'No expiration',
    sortable: true,
    sortValue: row => row.expiresAt ?? '9999-12-31',
    width: 150,
  },
  {
    key: 'lastUsed',
    header: 'Last Used',
    cell: row => row.lastUsed ?? 'Never',
    width: 130,
  },
  {
    key: 'createdBy',
    header: 'Created By',
    cell: row => row.createdBy,
    sortable: true,
    width: 160,
  },
  {
    key: 'actions',
    header: '',
    cell: () => '',
    width: 88,
    align: 'center',
  },
];

// ─── Key generator (client-side fake) ────────────────────────────────────────

function generateFakeKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let n = Date.now();
  let result = '';
  for (let i = 0; i < 40; i++) {
    n = (n * 1664525 + 1013904223) & 0x7fffffff;
    result += chars[n % chars.length];
  }
  return 'sk_live_' + result;
}

let nextId = 100;

// ─── Page component ───────────────────────────────────────────────────────────

export default function CredentialsPage() {
  const [credentials, setCredentials] = useState<Credential[]>(INITIAL_CREDENTIALS);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [modal, setModal] = useState<ModalState>({ kind: 'none' });
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
  const [snackbar, setSnackbar] = useState<string | null>(null);

  // Create form state
  const [createName, setCreateName] = useState('');
  const [createScope, setCreateScope] = useState('');
  const [createExpiration, setCreateExpiration] = useState('');

  // ── Helpers ────────────────────────────────────────────────────────────────

  const showSnackbar = useCallback((message: string) => {
    setSnackbar(message);
  }, []);

  const resetCreateForm = useCallback(() => {
    setCreateName('');
    setCreateScope('');
    setCreateExpiration('');
  }, []);

  // ── Filtered data ──────────────────────────────────────────────────────────

  const filteredData = useMemo(
    () => statusFilter === 'all'
      ? credentials
      : credentials.filter(c => c.status === statusFilter),
    [credentials, statusFilter],
  );

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleCreate = useCallback(() => {
    if (!createName.trim()) return;
    const newKey = generateFakeKey();
    const id = String(++nextId);
    setCredentials(prev => [{
      id,
      name: createName.trim(),
      keyId: `sk_live_${createName.slice(0, 4).toUpperCase()}...${id.padStart(4, '0')}`,
      status: 'active',
      createdAt: 'Jun 11, 2026',
      createdBy: 'Demo User',
      expiresAt: createExpiration ? EXPIRATION_DISPLAY[createExpiration] : null,
      lastUsed: null,
      scopes: createScope ? SCOPE_DISPLAY[createScope] : 'read:doors',
    }, ...prev]);
    setModal({ kind: 'key-reveal', keyValue: newKey, name: createName.trim(), isRotation: false });
    resetCreateForm();
  }, [createName, createScope, createExpiration, resetCreateForm]);

  const handleRotateConfirm = useCallback((credential: Credential) => {
    const newKey = generateFakeKey();
    setCredentials(prev =>
      prev.map(c => c.id === credential.id
        ? { ...c, keyId: `sk_live_ROT_...${c.id.padStart(4, '0')}`, lastUsed: 'Just now' }
        : c),
    );
    setModal({ kind: 'key-reveal', keyValue: newKey, name: credential.name, isRotation: true });
  }, []);

  const handleRevokeConfirm = useCallback((credential: Credential) => {
    setCredentials(prev =>
      prev.map(c => c.id === credential.id ? { ...c, status: 'revoked' } : c),
    );
    setModal({ kind: 'none' });
    showSnackbar(`"${credential.name}" has been revoked`);
  }, [showSnackbar]);

  const handleBulkRevokeConfirm = useCallback((eligibleIds: string[]) => {
    const idSet = new Set(eligibleIds);
    setCredentials(prev =>
      prev.map(c => idSet.has(c.id) ? { ...c, status: 'revoked' } : c),
    );
    setSelectedIds(new Set());
    setModal({ kind: 'none' });
    showSnackbar(`${eligibleIds.length} ${eligibleIds.length === 1 ? 'key' : 'keys'} revoked`);
  }, [showSnackbar]);

  const handleCopyKey = useCallback((key: string) => {
    navigator.clipboard.writeText(key).then(() => showSnackbar('Key copied to clipboard'));
  }, [showSnackbar]);

  const handleKeyRevealClose = useCallback((name: string, isRotation: boolean) => {
    setModal({ kind: 'none' });
    showSnackbar(isRotation ? `"${name}" has been rotated` : `"${name}" created successfully`);
  }, [showSnackbar]);

  // ── Bulk actions ───────────────────────────────────────────────────────────

  const bulkActions: DataTableBulkAction<Credential>[] = useMemo(() => [{
    label: 'Revoke Selected',
    icon: 'block',
    onClick: (ids) => {
      const eligible = credentials
        .filter(c => ids.has(c.id) && c.status !== 'revoked')
        .map(c => c.id);
      if (eligible.length === 0) {
        showSnackbar('All selected keys are already revoked');
        return;
      }
      setModal({ kind: 'bulk-revoke-confirm', eligibleIds: eligible });
    },
  }], [credentials, showSnackbar]);

  // ── Cell renderers (actions column) ───────────────────────────────────────

  const cellRenderer = useMemo(() => ({
    actions: (row: Credential) => row.status === 'revoked' ? null : (
      <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
        <PhxIconButton
          name="refresh"
          variant="standard"
          size="small"
          ariaLabel={`Rotate ${row.name}`}
          onClick={() => setModal({ kind: 'rotate-confirm', credential: row })}
        />
        <PhxIconButton
          name="block"
          variant="standard"
          size="small"
          ariaLabel={`Revoke ${row.name}`}
          onClick={() => setModal({ kind: 'revoke-confirm', credential: row })}
        />
      </div>
    ),
  }), []);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div>

      {/* Page header */}
      <div className="page-header">
        <div>
          <h1>API Keys &amp; Credentials</h1>
          <p className="page-subhead">
            Manage API keys and credentials for your organization
          </p>
        </div>
        <PhxButton
          variant="filled"
          icon="add"
          label="Create API Key"
          onClick={() => setModal({ kind: 'create' })}
        />
      </div>

      {/* Status filter */}
      <div className="credentials-filter">
        <PhxChipGroup layout="single-row">
          {STATUS_FILTERS.map(f => (
            <PhxChip
              key={f.value}
              type="filter"
              label={f.label}
              selected={statusFilter === f.value}
              onSelected={() => setStatusFilter(f.value)}
            />
          ))}
        </PhxChipGroup>
      </div>

      {/* Main table */}
      <PhxDataTable<Credential>
        columns={TABLE_COLUMNS}
        data={filteredData}
        rowId={row => row.id}
        variant="paper"
        density="comfortable"
        stickyHeader
        maxHeight="calc(100vh - 290px)"
        selectionMode="multi"
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        bulkActions={bulkActions}
        cellRenderer={cellRenderer}
        emptyMessage={
          statusFilter === 'all'
            ? 'No API keys yet. Create your first key to get started.'
            : `No ${STATUS_LABELS[statusFilter as CredentialStatus]?.toLowerCase()} keys.`
        }
      />

      {/* ── Create modal ────────────────────────────────────────────────────── */}
      <PhxModal
        isOpen={modal.kind === 'create'}
        title="Create API Key"
        primaryLabel="Create key"
        cancelLabel="Cancel"
        showPrimary
        showCancel
        showCloseButton
        primaryDisabled={!createName.trim()}
        onPrimary={handleCreate}
        onClose={() => { setModal({ kind: 'none' }); resetCreateForm(); }}
      >
        <div className="create-form">
          <PhxTextField
            label="Key name"
            placeholder="e.g. Production API"
            value={createName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreateName(e.target.value)}
          />
          <PhxSelect
            label="Scopes"
            options={SCOPE_OPTIONS}
            value={createScope || undefined}
            placeholder="Select permissions"
            onChange={setCreateScope}
            showSelectionIndicator
          />
          <PhxSelect
            label="Expiration"
            options={EXPIRATION_OPTIONS}
            value={createExpiration || undefined}
            placeholder="Select expiration"
            onChange={setCreateExpiration}
            showSelectionIndicator
          />
        </div>
      </PhxModal>

      {/* ── Key reveal modal ─────────────────────────────────────────────────── */}
      {modal.kind === 'key-reveal' && (
        <PhxModal
          isOpen
          title={modal.isRotation ? 'Key rotated' : 'API key created'}
          primaryLabel="Done"
          showPrimary
          showCancel={false}
          onPrimary={() => handleKeyRevealClose(modal.name, modal.isRotation)}
          onClose={() => handleKeyRevealClose(modal.name, modal.isRotation)}
        >
          <div className="key-reveal-warning">
            <span className="material-icons" style={{ fontSize: '18px', flexShrink: 0 }}>warning</span>
            <span>Copy this key now — for security, it won&apos;t be shown again.</span>
          </div>
          <div className="key-reveal-box">
            <code>{modal.keyValue}</code>
          </div>
          <PhxButton
            variant="outlined"
            icon="content_copy"
            label="Copy key"
            onClick={() => handleCopyKey(modal.keyValue)}
          />
        </PhxModal>
      )}

      {/* ── Rotate confirm modal ──────────────────────────────────────────────── */}
      {modal.kind === 'rotate-confirm' && (
        <PhxModal
          isOpen
          title="Rotate API key?"
          primaryLabel="Rotate key"
          cancelLabel="Cancel"
          showPrimary
          showCancel
          showCloseButton
          onPrimary={() => handleRotateConfirm(modal.credential)}
          onClose={() => setModal({ kind: 'none' })}
        >
          <p className="modal-body-text">
            Rotating <strong>{modal.credential.name}</strong> will generate a new secret and
            immediately invalidate the current key. Any services using the current key will stop
            working until updated.
          </p>
        </PhxModal>
      )}

      {/* ── Revoke confirm modal ──────────────────────────────────────────────── */}
      {modal.kind === 'revoke-confirm' && (
        <PhxModal
          isOpen
          title="Revoke API key?"
          primaryLabel="Revoke"
          cancelLabel="Cancel"
          showPrimary
          showCancel
          showCloseButton
          onPrimary={() => handleRevokeConfirm(modal.credential)}
          onClose={() => setModal({ kind: 'none' })}
        >
          <p className="modal-body-text">
            Revoking <strong>{modal.credential.name}</strong> will immediately invalidate the key.
            This cannot be undone.
          </p>
        </PhxModal>
      )}

      {/* ── Bulk revoke confirm modal ─────────────────────────────────────────── */}
      {modal.kind === 'bulk-revoke-confirm' && (
        <PhxModal
          isOpen
          title={`Revoke ${modal.eligibleIds.length} ${modal.eligibleIds.length === 1 ? 'key' : 'keys'}?`}
          primaryLabel="Revoke all"
          cancelLabel="Cancel"
          showPrimary
          showCancel
          showCloseButton
          onPrimary={() => handleBulkRevokeConfirm(modal.eligibleIds)}
          onClose={() => setModal({ kind: 'none' })}
        >
          <p className="modal-body-text">
            This will immediately revoke{' '}
            <strong>{modal.eligibleIds.length} API {modal.eligibleIds.length === 1 ? 'key' : 'keys'}</strong>.
            Any services using these keys will stop working. This cannot be undone.
          </p>
        </PhxModal>
      )}

      {/* ── Snackbar ──────────────────────────────────────────────────────────── */}
      {snackbar && (
        <PhxSnackbar
          message={snackbar}
          showClose
          duration={3500}
          onDismiss={() => setSnackbar(null)}
        />
      )}

    </div>
  );
}
