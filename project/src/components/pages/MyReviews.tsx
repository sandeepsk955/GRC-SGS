import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import PerformReview from "./PerformReview";
import { notificationService } from "../../services/notificationService";

type Row = {
  assignmentId: string;
  activityTitle: string;
  activityDetail: string;
  actualStartDate: string;
  actualEndDate: string;
  plannedStartDate: string;
  plannedEndDate: string;
};

type SortKey = keyof Row;
type SortDir = "asc" | "desc";

const formatMDY = (isoLike?: string) => {
  if (!isoLike) return "";
  const d = new Date(isoLike);
  if (Number.isNaN(d.getTime())) return isoLike;
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
};

const fromSession = (key: string) =>
  (typeof window === "undefined" ? "" : window.sessionStorage.getItem(key) || "").trim();

export default function MyReviews() {
  const getStoredGovId = () => {
    const stored = sessionStorage.getItem("selectedDomain");
    if (stored) {
      try {
        return JSON.parse(stored).id || "2";
      } catch {
        return "2";
      }
    }
    return "2";
  };

  const [customerId, setCustomerId] = useState<string>(fromSession("customerId") || "4");
  const [userId, setUserId] = useState<string>(fromSession("userid") || fromSession("userId") || "3");
  const [govId, setGovId] = useState<string>(getStoredGovId());

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [sortKey, setSortKey] = useState<SortKey>("activityTitle");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [query, setQuery] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);

  // ✅ Refresh function to reload reviews data
  const refreshReviews = async () => {
    const c = parseInt(customerId, 10);
    const u = parseInt(userId, 10);
    const g = parseInt(govId, 10);
    if (![c, u, g].every(Number.isFinite)) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await notificationService.getReviews(c, u, g);

      const mapped: Row[] = (data ?? []).map<Row>((n) => ({
        assignmentId: String(n.assignmentId ?? ""),
        activityTitle: (n.activityTitle ?? n.activity ?? "") as string,
        activityDetail: (n.activity ?? "") as string,
        actualStartDate: formatMDY(n.actualStartDate || undefined),
        actualEndDate: formatMDY(n.actualEndDate || undefined),
        plannedStartDate: formatMDY((n.plannedStartdate ?? (n as any).plannedStartDate) || undefined),
        plannedEndDate: formatMDY(n.plannedEndDate || undefined),
      }));

      setRows(mapped);
    } catch (e: any) {
      setError(e?.message || "Failed to load data.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = () => {
      setCustomerId(fromSession("customerId") || "4");
      setUserId(fromSession("userid") || fromSession("userId") || "3");
      setGovId(getStoredGovId());
    };
    handler();
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  useEffect(() => {
    const c = parseInt(customerId, 10);
    const u = parseInt(userId, 10);
    const g = parseInt(govId, 10);
    if (![c, u, g].every(Number.isFinite)) {
      setError("customerId, userId and govId must be integers.");
      setRows([]);
      return;
    }

    setLoading(true);
    setError(null);

    (async () => {
      try {
        const data = await notificationService.getReviews(c, u, g);

        const mapped: Row[] = (data ?? []).map<Row>((n) => ({
          assignmentId: String(n.assignmentId ?? ""),
          activityTitle: (n.activityTitle ?? n.activity ?? "") as string,
          activityDetail: (n.activity ?? "") as string,
          actualStartDate: formatMDY(n.actualStartDate || undefined),
          actualEndDate: formatMDY(n.actualEndDate || undefined),
          plannedStartDate: formatMDY((n.plannedStartdate ?? (n as any).plannedStartDate) || undefined),
          plannedEndDate: formatMDY(n.plannedEndDate || undefined),
        }));

        setRows(mapped);
      } catch (e: any) {
        setError(e?.message || "Failed to load data.");
        setRows([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [customerId, userId, govId]);

  const sortedFiltered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? rows.filter((r) =>
        [r.activityTitle, r.activityDetail, r.actualStartDate, r.actualEndDate, r.plannedStartDate, r.plannedEndDate]
          .join(" ")
          .toLowerCase()
          .includes(q)
      )
      : rows;

    const arr = [...filtered].sort((a, b) => {
      const va = a[sortKey];
      const vb = b[sortKey];
      const cmp = String(va).localeCompare(String(vb));
      return sortDir === "asc" ? cmp : -cmp;
    });

    return arr.slice(0, rowsPerPage);
  }, [rows, sortKey, sortDir, rowsPerPage, query]);

  const toggleSort = (k: SortKey) => {
    if (k === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(k);
      setSortDir("asc");
    }
  };

  const openModal = (assignmentId: string) => {
    setSelectedAssignmentId(assignmentId);
    setIsModalOpen(true);
  };

  // ✅ Close modal and refresh reviews
  const closeModal = async () => {
    setIsModalOpen(false);
    setSelectedAssignmentId(null);
    await refreshReviews();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6"> My Reviews</h1>

      <div className="flex items-center justify-between mb-4">
        <div />
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            placeholder="Search..."
            className="pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md w-72 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {loading && <div className="bg-white border border-gray-200 rounded-lg p-6 text-sm text-gray-600">Loading…</div>}
      {!loading && error && <div className="bg-white border border-red-200 rounded-lg p-4 text-sm text-red-700">{error}</div>}
      {!loading && !error && rows.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 text-sm text-gray-600">No data.</div>
      )}

      {!loading && !error && rows.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <Th label="ACTIVITY TITLE" active={sortKey === "activityTitle"} dir={sortDir} onClick={() => toggleSort("activityTitle")} />
                <Th label="ACTIVITY DETAILS" active={sortKey === "activityDetail"} dir={sortDir} onClick={() => toggleSort("activityDetail")} />
                <Th label="ACTUAL START DATE" active={sortKey === "actualStartDate"} dir={sortDir} onClick={() => toggleSort("actualStartDate")} />
                <Th label="ACTUAL END DATE" active={sortKey === "actualEndDate"} dir={sortDir} onClick={() => toggleSort("actualEndDate")} />
                <Th label="PLANNED START DATE" active={sortKey === "plannedStartDate"} dir={sortDir} onClick={() => toggleSort("plannedStartDate")} />
                <Th label="PLANNED END DATE" active={sortKey === "plannedEndDate"} dir={sortDir} onClick={() => toggleSort("plannedEndDate")} />
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">View</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedFiltered.map((r, i) => (
                <tr key={`${r.assignmentId}-${i}`} className="hover:bg-gray-50/60">
                  <td className="px-6 py-4 text-sm text-gray-900">{r.activityTitle || "—"}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{r.activityDetail || "—"}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{r.actualStartDate || "—"}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{r.actualEndDate || "—"}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{r.plannedStartDate || "—"}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{r.plannedEndDate || "—"}</td>
                  <td className="px-6 py-4 text-sm text-center">
                    <button
                      className="inline-flex items-center justify-center px-4 py-1.5 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
                      onClick={() => openModal(r.assignmentId)}
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex items-center justify-between px-6 py-3 bg-white">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Items per page:</span>
              <select
                className="border border-gray-300 rounded-md text-sm px-2 py-1 bg-white"
                value={rowsPerPage}
                onChange={(e) => setRowsPerPage(Number(e.target.value))}
              >
                {[5, 10, 20, 50].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 text-sm rounded-md border border-gray-300 text-gray-700" disabled>
                Previous
              </button>
              <button className="px-3 py-1.5 text-sm rounded-md bg-blue-600 text-white">1</button>
              <button className="px-3 py-1.5 text-sm rounded-md border border-gray-300 text-gray-700" disabled>
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && selectedAssignmentId && (
        <PerformReview
          assignmentId={selectedAssignmentId}
          onSubmitSuccess={refreshReviews}
          customerId={customerId}
          govId={govId}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

function Th({
  label,
  active,
  dir,
  onClick,
}: {
  label: string;
  active?: boolean;
  dir?: SortDir;
  onClick?: () => void;
}) {
  return (
    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider select-none">
      <button type="button" onClick={onClick} className="inline-flex items-center gap-1 hover:text-gray-700">
        {label}
        <span className="inline-flex flex-col">
          <ChevronUp className={`w-3 h-3 -mb-1 ${active && dir === "asc" ? "text-gray-800" : "text-gray-300"}`} />
          <ChevronDown className={`w-3 h-3 ${active && dir === "desc" ? "text-gray-800" : "text-gray-300"}`} />
        </span>
      </button>
    </th>
  );
}