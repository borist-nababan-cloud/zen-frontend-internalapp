import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import {
  Users,
  UserCheck,
  UserX,
  Shield,
  ShieldCheck,
  Search,
  Filter,
  RefreshCw,
  Check,
  X,
  Power,
  Building2,
  Briefcase,
  Hash,
  AlertTriangle,
  Clock,
  Sparkles,
  ChevronDown
} from 'lucide-react';

interface ManageableUser {
  uid: string;
  email: string;
  full_name: string;
  avatar_url: string;
  kodekaryawan?: string;
  kode_outlet?: string;
  departemen?: string;
  role_user: number;
  role_name?: string;
  approval_status: 'UNLINKED' | 'PENDING' | 'APPROVED' | 'REJECTED';
  is_active: boolean;
  rejected_reason?: string | null;
  approved_at?: string | null;
  created_at: string;
}

export const UserManagementPage: React.FC = () => {
  const { profile } = useAuth();
  const [users, setUsers] = useState<ManageableUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [callerRole, setCallerRole] = useState<number>(profile?.role_user || 12);
  const [callerOutlet, setCallerOutlet] = useState<string | null>(profile?.kode_outlet || null);
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [outletFilter, setOutletFilter] = useState<string>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Reject modal state
  const [rejectingUser, setRejectingUser] = useState<ManageableUser | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Selected role for pending approval per user
  const [selectedRoles, setSelectedRoles] = useState<Record<string, number>>({});

  // Strict Permission Check: Only Role 8 (SUPERUSER) & Role 6 (outlet_admin). Exclude Role 1 (admin_holding).
  const isSuperuser = profile?.role_user === 8;
  const isOutletAdmin = profile?.role_user === 6;
  const isAllowed = isSuperuser || isOutletAdmin;

  const fetchUsers = async () => {
    if (!isAllowed) return;
    setLoading(true);
    setFeedback(null);
    try {
      const { data, error } = await supabase.rpc('get_manageable_users');
      if (error) {
        setFeedback({ type: 'error', message: error.message || 'Gagal mengambil data pengguna.' });
      } else if (data && data.success) {
        setCallerRole(data.caller_role);
        setCallerOutlet(data.caller_outlet);
        setUsers(data.users || []);
      } else {
        setFeedback({ type: 'error', message: data?.message || 'Gagal memuat pengguna.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Terjadi kesalahan sistem.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [profile?.role_user]);

  // Handle Approve User
  const handleApprove = async (userItem: ManageableUser) => {
    const roleToAssign = selectedRoles[userItem.uid] || 12; // default 12 (operational_staff)
    setActionLoading(userItem.uid);
    setFeedback(null);
    try {
      const { data, error } = await supabase.rpc('approve_user_access', {
        p_target_uid: userItem.uid,
        p_role_user: roleToAssign,
      });

      if (error) {
        setFeedback({ type: 'error', message: error.message });
      } else if (data?.success) {
        setFeedback({ type: 'success', message: data.message });
        await fetchUsers();
      } else {
        setFeedback({ type: 'error', message: data?.message || 'Gagal menyetujui pengguna.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Kesalahan saat menyetujui user.' });
    } finally {
      setActionLoading(null);
    }
  };

  // Handle Reject User
  const handleRejectConfirm = async () => {
    if (!rejectingUser) return;
    setActionLoading(rejectingUser.uid);
    setFeedback(null);
    try {
      const { data, error } = await supabase.rpc('reject_user_access', {
        p_target_uid: rejectingUser.uid,
        p_reason: rejectReason.trim() || 'Ditolak oleh admin.',
      });

      if (error) {
        setFeedback({ type: 'error', message: error.message });
      } else if (data?.success) {
        setFeedback({ type: 'success', message: data.message });
        setRejectingUser(null);
        setRejectReason('');
        await fetchUsers();
      } else {
        setFeedback({ type: 'error', message: data?.message || 'Gagal menolak pengguna.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Kesalahan saat menolak user.' });
    } finally {
      setActionLoading(null);
    }
  };

  // Handle Toggle Active/Inactive
  const handleToggleStatus = async (userItem: ManageableUser) => {
    const nextStatus = !userItem.is_active;
    setActionLoading(userItem.uid);
    setFeedback(null);
    try {
      const { data, error } = await supabase.rpc('toggle_user_status', {
        p_target_uid: userItem.uid,
        p_is_active: nextStatus,
      });

      if (error) {
        setFeedback({ type: 'error', message: error.message });
      } else if (data?.success) {
        setFeedback({ type: 'success', message: data.message });
        await fetchUsers();
      } else {
        setFeedback({ type: 'error', message: data?.message || 'Gagal mengubah status pengguna.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Kesalahan saat mengubah status user.' });
    } finally {
      setActionLoading(null);
    }
  };

  // Categorize counts
  const pendingUsers = useMemo(() => {
    return users.filter((u) => u.approval_status === 'PENDING');
  }, [users]);

  const approvedUsers = useMemo(() => {
    return users.filter((u) => u.approval_status === 'APPROVED');
  }, [users]);

  const activeUsersCount = useMemo(() => {
    return users.filter((u) => u.is_active).length;
  }, [users]);

  // Unique outlets for filter
  const outletOptions = useMemo(() => {
    const outlets = new Set<string>();
    users.forEach((u) => {
      if (u.kode_outlet) outlets.add(u.kode_outlet);
    });
    return Array.from(outlets).sort();
  }, [users]);

  // Filtered lists
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Tab filter
      if (activeTab === 'pending' && u.approval_status !== 'PENDING') return false;

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchName = u.full_name?.toLowerCase().includes(query);
        const matchEmail = u.email?.toLowerCase().includes(query);
        const matchCode = u.kodekaryawan?.toLowerCase().includes(query);
        const matchOutlet = u.kode_outlet?.toLowerCase().includes(query);
        if (!matchName && !matchEmail && !matchCode && !matchOutlet) return false;
      }

      // Status filter (on all tab)
      if (activeTab === 'all' && statusFilter !== 'all') {
        if (statusFilter === 'active' && !u.is_active) return false;
        if (statusFilter === 'inactive' && u.is_active) return false;
        if (statusFilter === 'rejected' && u.approval_status !== 'REJECTED') return false;
        if (statusFilter === 'unlinked' && u.approval_status !== 'UNLINKED') return false;
      }

      // Outlet filter (for superuser)
      if (isSuperuser && outletFilter !== 'all' && u.kode_outlet !== outletFilter) {
        return false;
      }

      return true;
    });
  }, [users, activeTab, searchQuery, statusFilter, outletFilter, isSuperuser]);

  // If unauthorized (e.g. Role 1 admin_holding or Role 12 operational_staff)
  if (!isAllowed) {
    return (
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-zen-border text-center max-w-lg mx-auto my-12 space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-zen-charcoal font-serif">Akses Ditolak</h2>
        <p className="text-xs sm:text-sm text-zen-charcoal/70 leading-relaxed">
          Modul Manajemen Pengguna hanya dapat diakses oleh <strong>Admin Gerai (Role 6)</strong> untuk gerai masing-masing atau <strong>Superuser (Role 8)</strong>.
        </p>
        <p className="text-[11px] text-zen-charcoal/50">
          Peran Anda saat ini: Role {profile?.role_user} ({profile?.role || 'Staff'})
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Scope Banner */}
      <div className="bg-gradient-to-r from-white via-white to-zen-linen p-5 sm:p-6 rounded-3xl border border-zen-border shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-zen-matcha text-white flex items-center justify-center shadow-xs">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg sm:text-xl font-bold text-zen-charcoal font-serif">
                Manajemen Pengguna & Staf
              </h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  isSuperuser
                    ? 'bg-purple-100 text-purple-700 border border-purple-200'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}
              >
                {isSuperuser ? 'SUPERUSER (Role 8)' : `ADMIN GERAI (Outlet ${callerOutlet})`}
              </span>
            </div>
            <p className="text-xs text-zen-charcoal/60 mt-0.5">
              {isSuperuser
                ? 'Wewenang penuh mengelola dan menyetujui seluruh pengguna dari semua gerai Zen Family Spa.'
                : `Wewenang mengelola staf dan menyetujui akun khusus gerai Anda (${callerOutlet}).`}
            </p>
          </div>
        </div>

        <button
          onClick={fetchUsers}
          disabled={loading}
          className="self-end sm:self-auto px-3.5 py-2 rounded-xl bg-white hover:bg-zen-linen border border-zen-border text-xs font-semibold text-zen-charcoal flex items-center space-x-1.5 shadow-xs transition-all active:scale-95"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-zen-moss ${loading ? 'animate-spin' : ''}`} />
          <span>Segarkan Data</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-zen-border shadow-xs flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-zen-charcoal/50">Menunggu Verifikasi</p>
            <p className="text-lg font-bold text-amber-600">{pendingUsers.length}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-zen-border shadow-xs flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-zen-charcoal/50">Staf Aktif</p>
            <p className="text-lg font-bold text-emerald-600">{activeUsersCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-zen-border shadow-xs flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-zen-linen text-zen-moss">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-zen-charcoal/50">Total Disetujui</p>
            <p className="text-lg font-bold text-zen-charcoal">{approvedUsers.length}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-zen-border shadow-xs flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-zen-charcoal/50">Total Pengguna Terdata</p>
            <p className="text-lg font-bold text-zen-charcoal">{users.length}</p>
          </div>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center justify-between border animate-in fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            {feedback.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span className="font-medium">{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="p-1 hover:opacity-70">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Tabs & Search Filters */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-zen-border shadow-xs space-y-5">
        {/* Tab Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-zen-border/70 pb-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                activeTab === 'pending'
                  ? 'bg-zen-matcha text-white shadow-xs'
                  : 'bg-zen-linen text-zen-charcoal/70 hover:text-zen-charcoal'
              }`}
            >
              <span>Menunggu Persetujuan</span>
              {pendingUsers.length > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    activeTab === 'pending' ? 'bg-white text-zen-moss' : 'bg-amber-500 text-white'
                  }`}
                >
                  {pendingUsers.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                activeTab === 'all'
                  ? 'bg-zen-matcha text-white shadow-xs'
                  : 'bg-zen-linen text-zen-charcoal/70 hover:text-zen-charcoal'
              }`}
            >
              <span>Semua Pengguna ({users.length})</span>
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-zen-charcoal/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama, email, kode..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-zen-border focus:border-zen-matcha focus:ring-1 focus:ring-zen-matcha outline-none bg-zen-linen/40"
            />
          </div>
        </div>

        {/* Sub-Filters for All tab */}
        {activeTab === 'all' && (
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-[11px] font-semibold text-zen-charcoal/50 flex items-center mr-1">
              <Filter className="w-3 h-3 mr-1 text-zen-moss" /> Filter:
            </span>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-zen-border bg-zen-linen/40 text-zen-charcoal font-medium text-xs outline-none"
            >
              <option value="all">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
              <option value="rejected">Ditolak</option>
              <option value="unlinked">Belum Taut Kode</option>
            </select>

            {isSuperuser && outletOptions.length > 0 && (
              <select
                value={outletFilter}
                onChange={(e) => setOutletFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-zen-border bg-zen-linen/40 text-zen-charcoal font-medium text-xs outline-none"
              >
                <option value="all">Semua Outlet ({outletOptions.length})</option>
                {outletOptions.map((o) => (
                  <option key={o} value={o}>
                    Outlet {o}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* User List */}
        {loading ? (
          <div className="py-16 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-zen-matcha animate-spin mx-auto" />
            <p className="text-xs text-zen-charcoal/60">Memuat data pengguna dari Supabase...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-14 text-center space-y-2 bg-zen-linen/40 rounded-2xl border border-dashed border-zen-border">
            <Users className="w-10 h-10 text-zen-charcoal/30 mx-auto" />
            <p className="text-sm font-semibold text-zen-charcoal/70">
              {activeTab === 'pending'
                ? 'Tidak ada antrean pengguna yang menunggu persetujuan.'
                : 'Tidak ada pengguna yang cocok dengan kriteria pencarian.'}
            </p>
            <p className="text-xs text-zen-charcoal/50">
              {activeTab === 'pending'
                ? 'Semua permohonan staf sudah diproses atau belum ada karyawan baru yang menautkan kode.'
                : 'Coba ubah kata kunci pencarian atau filter status Anda.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredUsers.map((u) => {
              const isPending = u.approval_status === 'PENDING';
              const isApproved = u.approval_status === 'APPROVED';
              const isRejected = u.approval_status === 'REJECTED';
              const isUnlinked = u.approval_status === 'UNLINKED';
              const isActionRunning = actionLoading === u.uid;

              return (
                <div
                  key={u.uid}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                    isPending
                      ? 'bg-amber-50/40 border-amber-200/80 shadow-xs'
                      : 'bg-white hover:bg-zen-linen/30 border-zen-border'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    {/* User Identity Column */}
                    <div className="flex items-start space-x-3.5 min-w-0">
                      <div className="relative shrink-0">
                        {u.avatar_url ? (
                          <img
                            src={u.avatar_url}
                            alt={u.full_name}
                            className="w-11 h-11 rounded-xl object-cover ring-2 ring-zen-border"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-xl bg-zen-matcha text-white font-bold text-sm flex items-center justify-center">
                            {u.full_name?.slice(0, 2).toUpperCase() || 'ST'}
                          </div>
                        )}
                        <div
                          className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                            u.is_active ? 'bg-emerald-500' : 'bg-neutral-400'
                          }`}
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center space-x-2 flex-wrap">
                          <h3 className="text-sm font-bold text-zen-charcoal truncate">
                            {u.full_name}
                          </h3>

                          {/* Approval Status Badge */}
                          {isPending && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              Menunggu Verifikasi
                            </span>
                          )}
                          {isApproved && (
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                u.is_active
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : 'bg-neutral-100 text-neutral-600 border border-neutral-200'
                              }`}
                            >
                              {u.is_active ? 'Aktif' : 'Nonaktif'}
                            </span>
                          )}
                          {isRejected && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-700 border border-red-200">
                              Ditolak
                            </span>
                          )}
                          {isUnlinked && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-100 text-neutral-500 border border-neutral-200">
                              Belum Taut Kode
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-zen-charcoal/60 truncate mt-0.5">{u.email}</p>

                        {/* Metadata chips */}
                        <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-zen-charcoal/70">
                          {u.kodekaryawan && (
                            <span className="px-2 py-0.5 rounded-lg bg-zen-linen border border-zen-border font-mono font-semibold text-zen-moss flex items-center">
                              <Hash className="w-2.5 h-2.5 mr-1" />
                              {u.kodekaryawan}
                            </span>
                          )}

                          {u.kode_outlet && (
                            <span className="px-2 py-0.5 rounded-lg bg-zen-linen border border-zen-border font-medium flex items-center">
                              <Building2 className="w-2.5 h-2.5 mr-1 text-zen-moss" />
                              Outlet {u.kode_outlet}
                            </span>
                          )}

                          {u.departemen && (
                            <span className="px-2 py-0.5 rounded-lg bg-zen-linen border border-zen-border font-medium flex items-center">
                              <Briefcase className="w-2.5 h-2.5 mr-1 text-zen-moss" />
                              {u.departemen}
                            </span>
                          )}

                          <span className="px-2 py-0.5 rounded-lg bg-zen-matcha/10 text-zen-moss font-semibold flex items-center">
                            <Shield className="w-2.5 h-2.5 mr-1" />
                            Role {u.role_user} ({u.role_name || 'Staff'})
                          </span>
                        </div>

                        {u.rejected_reason && isRejected && (
                          <p className="text-[11px] text-red-600 mt-1 italic">
                            Alasan: "{u.rejected_reason}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions Column */}
                    <div className="flex flex-wrap items-center gap-2 self-end lg:self-center w-full lg:w-auto justify-end pt-2 lg:pt-0 border-t lg:border-t-0 border-zen-border/50">
                      {isPending ? (
                        <>
                          {/* Role Selector dropdown for approval */}
                          <div className="flex items-center space-x-1">
                            <span className="text-[11px] text-zen-charcoal/50 hidden sm:inline">
                              Beri Role:
                            </span>
                            <select
                              value={selectedRoles[u.uid] || 12}
                              onChange={(e) =>
                                setSelectedRoles({
                                  ...selectedRoles,
                                  [u.uid]: Number(e.target.value),
                                })
                              }
                              disabled={isActionRunning}
                              className="px-2 py-1.5 rounded-xl border border-zen-border text-xs font-semibold bg-white text-zen-charcoal outline-none focus:border-zen-matcha"
                            >
                              <option value={12}>12 - Operational Staff</option>
                              <option value={11}>11 - Therapist</option>
                              <option value={7}>7 - Gudang Outlet</option>
                              <option value={10}>10 - Finance Outlet</option>
                              {/* Only Superuser can grant Role 6 (outlet_admin) */}
                              {isSuperuser && <option value={6}>6 - Outlet Admin</option>}
                              {isSuperuser && <option value={14}>14 - Manager</option>}
                            </select>
                          </div>

                          <button
                            onClick={() => handleApprove(u)}
                            disabled={isActionRunning}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs shadow-xs transition-all flex items-center space-x-1.5"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Setujui</span>
                          </button>

                          <button
                            onClick={() => {
                              setRejectingUser(u);
                              setRejectReason('');
                            }}
                            disabled={isActionRunning}
                            className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-semibold text-xs transition-all flex items-center space-x-1"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Tolak</span>
                          </button>
                        </>
                      ) : (
                        <>
                          {/* Toggle Active status button */}
                          {isApproved && (
                            <button
                              onClick={() => handleToggleStatus(u)}
                              disabled={isActionRunning}
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 border transition-all ${
                                u.is_active
                                  ? 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-300'
                                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                              }`}
                            >
                              <Power className="w-3 h-3" />
                              <span>{u.is_active ? 'Nonaktifkan' : 'Aktifkan'}</span>
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-zen-border shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3 text-red-600">
              <div className="p-2 rounded-xl bg-red-100">
                <UserX className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-zen-charcoal font-serif">
                Tolak Akses Karyawan
              </h3>
            </div>

            <p className="text-xs text-zen-charcoal/70 leading-relaxed">
              Anda akan menolak pengajuan akun <strong>{rejectingUser.full_name}</strong> (Kode:{' '}
              {rejectingUser.kodekaryawan || '-'}). Pengguna akan menerima notifikasi alasan penolakan.
            </p>

            <div>
              <label className="block text-xs font-semibold text-zen-charcoal mb-1">
                Alasan Penolakan (Opsional):
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Contoh: Bukan staf dari gerai ini, atau silakan hubungi HRD untuk perbaikan data."
                className="w-full p-3 text-xs rounded-xl border border-zen-border focus:border-red-400 focus:ring-1 focus:ring-red-400 outline-none bg-zen-linen/40 resize-none h-20"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setRejectingUser(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zen-charcoal/70 hover:bg-zen-linen"
              >
                Batal
              </button>
              <button
                onClick={handleRejectConfirm}
                disabled={actionLoading === rejectingUser.uid}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs"
              >
                {actionLoading === rejectingUser.uid ? 'Memproses...' : 'Konfirmasi Tolak'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
