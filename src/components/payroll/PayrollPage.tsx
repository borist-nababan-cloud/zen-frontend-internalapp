import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import {
  Wallet,
  Calendar,
  Building2,
  Fingerprint,
  Clock,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Coins,
  CheckCircle2,
  Hash,
  Activity,
  HeartPulse,
  Ban,
  UserCheck,
} from 'lucide-react';

interface KaryawanHeaderInfo {
  kodekaryawan: string;
  idkaryawan: string | null;
  namakaryawan: string;
  kode_outlet: string | null;
  name_outlet?: string | null;
}

interface PayrollRecord {
  id: string;
  kode_outlet: string;
  kodekaryawan: string;
  payrollperiode: string;
  nilaithp: number;
  payroll_data: {
    hcuti?: number | string;
    halpa?: number | string;
    hlate1?: number | string;
    hlate2?: number | string;
    hsakit?: number | string;
    komisi?: number | string;
    [key: string]: any;
  } | null;
  created_at?: string;
}

export const PayrollPage: React.FC = () => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [availablePeriods, setAvailablePeriods] = useState<string[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [karyawanInfo, setKaryawanInfo] = useState<KaryawanHeaderInfo | null>(null);
  const [currentPayroll, setCurrentPayroll] = useState<PayrollRecord | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const kodeKaryawan = profile?.kodekaryawan?.trim();

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

  // Human-readable Period Formatter (e.g., '2026-09' -> 'September 2026')
  const formatPeriodLabel = (periodStr: string) => {
    if (!periodStr) return '-';
    // Format if YYYY-MM
    if (/^\d{4}-\d{2}$/.test(periodStr)) {
      const [year, month] = periodStr.split('-');
      const monthNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
      ];
      const mIdx = parseInt(month, 10) - 1;
      if (mIdx >= 0 && mIdx < 12) {
        return `${monthNames[mIdx]} ${year}`;
      }
    }
    return `Periode ${periodStr}`;
  };

  // Fetch Karyawan Header & List of Available Periods
  const loadInitialPayrollData = useCallback(async () => {
    if (!kodeKaryawan) {
      setLoading(false);
      return;
    }

    setErrorMessage(null);
    try {
      // 1. Fetch Header Info from ot_hrd_karyawan_info & master_outlet
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
        console.warn('Error fetching karyawan info:', empError);
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
        // Fallback from profile context
        setKaryawanInfo({
          kodekaryawan: kodeKaryawan,
          idkaryawan: '-',
          namakaryawan: profile?.namakaryawan || profile?.full_name || 'Staff Member',
          kode_outlet: profile?.kode_outlet || null,
          name_outlet: profile?.name_outlet || null,
        });
      }

      // 2. Fetch distinct available periods for this employee
      const { data: periodsData, error: periodsError } = await supabase
        .from('ot_hrd_karyawan_payroll_details')
        .select('payrollperiode')
        .eq('kodekaryawan', kodeKaryawan)
        .order('payrollperiode', { ascending: false });

      if (periodsError) {
        throw periodsError;
      }

      if (periodsData && periodsData.length > 0) {
        // Filter unique non-null periods
        const uniquePeriods = Array.from(
          new Set(periodsData.map((p) => p.payrollperiode).filter(Boolean))
        ) as string[];

        setAvailablePeriods(uniquePeriods);

        if (uniquePeriods.length > 0) {
          // Select latest period by default
          setSelectedPeriod((prev) => (prev && uniquePeriods.includes(prev) ? prev : uniquePeriods[0]));
        }
      } else {
        setAvailablePeriods([]);
        setCurrentPayroll(null);
      }
    } catch (err: any) {
      console.error('Failed to load initial payroll data:', err);
      setErrorMessage(err.message || 'Gagal memuat daftar slip gaji.');
    } finally {
      setLoading(false);
    }
  }, [kodeKaryawan, profile]);

  // Fetch Payroll Details for Selected Period
  const loadPeriodDetail = useCallback(
    async (period: string) => {
      if (!kodeKaryawan || !period) {
        setCurrentPayroll(null);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('ot_hrd_karyawan_payroll_details')
          .select('*')
          .eq('kodekaryawan', kodeKaryawan)
          .eq('payrollperiode', period)
          .maybeSingle();

        if (error) {
          throw error;
        }

        setCurrentPayroll(data as PayrollRecord);
      } catch (err: any) {
        console.error('Failed to load payroll details for period:', err);
        setErrorMessage(err.message || 'Gagal memuat rincian gaji untuk periode ini.');
      }
    },
    [kodeKaryawan]
  );

  useEffect(() => {
    loadInitialPayrollData();
  }, [loadInitialPayrollData]);

  useEffect(() => {
    if (selectedPeriod) {
      loadPeriodDetail(selectedPeriod);
    }
  }, [selectedPeriod, loadPeriodDetail]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadInitialPayrollData();
    if (selectedPeriod) {
      await loadPeriodDetail(selectedPeriod);
    }
    setTimeout(() => setRefreshing(false), 400);
  };

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

  // State: Loading
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-12 flex flex-col items-center justify-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-zen-matcha/20 flex items-center justify-center animate-bounce text-zen-moss">
          <Wallet className="w-6 h-6" />
        </div>
        <p className="text-xs font-semibold text-zen-charcoal/70 animate-pulse">
          Memuat rincian slip gaji...
        </p>
      </div>
    );
  }

  const pData = currentPayroll?.payroll_data || {};
  const cuti = pData.hcuti ?? 0;
  const alpa = pData.halpa ?? 0;
  const late1 = pData.hlate1 ?? 0;
  const late2 = pData.hlate2 ?? 0;
  const sakit = pData.hsakit ?? 0;
  const komisiRaw = pData.komisi ?? 0;
  const thpAmount = currentPayroll?.nilaithp ?? 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Action Bar: Period Selector & Refresh */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 sm:px-6 rounded-3xl border border-zen-border shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-zen-matcha/15 flex items-center justify-center text-zen-moss">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-zen-charcoal font-serif">Slip Gaji & Komisi</h2>
            <p className="text-xs text-zen-charcoal/60">Rincian resmi penggajian staf Zen</p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 w-full sm:w-auto">
          {/* Period Dropdown */}
          <div className="relative flex-1 sm:w-56">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zen-moss">
              <Calendar className="w-4 h-4" />
            </div>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              disabled={availablePeriods.length === 0}
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-zen-border bg-zen-linen/60 text-xs font-bold text-zen-charcoal focus:outline-hidden focus:ring-2 focus:ring-zen-matcha transition-all appearance-none cursor-pointer"
            >
              {availablePeriods.length > 0 ? (
                availablePeriods.map((period) => (
                  <option key={period} value={period}>
                    {formatPeriodLabel(period)}
                  </option>
                ))
              ) : (
                <option value="">Belum Ada Data Periode</option>
              )}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-zen-charcoal/40">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2.5 rounded-xl border border-zen-border bg-white hover:bg-zen-linen text-zen-charcoal transition-all active:scale-95 shrink-0"
            title="Muat Ulang"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-zen-moss' : 'text-zen-charcoal/70'}`} />
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 1. Header Card: Karyawan & Outlet Profile */}
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
            <span className="text-[11px] text-zen-charcoal/50">Periode Slip</span>
            <span className="px-3 py-1 rounded-xl bg-zen-sand/20 text-zen-charcoal text-xs font-bold font-mono">
              {selectedPeriod || '-'}
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
            <p className="font-bold text-zen-charcoal truncate" title={karyawanInfo?.name_outlet || karyawanInfo?.kode_outlet || '-'}>
              {karyawanInfo?.name_outlet || (karyawanInfo?.kode_outlet ? `Outlet ${karyawanInfo.kode_outlet}` : '-')}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Hero THP Card: Take Home Pay */}
      <div className="bg-gradient-to-br from-white via-zen-linen/40 to-zen-matcha/15 rounded-3xl p-6 sm:p-8 border border-zen-matcha/30 shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-zen-charcoal/60">
                Take Home Pay (THP)
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-zen-matcha text-white">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Final
              </span>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-zen-charcoal font-serif tracking-tight">
              {formatCurrency(thpAmount)}
            </div>
            <p className="text-xs text-zen-charcoal/60">
              Total pendapatan bersih periode <span className="font-semibold text-zen-charcoal">{formatPeriodLabel(selectedPeriod)}</span>
            </p>
          </div>

          <div className="flex items-center space-x-2 p-3 rounded-2xl bg-white/80 border border-zen-matcha/30 backdrop-blur-xs text-xs font-semibold text-zen-moss self-stretch sm:self-auto justify-center">
            <Sparkles className="w-4 h-4" />
            <span>Telah Diproses HRD</span>
          </div>
        </div>
      </div>

      {/* 3. Detail Metrik Absensi & Komisi (from payroll_data JSONB) */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-zen-border shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-zen-border/70">
          <div className="flex items-center space-x-2 text-zen-charcoal">
            <Activity className="w-4 h-4 text-zen-moss" />
            <h4 className="font-bold text-sm font-serif">Rincian Kehadiran & Komisi</h4>
          </div>
          <span className="text-[11px] text-zen-charcoal/50">Data Payroll Terverifikasi</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 sm:gap-4">
          {/* Cuti */}
          <div className="p-4 rounded-2xl bg-zen-linen/60 border border-zen-border/60 hover:border-zen-matcha/40 transition-colors">
            <div className="flex items-center justify-between text-zen-charcoal/60 mb-2">
              <span className="text-xs font-medium">Cuti</span>
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Calendar className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-zen-charcoal font-mono">
              {cuti} <span className="text-xs font-sans font-normal text-zen-charcoal/60">Hari</span>
            </div>
          </div>

          {/* Sakit */}
          <div className="p-4 rounded-2xl bg-zen-linen/60 border border-zen-border/60 hover:border-zen-matcha/40 transition-colors">
            <div className="flex items-center justify-between text-zen-charcoal/60 mb-2">
              <span className="text-xs font-medium">Sakit</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <HeartPulse className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-zen-charcoal font-mono">
              {sakit} <span className="text-xs font-sans font-normal text-zen-charcoal/60">Hari</span>
            </div>
          </div>

          {/* Alpa */}
          <div className="p-4 rounded-2xl bg-zen-linen/60 border border-zen-border/60 hover:border-zen-matcha/40 transition-colors">
            <div className="flex items-center justify-between text-zen-charcoal/60 mb-2">
              <span className="text-xs font-medium">Alpa</span>
              <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                <Ban className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-zen-charcoal font-mono">
              {alpa} <span className="text-xs font-sans font-normal text-zen-charcoal/60">Hari</span>
            </div>
          </div>

          {/* Terlambat < 30 */}
          <div className="p-4 rounded-2xl bg-zen-linen/60 border border-zen-border/60 hover:border-zen-matcha/40 transition-colors">
            <div className="flex items-center justify-between text-zen-charcoal/60 mb-2">
              <span className="text-xs font-medium">Terlambat &lt; 30</span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-zen-charcoal font-mono">
              {late1} <span className="text-xs font-sans font-normal text-zen-charcoal/60">Kali</span>
            </div>
          </div>

          {/* Terlambat >= 30 */}
          <div className="p-4 rounded-2xl bg-zen-linen/60 border border-zen-border/60 hover:border-zen-matcha/40 transition-colors">
            <div className="flex items-center justify-between text-zen-charcoal/60 mb-2">
              <span className="text-xs font-medium">Terlambat &ge; 30</span>
              <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                <Clock className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-zen-charcoal font-mono">
              {late2} <span className="text-xs font-sans font-normal text-zen-charcoal/60">Kali</span>
            </div>
          </div>

          {/* Komisi */}
          <div className="p-4 rounded-2xl bg-zen-linen/60 border border-zen-border/60 hover:border-zen-matcha/40 transition-colors">
            <div className="flex items-center justify-between text-zen-charcoal/60 mb-2">
              <span className="text-xs font-medium">Komisi</span>
              <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <Coins className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-zen-charcoal font-mono truncate" title={formatCurrency(komisiRaw)}>
              {formatCurrency(komisiRaw)}
            </div>
          </div>
        </div>
      </div>

      {/* Note / Disclaimer Footer */}
      <div className="p-4 rounded-2xl bg-zen-sand/15 border border-zen-sand/30 text-[11px] text-zen-charcoal/70 flex items-start space-x-2.5">
        <Sparkles className="w-4 h-4 text-zen-moss shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Slip gaji ini diterbitkan secara otomatis dari data terintegrasi sinkronisasi Payroll Zen Family Spa & Reflexology. Jika terdapat perbedaan data kehadiran atau komisi, silakan hubungi bagian HRD atau Admin Outlet Anda.
        </p>
      </div>
    </div>
  );
};

export default PayrollPage;
