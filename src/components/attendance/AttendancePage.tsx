import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import {
  CalendarCheck,
  Calendar,
  Building2,
  Fingerprint,
  Clock,
  AlertCircle,
  RefreshCw,
  Hash,
  UserCheck,
  CheckCircle2,
  LogIn,
  LogOut,
  Timer,
  Info,
} from 'lucide-react';

interface KaryawanHeaderInfo {
  kodekaryawan: string;
  idkaryawan: string | null;
  namakaryawan: string;
  kode_outlet: string | null;
  name_outlet?: string | null;
}

interface AbsenRecord {
  id: string;
  tanggal: string;
  fp_in: string | null;
  fp_out: string | null;
  status?: string | null;
  notes?: string | null;
}

export const AttendancePage: React.FC = () => {
  const { profile } = useAuth();
  const kodeKaryawan = profile?.kodekaryawan?.trim();

  // Helper for today's local date (YYYY-MM-DD)
  const getTodayLocalDateStr = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<string>(getTodayLocalDateStr());
  const [endDate, setEndDate] = useState<string>(getTodayLocalDateStr());
  const [dateValidationMsg, setDateValidationMsg] = useState<string | null>(null);

  const [karyawanInfo, setKaryawanInfo] = useState<KaryawanHeaderInfo | null>(null);
  const [records, setRecords] = useState<AbsenRecord[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Helper to add days to a YYYY-MM-DD date string
  const addDaysToDateStr = (dateStr: string, days: number): string => {
    const parts = dateStr.split('-');
    const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    d.setDate(d.getDate() + days);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Calculate day difference inclusive
  const calculateDaysDiff = (start: string, end: string): number => {
    const sParts = start.split('-');
    const eParts = end.split('-');
    const sDate = new Date(parseInt(sParts[0], 10), parseInt(sParts[1], 10) - 1, parseInt(sParts[2], 10));
    const eDate = new Date(parseInt(eParts[0], 10), parseInt(eParts[1], 10) - 1, parseInt(eParts[2], 10));
    const diffTime = eDate.getTime() - sDate.getTime();
    return Math.round(diffTime / (1000 * 3600 * 24)) + 1;
  };

  // Format date to Indonesian localized format (e.g., "Senin, 23 Okt 2026")
  const formatTanggalIndo = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      const parts = dateStr.split('-');
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      return new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(d);
    } catch {
      return dateStr;
    }
  };

  // Format timestamp to Time (e.g., "08:55 WIB")
  const formatTimeOnly = (timestampStr: string | null) => {
    if (!timestampStr) return null;
    try {
      const date = new Date(timestampStr);
      if (isNaN(date.getTime())) return null;
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes} WIB`;
    } catch {
      return null;
    }
  };

  // Calculate duration between fp_in and fp_out
  const calculateDuration = (inTimeStr: string | null, outTimeStr: string | null) => {
    if (!inTimeStr || !outTimeStr) return null;
    try {
      const inDate = new Date(inTimeStr);
      const outDate = new Date(outTimeStr);
      const diffMs = outDate.getTime() - inDate.getTime();
      if (diffMs <= 0) return null;
      const totalMinutes = Math.floor(diffMs / (1000 * 60));
      const hours = Math.floor(totalMinutes / 60);
      const mins = totalMinutes % 60;
      return `${hours} jam ${mins} mnt`;
    } catch {
      return null;
    }
  };

  // Validate and clamp dates whenever user changes them
  const handleStartDateChange = (newStart: string) => {
    setDateValidationMsg(null);
    let newEnd = endDate;

    if (newEnd < newStart) {
      newEnd = newStart;
    } else {
      const diff = calculateDaysDiff(newStart, newEnd);
      if (diff > 14) {
        newEnd = addDaysToDateStr(newStart, 13);
        setDateValidationMsg('Rentang tanggal disesuaikan maksimal 14 hari.');
      }
    }

    setStartDate(newStart);
    setEndDate(newEnd);
  };

  const handleEndDateChange = (newEnd: string) => {
    setDateValidationMsg(null);
    let finalEnd = newEnd;

    if (finalEnd < startDate) {
      finalEnd = startDate;
      setDateValidationMsg('Tanggal akhir tidak boleh lebih awal dari tanggal awal.');
    } else {
      const diff = calculateDaysDiff(startDate, finalEnd);
      if (diff > 14) {
        finalEnd = addDaysToDateStr(startDate, 13);
        setDateValidationMsg('Rentang tanggal maksimal 14 hari.');
      }
    }

    setEndDate(finalEnd);
  };

  // Preset Shortcuts
  const applyPreset = (days: number) => {
    setDateValidationMsg(null);
    const today = getTodayLocalDateStr();
    if (days === 1) {
      setStartDate(today);
      setEndDate(today);
    } else {
      const s = addDaysToDateStr(today, -(days - 1));
      setStartDate(s);
      setEndDate(today);
    }
  };

  // 1. Fetch Header Info
  const fetchHeaderInfo = useCallback(async () => {
    if (!kodeKaryawan) return;
    try {
      const { data: empData, error: empError } = await supabase
        .from('ot_hrd_karyawan_info')
        .select(`
          kodekaryawan,
          idkaryawan,
          namakaryawan,
          kode_outlet,
          master_outlet:kode_outlet ( name_outlet )
        `)
        .eq('kodekaryawan', kodeKaryawan)
        .maybeSingle();

      if (empError) {
        console.warn('Error fetching karyawan info for attendance:', empError);
      }

      if (empData) {
        const outletName = (empData.master_outlet as any)?.name_outlet || profile?.name_outlet || null;
        setKaryawanInfo({
          kodekaryawan: empData.kodekaryawan,
          idkaryawan: empData.idkaryawan || '-',
          namakaryawan: empData.namakaryawan || profile?.namakaryawan || profile?.full_name || 'Staff Member',
          kode_outlet: empData.kode_outlet || profile?.kode_outlet || null,
          name_outlet: outletName,
        });
      } else {
        setKaryawanInfo({
          kodekaryawan: kodeKaryawan,
          idkaryawan: '-',
          namakaryawan: profile?.namakaryawan || profile?.full_name || 'Staff Member',
          kode_outlet: profile?.kode_outlet || null,
          name_outlet: profile?.name_outlet || null,
        });
      }
    } catch (e) {
      console.error('Error fetching employee header info:', e);
    }
  }, [kodeKaryawan, profile]);

  // 2. Fetch Attendance Records for selected date range
  const fetchAttendanceRecords = useCallback(async () => {
    if (!kodeKaryawan || !startDate || !endDate) {
      setLoading(false);
      return;
    }

    setErrorMessage(null);
    try {
      const { data, error } = await supabase
        .from('ot_hrd_absen_harian')
        .select('id, tanggal, fp_in, fp_out, status, notes')
        .eq('kodekaryawan', kodeKaryawan)
        .gte('tanggal', startDate)
        .lte('tanggal', endDate)
        .order('tanggal', { ascending: false })
        .order('fp_in', { ascending: false });

      if (error) {
        throw error;
      }

      setRecords((data as AbsenRecord[]) || []);
    } catch (err: any) {
      console.error('Failed to load attendance records:', err);
      setErrorMessage(err.message || 'Gagal memuat catatan absensi.');
    } finally {
      setLoading(false);
    }
  }, [kodeKaryawan, startDate, endDate]);

  useEffect(() => {
    fetchHeaderInfo();
  }, [fetchHeaderInfo]);

  useEffect(() => {
    fetchAttendanceRecords();
  }, [fetchAttendanceRecords]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchHeaderInfo(), fetchAttendanceRecords()]);
    setTimeout(() => setRefreshing(false), 400);
  };

  const selectedDaysCount = calculateDaysDiff(startDate, endDate);

  // Stats calculation
  const totalEntries = records.length;
  const withCheckIn = records.filter((r) => !!r.fp_in).length;
  const withCheckOut = records.filter((r) => !!r.fp_out).length;
  const completeAttendance = records.filter((r) => !!r.fp_in && !!r.fp_out).length;

  // State: No Linked Employee Code
  if (!kodeKaryawan) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="bg-white rounded-3xl p-8 border border-zen-border shadow-xs text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-zen-charcoal font-serif">
            Akun Belum Terhubung dengan Data Karyawan
          </h3>
          <p className="text-xs sm:text-sm text-zen-charcoal/70 max-w-md mx-auto leading-relaxed">
            Anda belum menautkan kode karyawan HRD atau akun Anda belum diverifikasi. Silakan hubungi Admin Gerai Anda untuk melakukan verifikasi akun.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Action Bar: Date Pickers & Range Controller */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-zen-border shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-zen-matcha/15 flex items-center justify-center text-zen-moss shrink-0">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-zen-charcoal font-serif">
                Lihat Absensi Karyawan
              </h2>
              <p className="text-xs text-zen-charcoal/60">
                Log kehadiran finger/absen harian (Rentang 1 - 14 Hari)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-stretch sm:self-auto justify-end">
            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-3.5 py-2 rounded-xl border border-zen-border bg-white hover:bg-zen-linen text-zen-charcoal text-xs font-semibold flex items-center space-x-2 transition-all active:scale-95 shadow-xs"
              title="Muat Ulang"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-zen-moss' : 'text-zen-charcoal/70'}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Date Filter & Presets Row */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 pt-3 border-t border-zen-border/70">
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full lg:w-auto">
            {/* Start Date */}
            <div className="flex-1 sm:flex-initial">
              <label className="block text-[11px] font-bold text-zen-charcoal/60 uppercase tracking-wider mb-1">
                Dari
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zen-moss">
                  <Calendar className="w-4 h-4" />
                </div>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  className="w-full sm:w-44 pl-9 pr-3 py-2 rounded-xl border border-zen-border bg-zen-linen/40 text-xs font-bold text-zen-charcoal focus:outline-hidden focus:ring-2 focus:ring-zen-matcha transition-all"
                />
              </div>
            </div>

            <div className="hidden sm:flex items-center pt-5 text-zen-charcoal/40 text-xs font-bold">
              →
            </div>

            {/* End Date */}
            <div className="flex-1 sm:flex-initial">
              <label className="block text-[11px] font-bold text-zen-charcoal/60 uppercase tracking-wider mb-1">
                Sampai
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zen-moss">
                  <Calendar className="w-4 h-4" />
                </div>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => handleEndDateChange(e.target.value)}
                  className="w-full sm:w-44 pl-9 pr-3 py-2 rounded-xl border border-zen-border bg-zen-linen/40 text-xs font-bold text-zen-charcoal focus:outline-hidden focus:ring-2 focus:ring-zen-matcha transition-all"
                />
              </div>
            </div>

            {/* Days Count Badge */}
            <div className="pt-0 sm:pt-5 self-end sm:self-auto">
              <span className="inline-flex items-center px-3 py-2 rounded-xl bg-zen-sand/25 border border-zen-sand/40 text-xs font-bold text-zen-charcoal font-mono whitespace-nowrap">
                {selectedDaysCount} Hari
              </span>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center space-x-1.5 w-full lg:w-auto justify-start lg:justify-end overflow-x-auto pb-1 lg:pb-0">
            <span className="text-[11px] text-zen-charcoal/50 mr-1 hidden sm:inline">Pilihan Cepat:</span>
            <button
              onClick={() => applyPreset(1)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                startDate === getTodayLocalDateStr() && endDate === getTodayLocalDateStr()
                  ? 'bg-zen-matcha text-white shadow-xs'
                  : 'bg-zen-linen hover:bg-zen-sand/30 text-zen-charcoal/70'
              }`}
            >
              Hari Ini
            </button>
            <button
              onClick={() => applyPreset(7)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedDaysCount === 7 && endDate === getTodayLocalDateStr()
                  ? 'bg-zen-matcha text-white shadow-xs'
                  : 'bg-zen-linen hover:bg-zen-sand/30 text-zen-charcoal/70'
              }`}
            >
              7 Hari
            </button>
            <button
              onClick={() => applyPreset(14)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedDaysCount === 14 && endDate === getTodayLocalDateStr()
                  ? 'bg-zen-matcha text-white shadow-xs'
                  : 'bg-zen-linen hover:bg-zen-sand/30 text-zen-charcoal/70'
              }`}
            >
              14 Hari
            </button>
          </div>
        </div>

        {/* Validation or Info Alert */}
        {dateValidationMsg && (
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center space-x-2">
            <Info className="w-4 h-4 shrink-0 text-amber-600" />
            <span>{dateValidationMsg}</span>
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 1. Header Card: Karyawan & Outlet Profile (Identical to View Payroll) */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-zen-border shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-zen-border/70 gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-zen-matcha text-white font-bold text-lg flex items-center justify-center shadow-xs">
              {karyawanInfo?.namakaryawan?.slice(0, 2).toUpperCase() || 'ST'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg sm:text-xl font-bold text-zen-charcoal font-serif">
                  {karyawanInfo?.namakaryawan || 'Staff Member'}
                </h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <UserCheck className="w-3 h-3 mr-1" />
                  Terverifikasi
                </span>
              </div>
              <p className="text-xs text-zen-charcoal/60 mt-0.5">
                {profile?.departemen ? `Departemen ${profile.departemen}` : 'Staff Operasional'}
              </p>
            </div>
          </div>

          <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-zen-border/60">
            <span className="text-[11px] text-zen-charcoal/50">Periode Terpilih</span>
            <span className="px-3 py-1 rounded-xl bg-zen-sand/20 text-zen-charcoal text-xs font-bold font-mono">
              {startDate} s/d {endDate}
            </span>
          </div>
        </div>

        {/* Info Key-Value Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-xs">
          {/* Kode Karyawan */}
          <div className="p-3.5 rounded-2xl bg-zen-linen/60 border border-zen-border/60 space-y-1">
            <span className="text-[11px] text-zen-charcoal/50 flex items-center">
              <Hash className="w-3 h-3 mr-1 text-zen-moss" />
              Kode Karyawan
            </span>
            <p className="font-mono font-bold text-zen-charcoal text-sm">
              {karyawanInfo?.kodekaryawan || '-'}
            </p>
          </div>

          {/* ID Finger */}
          <div className="p-3.5 rounded-2xl bg-zen-linen/60 border border-zen-border/60 space-y-1">
            <span className="text-[11px] text-zen-charcoal/50 flex items-center">
              <Fingerprint className="w-3 h-3 mr-1 text-zen-moss" />
              ID Finger
            </span>
            <p className="font-mono font-bold text-zen-charcoal text-sm">
              {karyawanInfo?.idkaryawan || '-'}
            </p>
          </div>

          {/* Nama Lengkap */}
          <div className="p-3.5 rounded-2xl bg-zen-linen/60 border border-zen-border/60 space-y-1">
            <span className="text-[11px] text-zen-charcoal/50 flex items-center">
              <UserCheck className="w-3 h-3 mr-1 text-zen-moss" />
              Nama
            </span>
            <p className="font-bold text-zen-charcoal truncate" title={karyawanInfo?.namakaryawan}>
              {karyawanInfo?.namakaryawan || '-'}
            </p>
          </div>

          {/* Cabang Outlet */}
          <div className="p-3.5 rounded-2xl bg-zen-linen/60 border border-zen-border/60 space-y-1">
            <span className="text-[11px] text-zen-charcoal/50 flex items-center">
              <Building2 className="w-3 h-3 mr-1 text-zen-moss" />
              Cabang
            </span>
            <p className="font-bold text-zen-charcoal truncate" title={karyawanInfo?.name_outlet || undefined}>
              {karyawanInfo?.name_outlet || (karyawanInfo?.kode_outlet ? `Outlet ${karyawanInfo.kode_outlet}` : 'Pusat / Holding')}
            </p>
          </div>
        </div>
      </div>

      {/* Summary Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-zen-border shadow-xs space-y-1">
          <span className="text-[11px] text-zen-charcoal/60 font-medium">Total Catatan Absen</span>
          <p className="text-xl font-bold text-zen-charcoal font-mono">{totalEntries}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-zen-border shadow-xs space-y-1">
          <span className="text-[11px] text-zen-charcoal/60 font-medium">Absen Masuk (FP In)</span>
          <p className="text-xl font-bold text-emerald-600 font-mono">{withCheckIn}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-zen-border shadow-xs space-y-1">
          <span className="text-[11px] text-zen-charcoal/60 font-medium">Absen Keluar (FP Out)</span>
          <p className="text-xl font-bold text-blue-600 font-mono">{withCheckOut}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-zen-border shadow-xs space-y-1">
          <span className="text-[11px] text-zen-charcoal/60 font-medium">Kehadiran Lengkap</span>
          <p className="text-xl font-bold text-zen-moss font-mono">{completeAttendance}</p>
        </div>
      </div>

      {/* 2. Attendance Records View: Hybrid Responsive Table & Card List */}
      <div className="bg-white rounded-3xl border border-zen-border shadow-xs overflow-hidden">
        <div className="p-5 sm:px-6 border-b border-zen-border flex items-center justify-between bg-zen-paper/60">
          <div className="flex items-center space-x-2.5">
            <Clock className="w-4 h-4 text-zen-moss" />
            <h3 className="text-sm sm:text-base font-bold text-zen-charcoal font-serif">
              Riwayat Absensi Harian
            </h3>
            <span className="text-[11px] bg-zen-sand/30 text-zen-charcoal px-2 py-0.5 rounded-full font-mono font-bold">
              {records.length} Baris
            </span>
          </div>
          <span className="text-xs text-zen-charcoal/50">
            Tabel: <code className="font-mono text-[11px] text-zen-moss">ot_hrd_absen_harian</code>
          </span>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-zen-matcha/20 flex items-center justify-center animate-bounce text-zen-moss">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-zen-charcoal/70 animate-pulse">
              Memuat data absensi...
            </p>
          </div>
        ) : records.length === 0 ? (
          <div className="py-16 px-4 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-zen-linen flex items-center justify-center text-zen-charcoal/40 mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-zen-charcoal">Tidak Ada Data Absen</h4>
            <p className="text-xs text-zen-charcoal/60 max-w-sm mx-auto">
              Tidak ditemukan catatan absensi untuk tanggal {startDate} sampai {endDate}.
            </p>
          </div>
        ) : (
          <div>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-zen-linen/60 text-zen-charcoal/60 font-semibold border-b border-zen-border">
                    <th className="py-3.5 px-6">Tanggal</th>
                    <th className="py-3.5 px-6">Absen Masuk (FP In)</th>
                    <th className="py-3.5 px-6">Absen Keluar (FP Out)</th>
                    <th className="py-3.5 px-6">Durasi Kerja</th>
                    <th className="py-3.5 px-6">Status Kehadiran</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zen-border/60">
                  {records.map((rec) => {
                    const inTime = formatTimeOnly(rec.fp_in);
                    const outTime = formatTimeOnly(rec.fp_out);
                    const duration = calculateDuration(rec.fp_in, rec.fp_out);

                    return (
                      <tr key={rec.id} className="hover:bg-zen-linen/40 transition-colors">
                        {/* Tanggal */}
                        <td className="py-4 px-6">
                          <div className="space-y-0.5">
                            <p className="font-bold text-zen-charcoal font-mono text-xs">
                              {rec.tanggal}
                            </p>
                            <p className="text-[11px] text-zen-charcoal/60">
                              {formatTanggalIndo(rec.tanggal)}
                            </p>
                          </div>
                        </td>

                        {/* Absen Masuk */}
                        <td className="py-4 px-6">
                          {inTime ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-mono font-bold text-xs">
                              <LogIn className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                              {inTime}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-xl bg-zinc-100 text-zinc-500 text-xs">
                              - Tidak tercatat -
                            </span>
                          )}
                        </td>

                        {/* Absen Keluar */}
                        <td className="py-4 px-6">
                          {outTime ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-xl bg-blue-50 text-blue-800 border border-blue-200/80 font-mono font-bold text-xs">
                              <LogOut className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                              {outTime}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200/80 text-xs font-semibold">
                              Belum Checkout
                            </span>
                          )}
                        </td>

                        {/* Durasi Kerja */}
                        <td className="py-4 px-6">
                          {duration ? (
                            <span className="inline-flex items-center text-xs text-zen-charcoal font-medium">
                              <Timer className="w-3.5 h-3.5 mr-1 text-zen-moss" />
                              {duration}
                            </span>
                          ) : (
                            <span className="text-zen-charcoal/40 text-xs">-</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-4 px-6">
                          {inTime && outTime ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                              Lengkap
                            </span>
                          ) : inTime && !outTime ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                              Sedang Bekerja
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 text-zinc-600">
                              Data Parsial
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-zen-border/60">
              {records.map((rec) => {
                const inTime = formatTimeOnly(rec.fp_in);
                const outTime = formatTimeOnly(rec.fp_out);
                const duration = calculateDuration(rec.fp_in, rec.fp_out);

                return (
                  <div key={rec.id} className="p-4 space-y-3 hover:bg-zen-linen/30 transition-colors">
                    {/* Header Row: Date & Status Badge */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-zen-charcoal text-xs">
                          {formatTanggalIndo(rec.tanggal)}
                        </span>
                        <p className="text-[10px] text-zen-charcoal/50 font-mono">{rec.tanggal}</p>
                      </div>
                      <div>
                        {inTime && outTime ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-2.5 h-2.5 mr-1 text-emerald-600" />
                            Lengkap
                          </span>
                        ) : inTime && !outTime ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            Sedang Bekerja
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 text-zinc-600">
                            Data Parsial
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Check In & Check Out Badges Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {/* Masuk */}
                      <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/60 space-y-1">
                        <span className="text-[10px] font-bold text-emerald-800 flex items-center">
                          <LogIn className="w-3 h-3 mr-1 text-emerald-600" />
                          Absen Masuk
                        </span>
                        <p className="font-mono font-bold text-emerald-950 text-xs">
                          {inTime || '-'}
                        </p>
                      </div>

                      {/* Keluar */}
                      <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200/60 space-y-1">
                        <span className="text-[10px] font-bold text-blue-800 flex items-center">
                          <LogOut className="w-3 h-3 mr-1 text-blue-600" />
                          Absen Keluar
                        </span>
                        <p className="font-mono font-bold text-blue-950 text-xs">
                          {outTime || (
                            <span className="text-amber-700 font-sans font-semibold text-[11px]">
                              Belum Checkout
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Duration Info */}
                    {duration && (
                      <div className="flex items-center justify-between text-[11px] text-zen-charcoal/70 bg-zen-linen/40 px-2.5 py-1.5 rounded-lg border border-zen-border/40">
                        <span className="flex items-center">
                          <Timer className="w-3 h-3 mr-1 text-zen-moss" />
                          Durasi Kerja
                        </span>
                        <span className="font-bold font-mono text-zen-charcoal">{duration}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendancePage;
