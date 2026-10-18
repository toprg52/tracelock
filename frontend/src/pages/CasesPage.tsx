import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderGit2,
  Search,
  Filter,
  RefreshCw,
  ArrowRight,
  FileCode,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  X,
  Plus,
  SlidersHorizontal,
} from 'lucide-react';
import { useDemoMode } from '../context/DemoModeContext';
import { DataTable, Column, MiddleTruncate } from '../components/ui/DataTable';
import { Badge, BadgeVariant } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { SegmentedControl } from '../components/ui/SegmentedControl';

export interface CaseItem {
  id: string;
  case_number: string;
  sha256: string;
  filename: string;
  status: string;
  created_at: string;
  risk_score: number | null;
  verdict: string | null;
}

type SeverityFilter = 'all' | 'critical' | 'high' | 'medium' | 'low' | 'pending';

// Rich sample data for Demo mode
const DEMO_CASES: CaseItem[] = [
  {
    id: 'case-demo-92',
    case_number: 'BC-9201',
    filename: 'demo_sample.apk',
    sha256: 'bfb624ea3887d197607a72382cf8943793e2b38cd4857b61f891b9201974de31',
    risk_score: 92,
    verdict: 'Anubis Banking Trojan',
    status: 'COMPLETED',
    created_at: '2026-10-18T02:15:00Z',
  },
  {
    id: 'case-demo-02',
    case_number: 'BC-8812',
    filename: 'delivery_tracker_update.apk',
    sha256: 'f3a09b456123456789abcdef1234567890abcdef1234567890abcdef92e10',
    risk_score: 88,
    verdict: 'TeaBot Spyware',
    status: 'COMPLETED',
    created_at: '2026-10-17T18:40:00Z',
  },
  {
    id: 'case-demo-03',
    case_number: 'BC-7840',
    filename: 'secure_auth_token.apk',
    sha256: 'e4d29a123456789abcdef1234567890abcdef1234567890abcdef12345678',
    risk_score: 86,
    verdict: 'Cerberus Trojan',
    status: 'COMPLETED',
    created_at: '2026-10-16T11:20:00Z',
  },
  {
    id: 'case-demo-04',
    case_number: 'BC-6421',
    filename: 'system_optimizer_pro.apk',
    sha256: 'c1b2a3456789abcdef1234567890abcdef1234567890abcdef1234567890ab',
    risk_score: 65,
    verdict: 'SpyNote RAT',
    status: 'COMPLETED',
    created_at: '2026-10-15T09:10:00Z',
  },
  {
    id: 'case-demo-05',
    case_number: 'BC-5412',
    filename: 'utility_fast_connect.apk',
    sha256: 'a9b8c7123456789abcdef1234567890abcdef1234567890abcdef12345678cd',
    risk_score: 32,
    verdict: 'Adware / PUA',
    status: 'COMPLETED',
    created_at: '2026-10-14T14:30:00Z',
  },
  {
    id: 'case-demo-06',
    case_number: 'BC-4903',
    filename: 'flappy_bird_mod_unlocked.apk',
    sha256: '5a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b',
    risk_score: 79,
    verdict: 'Joker SMS Trojan',
    status: 'COMPLETED',
    created_at: '2026-10-13T16:22:00Z',
  },
  {
    id: 'case-demo-07',
    case_number: 'BC-3829',
    filename: 'pdf_reader_light.apk',
    sha256: '11223344556677889900aabbccddeeff11223344556677889900aabbccddeeff',
    risk_score: 15,
    verdict: 'Clean Utility',
    status: 'COMPLETED',
    created_at: '2026-10-12T10:05:00Z',
  },
  {
    id: 'case-demo-08',
    case_number: 'BC-2715',
    filename: 'bank_account_statement.apk',
    sha256: 'aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899',
    risk_score: 94,
    verdict: 'FluBot Stealer',
    status: 'COMPLETED',
    created_at: '2026-10-11T08:14:00Z',
  },
  {
    id: 'case-demo-09',
    case_number: 'BC-1650',
    filename: 'device_health_check.apk',
    sha256: '99887766554433221100ffeeddccbbaa99887766554433221100ffeeddccbbaa',
    risk_score: 58,
    verdict: 'Suspicious Accessibility Monitor',
    status: 'COMPLETED',
    created_at: '2026-10-10T19:45:00Z',
  },
  {
    id: 'case-demo-10',
    case_number: 'BC-0542',
    filename: 'incoming_transfer_verify.apk',
    sha256: '33445566778899001122aabbccddeeff33445566778899001122aabbccddeeff',
    risk_score: null,
    verdict: null,
    status: 'QUEUED',
    created_at: '2026-10-10T04:12:00Z',
  },
  {
    id: 'case-demo-11',
    case_number: 'BC-0210',
    filename: 'call_recorder_pro.apk',
    sha256: '44556677889900112233aabbccddeeff44556677889900112233aabbccddeeff',
    risk_score: 18,
    verdict: 'Clean Utility',
    status: 'COMPLETED',
    created_at: '2026-10-09T13:20:00Z',
  },
  {
    id: 'case-demo-12',
    case_number: 'BC-0104',
    filename: 'crypto_mining_booster.apk',
    sha256: '77889900112233445566aabbccddeeff77889900112233445566aabbccddeeff',
    risk_score: 62,
    verdict: 'CoinMiner Riskware',
    status: 'COMPLETED',
    created_at: '2026-10-08T22:30:00Z',
  },
];

export function CasesPage() {
  const navigate = useNavigate();
  const { isDemoMode } = useDemoMode();

  const [isLoading, setIsLoading] = useState(false);
  const [realCases, setRealCases] = useState<CaseItem[]>([]);

  // Filtering, search, sort & pagination state
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('all');
  const [sortColumn, setSortColumn] = useState<string>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Fetch real cases from backend
  const fetchCases = async () => {
    if (isDemoMode) return;
    setIsLoading(true);
    try {
      // Query GET /api/v1/cases with limit=100 for comprehensive local filtering
      const res = await fetch('/api/v1/cases?page=1&limit=100');
      if (res.ok) {
        const data = await res.json();
        setRealCases(Array.isArray(data) ? data : []);
      } else {
        setRealCases([]);
      }
    } catch {
      setRealCases([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isDemoMode) {
      fetchCases();
    }
  }, [isDemoMode]);

  const rawCases = isDemoMode ? DEMO_CASES : realCases;

  // Filter and search logic
  const filteredCases = useMemo(() => {
    return rawCases.filter((item) => {
      // Severity Filter
      if (severityFilter !== 'all') {
        const score = item.risk_score;
        if (severityFilter === 'pending') {
          if (score !== null && score !== undefined && item.status === 'COMPLETED') return false;
        } else if (score === null || score === undefined) {
          return false;
        } else if (severityFilter === 'critical') {
          if (score < 80) return false;
        } else if (severityFilter === 'high') {
          if (score < 60 || score >= 80) return false;
        } else if (severityFilter === 'medium') {
          if (score < 40 || score >= 60) return false;
        } else if (severityFilter === 'low') {
          if (score >= 40) return false;
        }
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = item.filename.toLowerCase().includes(q);
        const matchNumber = (item.case_number || '').toLowerCase().includes(q);
        const matchHash = item.sha256.toLowerCase().includes(q);
        const matchVerdict = (item.verdict || '').toLowerCase().includes(q);
        if (!matchName && !matchNumber && !matchHash && !matchVerdict) {
          return false;
        }
      }

      return true;
    });
  }, [rawCases, severityFilter, searchQuery]);

  // Sorting logic
  const sortedCases = useMemo(() => {
    const list = [...filteredCases];
    list.sort((a, b) => {
      let aVal: any = a[sortColumn as keyof CaseItem];
      let bVal: any = b[sortColumn as keyof CaseItem];

      if (sortColumn === 'risk_score') {
        aVal = a.risk_score ?? -1;
        bVal = b.risk_score ?? -1;
      } else if (sortColumn === 'created_at') {
        aVal = new Date(a.created_at).getTime() || 0;
        bVal = new Date(b.created_at).getTime() || 0;
      } else if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = (bVal || '').toLowerCase();
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [filteredCases, sortColumn, sortDirection]);

  // Reset page when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, severityFilter, pageSize]);

  // Pagination calculation
  const totalItems = sortedCases.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedCases = sortedCases.slice(startIndex, startIndex + pageSize);

  // Handle column sorting toggle
  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(columnKey);
      setSortDirection('desc');
    }
  };

  // Format date helper
  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return isoStr;
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  // Severity helper
  const getSeverityBadge = (score: number | null | undefined, status: string) => {
    if (score === null || score === undefined || status !== 'COMPLETED') {
      return (
        <Badge variant="neutral" size="sm" dot>
          Pending
        </Badge>
      );
    }
    let variant: BadgeVariant = 'low';
    let label = 'Low';
    if (score >= 80) {
      variant = 'critical';
      label = 'Critical';
    } else if (score >= 60) {
      variant = 'high';
      label = 'High';
    } else if (score >= 40) {
      variant = 'medium';
      label = 'Medium';
    }
    return (
      <Badge variant={variant} size="sm" dot>
        {label}
      </Badge>
    );
  };

  // DataTable column definitions
  const columns: Column<CaseItem>[] = [
    {
      key: 'case_number',
      header: 'Case #',
      sortable: true,
      width: '120px',
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-text">
          {row.case_number || 'BC-N/A'}
        </span>
      ),
    },
    {
      key: 'filename',
      header: 'Binary / Hash',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-md bg-surface-raised border border-border flex items-center justify-center text-accent shrink-0">
            <FileCode className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <span className="font-semibold text-text truncate block text-xs">
              {row.filename}
            </span>
            <MiddleTruncate
              value={row.sha256}
              startChars={7}
              endChars={7}
              className="text-[11px] text-text-muted"
            />
          </div>
        </div>
      ),
    },
    {
      key: 'verdict',
      header: 'Verdict / Threat Family',
      render: (row) => (
        <span className="text-xs text-text font-medium truncate block max-w-[220px]">
          {row.verdict || (
            <span className="text-text-muted italic">Unclassified Binary</span>
          )}
        </span>
      ),
    },
    {
      key: 'severity',
      header: 'Severity',
      align: 'center',
      render: (row) => getSeverityBadge(row.risk_score, row.status),
    },
    {
      key: 'risk_score',
      header: 'Risk Score',
      sortable: true,
      align: 'right',
      render: (row) => (
        <span className="font-mono tabular-nums text-xs font-semibold text-text">
          {row.risk_score !== null && row.risk_score !== undefined
            ? `${row.risk_score}/100`
            : '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (row) => {
        const isDone = row.status === 'COMPLETED';
        return (
          <Badge variant={isDone ? 'low' : 'neutral'} size="sm">
            {row.status}
          </Badge>
        );
      },
    },
    {
      key: 'created_at',
      header: 'Created At',
      sortable: true,
      align: 'right',
      render: (row) => (
        <span className="font-mono text-text-muted text-[11px] whitespace-nowrap">
          {formatDate(row.created_at)}
        </span>
      ),
    },
  ];

  // Skeletons while loading
  if (isLoading && !isDemoMode) {
    return (
      <div className="space-y-6 max-w-[1600px] mx-auto py-2">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div className="space-y-1.5">
            <Skeleton width="180px" height="24px" />
            <Skeleton width="300px" height="14px" />
          </div>
          <Skeleton width="120px" height="32px" className="rounded-lg" />
        </div>

        {/* Toolbar Skeleton */}
        <div className="p-4 bg-surface border border-border rounded-xl space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <Skeleton width="280px" height="36px" className="rounded-lg" />
            <Skeleton width="340px" height="36px" className="rounded-lg" />
          </div>
        </div>

        {/* Table Skeleton */}
        <Card className="p-5 space-y-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} height="52px" className="rounded-lg" />
          ))}
        </Card>
      </div>
    );
  }

  // Repository-level Empty State (0 cases in DB, real mode)
  if (!isDemoMode && rawCases.length === 0) {
    return (
      <div className="py-16 max-w-2xl mx-auto space-y-6">
        <EmptyState
          icon={<FolderGit2 className="w-8 h-8 text-accent" />}
          title="No forensic cases recorded"
          description="Your forensic case repository is empty. Upload an Android application package (.apk) to initiate automated static heuristics, dynamic threat emulation, and evidence verification."
          action={
            <Button
              variant="primary"
              iconRight={<ArrowRight className="w-4 h-4" />}
              onClick={() => navigate('/analyze')}
            >
              Analyze an APK
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto py-1">
      {/* Page Title & Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-text">
              Forensic Case Repository
            </h2>
            {isDemoMode && (
              <Badge variant="demo" size="sm">
                Demo data
              </Badge>
            )}
          </div>
          <p className="text-xs text-text-muted">
            Searchable historical catalog of classified APK binaries, heuristic scores, and chain-of-custody artifacts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isDemoMode && (
            <Button
              variant="secondary"
              size="sm"
              iconLeft={<RefreshCw className="w-3.5 h-3.5" />}
              onClick={fetchCases}
            >
              Refresh cases
            </Button>
          )}
          <Button
            variant="primary"
            size="sm"
            iconRight={<Plus className="w-3.5 h-3.5" />}
            onClick={() => navigate('/analyze')}
          >
            New case
          </Button>
        </div>
      </div>

      {/* Control Bar: Search, Severity Filter & Page Size */}
      <Card className="p-4 space-y-3.5 shadow-sm">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px] max-w-lg">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search case #, filename, SHA-256, threat family..."
              className="w-full bg-surface-raised border border-border rounded-lg pl-9 pr-8 py-1.5 text-xs text-text placeholder:text-text-muted focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text p-0.5"
                title="Clear search"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Severity Segmented Filter */}
          <div className="overflow-x-auto pb-1 lg:pb-0">
            <SegmentedControl<SeverityFilter>
              size="sm"
              value={severityFilter}
              onChange={setSeverityFilter}
              options={[
                { value: 'all', label: 'All' },
                { value: 'critical', label: 'Critical' },
                { value: 'high', label: 'High' },
                { value: 'medium', label: 'Medium' },
                { value: 'low', label: 'Low' },
                { value: 'pending', label: 'Pending' },
              ]}
              ariaLabel="Filter cases by severity level"
            />
          </div>
        </div>

        {/* Results Metadata & Clear Filters */}
        <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px] text-text-muted font-mono">
          <div className="flex items-center gap-2">
            <span>
              Showing {filteredCases.length} of {rawCases.length} total cases
            </span>
            {(searchQuery || severityFilter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSeverityFilter('all');
                }}
                className="text-accent hover:underline flex items-center gap-1 font-sans text-xs ml-2 cursor-pointer"
              >
                Reset filters
              </button>
            )}
          </div>

          {/* Page Size Selector */}
          <div className="flex items-center gap-2">
            <span className="font-sans text-[11px] text-text-muted">Per page:</span>
            {[10, 25, 50].map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={() => setPageSize(sz)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                  pageSize === sz
                    ? 'bg-accent/15 text-accent font-bold border border-accent/40'
                    : 'text-text-muted hover:text-text hover:bg-surface-raised'
                }`}
              >
                {sz}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Main DataTable View */}
      <Card className="p-5 space-y-4 shadow-card">
        <DataTable
          columns={columns}
          data={paginatedCases}
          keyExtractor={(r) => r.id}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={handleSort}
          onRowClick={(row) => navigate(`/cases/${row.id}`)}
          density="normal"
          emptyState={
            <div className="py-12 text-center space-y-2">
              <p className="text-xs font-semibold text-text">No matching cases found</p>
              <p className="text-[11px] text-text-muted">
                No cases match the active filter parameters or search query.
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setSeverityFilter('all');
                }}
                className="mt-2"
              >
                Clear all filters
              </Button>
            </div>
          }
        />

        {/* Pagination Footer */}
        {totalItems > 0 && (
          <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-muted">
            <span className="font-mono text-[11px]">
              Showing {startIndex + 1} to {Math.min(startIndex + pageSize, totalItems)} of {totalItems} cases
            </span>

            <div className="flex items-center gap-1">
              <Button
                variant="secondary"
                size="sm"
                iconLeft={<ChevronLeft className="w-3.5 h-3.5" />}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>

              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                  // Only show current, first, last, and immediate siblings if totalPages is large
                  if (
                    totalPages > 7 &&
                    p !== 1 &&
                    p !== totalPages &&
                    Math.abs(p - currentPage) > 1
                  ) {
                    if (p === 2 || p === totalPages - 1) {
                      return (
                        <span key={p} className="px-1 font-mono text-text-muted">
                          …
                        </span>
                      );
                    }
                    return null;
                  }

                  const isCurrent = p === currentPage;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setCurrentPage(p)}
                      className={`w-7 h-7 rounded-md font-mono text-xs font-medium transition-colors ${
                        isCurrent
                          ? 'bg-accent text-surface font-bold shadow-sm'
                          : 'text-text-muted hover:text-text hover:bg-surface-raised'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>

              <Button
                variant="secondary"
                size="sm"
                iconRight={<ChevronRight className="w-3.5 h-3.5" />}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

export default CasesPage;
