import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import {
  Coins,
  Calendar,
  Building2,
  Fingerprint,
  AlertCircle,
  RefreshCw,
  Hash,
  UserCheck,
  Info,
  Sparkles,
  ShieldAlert,
  Receipt,
} from 'lucide-react';

interface KaryawanHeaderInfo {
  kodekaryawan: string;
  idkaryawan: string | null;
  namakaryawan: string;
  kode_outlet: string | null;
  name_outlet?: string | null;
  departemen?: string | null;
}

interface TransDetailRecord {
  id: string;
  trans_id: string;
  tanggal: string;
  trans_type_id: string;
  produk_jasa_id?: string | null;
  produk_jasa_nama: string;
  subtotal: number;
  kode_karyawan?: string | null;
  therapist_id?: string | null;
  id_payment?: string | null;
}

export const CommissionPage: React.FC = () => {
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
  const [commissionRate, setCommissionRate] = useState<number>(15); // Default 15% (TR)
  const [rateLabel, setRateLabel] = useState<string>('Terapis');
  const [records, setRecords] = useState<TransDetailRecord[]>([]);
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

  // Currency Formatter (IDR)
  const formatCurrency = (val: number | string | undefined | null) => {
    if (val === undefined || val === null || val === '') return 'Rp 0';
    const num = typeof val === 'string' ? parseFloat(val.replace(/[^0-9.-]+/g, '')) || 0 : val;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
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

  // Date range handlers (Strict 1 - 7 Days Limit)
  const handleStartDateChange = (newStart: string) => {
    setDateValidationMsg(null);
    let newEnd = endDate;

    if (newEnd < newStart) {
      newEnd = newStart;
    } else {
      const diff = calculateDaysDiff(newStart, newEnd);
      if (diff > 7) {
        newEnd = addDaysToDateStr(newStart, 6);
        setDateValidationMsg('Rentang tanggal disesuaikan maksimal 7 hari.');
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
      if (diff > 7) {
        finalEnd = addDaysToDateStr(startDate, 6);
        setDateValidationMsg('Rentang tanggal maksimal 7 hari.');
      }
    }

    setEndDate(finalEnd);
  };

  // Quick Preset Handlers (1, 3, 7 days)
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

  // 1. Fetch Header Info & Department
  const fetchHeaderInfo = useCallback(async () => {
    if (!kodeKaryawan) {
      setLoading(false);
      return;
    }

    try {
      const { data: empData, error: empError } = await supabase
        .from('ot_hrd_karyawan_info')
        .select(`
          kodekaryawan,
          idkaryawan,
          namakaryawan,
          kode_outlet,
          departemen,
          master_outlet:kode_outlet ( name_outlet )
        `)
        .eq('kodekaryawan', kodeKaryawan)
        .maybeSingle();

      if (empError) {
        console.warn('Error fetching karyawan info for commission:', empError);
      }

      const dept = empData?.departemen || profile?.departemen || null;
      const outletName = (empData?.master_outlet as any)?.name_outlet || profile?.name_outlet || null;

      setKaryawanInfo({
        kodekaryawan: empData?.kodekaryawan || kodeKaryawan,
        idkaryawan: empData?.idkaryawan || profile?.idkaryawan || '-',
        namakaryawan: empData?.namakaryawan || profile?.namakaryawan || profile?.full_name || 'Staff Member',
        kode_outlet: empData?.kode_outlet || profile?.kode_outlet || null,
        name_outlet: outletName,
        departemen: dept,
      });

      // 2. Fetch Dynamic Commission Rate from master_komisi_rate
      if (dept) {
        const { data: rateData } = await supabase
          .from('master_komisi_rate')
          .select('rate_percent, nama_departemen')
          .eq('departemen', dept.toUpperCase())
          .eq('is_active', true)
          .maybeSingle();

        if (rateData?.rate_percent) {
          setCommissionRate(Number(rateData.rate_percent));
          setRateLabel(rateData.nama_departemen || dept);
        } else {
          // Default fallbacks
          if (dept.toUpperCase() === 'TR') {
            setCommissionRate(15);
            setRateLabel('Terapis Reguler');
          } else if (dept.toUpperCase() === 'TB') {
            setCommissionRate(10);
            setRateLabel('Terapis Baru');
          }
        }
      }
    } catch (e) {
      console.error('Error in commission header fetch:', e);
    }
  }, [kodeKaryawan, profile]);

  // 3. Fetch Treatment Transaction Records
  const fetchCommissionTransactions = useCallback(async () => {
    if (!kodeKaryawan || !startDate || !endDate) {
      setLoading(false);
      return;
    }

    // Check if therapist (TR or TB)
    const currentDept = (karyawanInfo?.departemen || profile?.departemen || '').trim().toUpperCase();
    if (currentDept !== 'TR' && currentDept !== 'TB') {
      setLoading(false);
      return;
    }

    setErrorMessage(null);
    try {
      const idkaryawan = karyawanInfo?.idkaryawan && karyawanInfo.idkaryawan !== '-' ? karyawanInfo.idkaryawan : null;

      // Filter: trans_type_id in ('BJ', 'BA'), id_payment not null, matching therapist
      let query = supabase
        .from('ot_pos_trans_detail')
        .select(`
          id,
          trans_id,
          tanggal,
          trans_type_id,
          produk_jasa_id,
          produk_jasa_nama,
          subtotal,
          kode_karyawan,
          therapist_id,
          id_payment
        `)
        .in('trans_type_id', ['BJ', 'BA'])
        .not('id_payment', 'is', null)
        .gte('tanggal', startDate)
        .lte('tanggal', endDate);

      // Match therapist by kode_karyawan OR therapist_id
      if (idkaryawan) {
        query = query.or(`kode_karyawan.eq.${kodeKaryawan},therapist_id.eq.${idkaryawan}`);
      } else {
        query = query.eq('kode_karyawan', kodeKaryawan);
      }

      const { data, error } = await query
        .order('tanggal', { ascending: false });

      if (error) {
        throw error;
      }

      setRecords((data as TransDetailRecord[]) || []);
    } catch (err: any) {
      console.error('Failed to load commission transactions:', err);
      setErrorMessage(err.message || 'Gagal memuat rincian transaksi komisi treatment.');
    } finally {
      setLoading(false);
    }
  }, [kodeKaryawan, startDate, endDate, karyawanInfo, profile]);

  useEffect(() => {
    fetchHeaderInfo();
  }, [fetchHeaderInfo]);

  useEffect(() => {
    if (karyawanInfo) {
      fetchCommissionTransactions();
    }
  }, [karyawanInfo, fetchCommissionTransactions]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchHeaderInfo(), fetchCommissionTransactions()]);
    setTimeout(() => setRefreshing(false), 400);
  };

  const selectedDaysCount = calculateDaysDiff(startDate, endDate);

  // Department Evaluation
  const userDept = (karyawanInfo?.departemen || profile?.departemen || '').trim().toUpperCase();
  const isTherapist = userDept === 'TR' || userDept === 'TB';

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

  // Calculations
  const rateMultiplier = commissionRate / 100;
  const totalSubtotal = records.reduce((acc, curr) => acc + (Number(curr.subtotal) || 0), 0);
  const totalEstimasiKomisi = Math.round(totalSubtotal * rateMultiplier);
  const totalTreatments = records.length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* 1. Header Card: Karyawan & Outlet Profile (Identical to View Payroll & Lihat Absensi) */}
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
                {karyawanInfo?.departemen ? `Departemen ${karyawanInfo.departemen}` : 'Staff Operasional'}
              </p>
            </div>
          </div>

          <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-zen-border/60">
            <span className="text-[11px] text-zen-charcoal/50">Status Terapis</span>
            <span
              className={`px-3 py-1 rounded-xl text-xs font-bold font-mono ${
                isTherapist
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80'
                  : 'bg-zinc-100 text-zinc-600'
              }`}
            >
              {isTherapist ? `${userDept} • ${rateLabel} (${commissionRate}%)` : 'Non-Terapis'}
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
              ID Finger / Therapist
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

      {/* 2. NON-THERAPIST RESTRICTION BANNER (Bahasa Indonesia) */}
      {!isTherapist && !loading && (
        <div className="bg-white rounded-3xl p-8 border border-zen-border shadow-xs text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-lg mx-auto">
            <h3 className="text-base sm:text-lg font-bold text-zen-charcoal font-serif">
              Akses Modul Khusus Terapis
            </h3>
            <p className="text-xs sm:text-sm text-zen-charcoal/70 leading-relaxed">
              Modul <strong>Lihat Komisi</strong> ini khusus diperuntukkan bagi staf <strong>Terapis</strong> (Departemen TR atau TB).
            </p>
            <p className="text-xs text-zen-charcoal/60 leading-relaxed pt-1">
              Akun Anda saat ini terdaftar pada Departemen{' '}
              <span className="font-bold text-zen-moss font-mono">
                {userDept || 'NON-TERAPIS'}
              </span>
              . Untuk melihat rincian penggajian resmi Anda, silakan akses modul{' '}
              <span className="font-semibold text-zen-charcoal">View Payroll (Slip Gaji)</span>.
            </p>
          </div>
        </div>
      )}

      {/* 3. THERAPIST COMMISSION INTERFACE */}
      {isTherapist && (
        <>
          {/* Top Action Bar: Date Pickers & Range Controller (Strict 1-7 Days) */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-zen-border shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-2xl bg-zen-matcha/15 flex items-center justify-center text-zen-moss shrink-0">
                  <Coins className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-base sm:text-lg font-bold text-zen-charcoal font-serif">
                      Lihat Komisi Treatment
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zen-matcha/15 text-zen-moss border border-zen-matcha/30">
                      Rate: {commissionRate}% ({userDept})
                    </span>
                  </div>
                  <p className="text-xs text-zen-charcoal/60">
                    Filter transaksi jasa terbayar (Rentang 1 - 7 Hari)
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
                  onClick={() => applyPreset(3)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    selectedDaysCount === 3 && endDate === getTodayLocalDateStr()
                      ? 'bg-zen-matcha text-white shadow-xs'
                      : 'bg-zen-linen hover:bg-zen-sand/30 text-zen-charcoal/70'
                  }`}
                >
                  3 Hari
                </button>
                <button
                  onClick={() => applyPreset(7)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    selectedDaysCount === 7 && endDate === getTodayLocalDateStr()
                      ? 'bg-zen-matcha text-white shadow-xs'
                      : 'bg-zen-linen hover:bg-zen-sand/30 text-zen-charcoal/70'
                  }`}
                >
                  7 Hari (Maksimal)
                </button>
              </div>
            </div>

            {/* Validation Message */}
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

          {/* 4. Hero Summary Card: Estimasi Pendapatan Komisi */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Hero Main: Estimasi Pendapatan Komisi */}
            <div className="md:col-span-2 bg-gradient-to-br from-zen-moss via-zen-moss/95 to-zen-charcoal text-white p-6 sm:p-7 rounded-3xl shadow-md relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />
              <div className="space-y-1 z-10">
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-zen-linen">
                  <Sparkles className="w-3.5 h-3.5 text-zen-matcha" />
                  <span>Estimasi Sementara</span>
                </div>
                <h3 className="text-xs uppercase tracking-wider text-white/70 font-semibold pt-2">
                  Estimasi Pendapatan Komisi
                </h3>
                <p className="text-2xl sm:text-4xl font-bold font-mono tracking-tight text-white pt-1">
                  {formatCurrency(totalEstimasiKomisi)}
                </p>
              </div>

              <div className="pt-6 flex flex-wrap items-center justify-between gap-2 border-t border-white/15 text-xs text-white/80 z-10">
                <span>
                  Periode: <strong className="text-white font-mono">{startDate}</strong> s/d{' '}
                  <strong className="text-white font-mono">{endDate}</strong>
                </span>
                <span className="bg-white/10 px-2.5 py-1 rounded-xl font-mono text-[11px]">
                  Rate Komisi: <strong>{commissionRate}%</strong>
                </span>
              </div>
            </div>

            {/* Stat Box: Total Treatments & Total Transaksi */}
            <div className="bg-white p-6 rounded-3xl border border-zen-border shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-zen-charcoal/50">
                  Ringkasan Kinerja
                </span>
                <div className="mt-3 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-zen-border/60">
                    <span className="text-xs text-zen-charcoal/70 flex items-center">
                      <Receipt className="w-3.5 h-3.5 mr-1.5 text-zen-moss" />
                      Jumlah Treatment
                    </span>
                    <span className="font-bold font-mono text-sm text-zen-charcoal">
                      {totalTreatments} Jasa
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zen-charcoal/70 flex items-center">
                      <Coins className="w-3.5 h-3.5 mr-1.5 text-zen-moss" />
                      Total Omzet Treatment
                    </span>
                    <span className="font-bold font-mono text-xs text-zen-charcoal">
                      {formatCurrency(totalSubtotal)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-zen-linen/60 border border-zen-border/70 text-[11px] text-zen-charcoal/70">
                Transaksi tipe <code className="font-mono font-bold text-zen-moss">BJ / BA</code> yang telah lunas dibayar kasir.
              </div>
            </div>
          </div>

          {/* 5. Treatment Records Table & Cards List */}
          <div className="bg-white rounded-3xl border border-zen-border shadow-xs overflow-hidden">
            <div className="p-5 sm:px-6 border-b border-zen-border flex items-center justify-between bg-zen-paper/60">
              <div className="flex items-center space-x-2.5">
                <Receipt className="w-4 h-4 text-zen-moss" />
                <h3 className="text-sm sm:text-base font-bold text-zen-charcoal font-serif">
                  Rincian Treatment Terbayar
                </h3>
                <span className="text-[11px] bg-zen-sand/30 text-zen-charcoal px-2 py-0.5 rounded-full font-mono font-bold">
                  {records.length} Jasa
                </span>
              </div>
              <span className="text-xs text-zen-charcoal/50">
                Tabel: <code className="font-mono text-[11px] text-zen-moss">ot_pos_trans_detail</code>
              </span>
            </div>

            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-zen-matcha/20 flex items-center justify-center animate-bounce text-zen-moss">
                  <Coins className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-zen-charcoal/70 animate-pulse">
                  Memuat data transaksi treatment...
                </p>
              </div>
            ) : records.length === 0 ? (
              <div className="py-16 px-4 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-zen-linen flex items-center justify-center text-zen-charcoal/40 mx-auto">
                  <Coins className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-zen-charcoal">Belum Ada Transaksi Treatment</h4>
                <p className="text-xs text-zen-charcoal/60 max-w-sm mx-auto">
                  Tidak ditemukan transaksi jasa treatment terbayar (tipe BJ / BA) atas nama Anda pada rentang tanggal {startDate} sampai {endDate}.
                </p>
              </div>
            ) : (
              <div>
                {/* Desktop View Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-zen-linen/60 text-zen-charcoal/60 font-semibold border-b border-zen-border">
                        <th className="py-3.5 px-6">Tanggal</th>
                        <th className="py-3.5 px-6">ID Transaksi</th>
                        <th className="py-3.5 px-6">Treatment / Layanan</th>
                        <th className="py-3.5 px-6 text-right">Harga Jasa</th>
                        <th className="py-3.5 px-6 text-center">Rate</th>
                        <th className="py-3.5 px-6 text-right">Estimasi Komisi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zen-border/60">
                      {records.map((rec) => {
                        const price = Number(rec.subtotal) || 0;
                        const komisi = Math.round(price * rateMultiplier);

                        return (
                          <tr key={rec.id} className="hover:bg-zen-linen/40 transition-colors">
                            {/* Tanggal */}
                            <td className="py-4 px-6 whitespace-nowrap">
                              <p className="font-bold text-zen-charcoal font-mono text-xs">
                                {rec.tanggal}
                              </p>
                              <p className="text-[11px] text-zen-charcoal/60">
                                {formatTanggalIndo(rec.tanggal)}
                              </p>
                            </td>

                            {/* ID Transaksi */}
                            <td className="py-4 px-6 whitespace-nowrap">
                              <span className="font-mono text-[11px] bg-zen-sand/20 px-2 py-0.5 rounded text-zen-charcoal">
                                {rec.trans_id || '-'}
                              </span>
                            </td>

                            {/* Treatment */}
                            <td className="py-4 px-6">
                              <div className="space-y-0.5 max-w-xs">
                                <p className="font-bold text-zen-charcoal truncate" title={rec.produk_jasa_nama}>
                                  {rec.produk_jasa_nama}
                                </p>
                                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-mono bg-zen-matcha/15 text-zen-moss">
                                  Tipe: {rec.trans_type_id}
                                </span>
                              </div>
                            </td>

                            {/* Harga */}
                            <td className="py-4 px-6 text-right font-mono font-semibold text-zen-charcoal whitespace-nowrap">
                              {formatCurrency(price)}
                            </td>

                            {/* Rate */}
                            <td className="py-4 px-6 text-center whitespace-nowrap">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-zen-matcha/15 text-zen-moss">
                                {commissionRate}%
                              </span>
                            </td>

                            {/* Komisi */}
                            <td className="py-4 px-6 text-right whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-mono font-bold text-xs">
                                {formatCurrency(komisi)}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-zen-paper border-t-2 border-zen-border font-bold">
                        <td colSpan={3} className="py-4 px-6 text-zen-charcoal text-xs uppercase tracking-wider">
                          Total Estimasi ({records.length} Treatment)
                        </td>
                        <td className="py-4 px-6 text-right font-mono text-zen-charcoal text-xs">
                          {formatCurrency(totalSubtotal)}
                        </td>
                        <td className="py-4 px-6 text-center text-xs font-mono text-zen-moss">
                          {commissionRate}%
                        </td>
                        <td className="py-4 px-6 text-right font-mono text-emerald-700 text-sm">
                          {formatCurrency(totalEstimasiKomisi)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Mobile View Card List */}
                <div className="md:hidden divide-y divide-zen-border/60">
                  {records.map((rec) => {
                    const price = Number(rec.subtotal) || 0;
                    const komisi = Math.round(price * rateMultiplier);

                    return (
                      <div key={rec.id} className="p-4 space-y-2.5 hover:bg-zen-linen/30 transition-colors">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-0.5">
                            <h4 className="font-bold text-zen-charcoal text-xs leading-snug">
                              {rec.produk_jasa_nama}
                            </h4>
                            <p className="text-[10px] text-zen-charcoal/50 font-mono">
                              {rec.tanggal} • {rec.trans_id}
                            </p>
                          </div>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-zen-matcha/15 text-zen-moss shrink-0">
                            {commissionRate}%
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                          <div className="p-2 rounded-xl bg-zen-linen/60 border border-zen-border/60">
                            <span className="text-[10px] text-zen-charcoal/50 block">Harga Treatment</span>
                            <span className="font-mono font-semibold text-zen-charcoal text-xs">
                              {formatCurrency(price)}
                            </span>
                          </div>

                          <div className="p-2 rounded-xl bg-emerald-50/70 border border-emerald-200/60">
                            <span className="text-[10px] font-bold text-emerald-800 block">Estimasi Komisi</span>
                            <span className="font-mono font-bold text-emerald-950 text-xs">
                              {formatCurrency(komisi)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 6. BOTTOM DISCLAIMER BANNER (Bahasa Indonesia) */}
          <div className="p-4 sm:p-5 rounded-3xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs sm:text-[13px] flex items-start space-x-3 shadow-xs">
            <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1 leading-relaxed">
              <p className="font-bold text-amber-950">
                Pemberitahuan Resmi Mengenai Nilai Estimasi Komisi:
              </p>
              <p className="text-amber-900/90 text-xs">
                Nilai komisi di atas merupakan <strong>estimasi sementara</strong> berdasarkan transaksi jasa treatment yang telah lunas dibayar kasir pada rentang tanggal terpilih. Nilai komisi resmi dan final akan diverifikasi serta dicairkan melalui slip gaji di menu <strong>View Payroll</strong>.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CommissionPage;
