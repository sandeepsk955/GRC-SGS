//   const raw = fromSession("customerId");
//   if (raw) return Number(raw);
//   try {
//     const u = JSON.parse(fromSession("userDetails") || "{}");
//     if (u?.customerId) return Number(u.customerId);
//   } catch {}
//   return 4; // safe fallback
// }

// function resolveUserId(): number {
//   const raw = fromSession("userId");
//   if (raw) return Number(raw);
//   try {
//     const u = JSON.parse(fromSession("userDetails") || "{}");
//     if (u?.userId) return Number(u.userId);
//   } catch {}
//   return 2;
// }

// function resolveGovId(): number {
//   const raw = fromSession("govId");
//   if (raw) return Number(raw);
//   try {
//     const r = JSON.parse(fromSession("roleDetails") || "{}");
//     if (r?.govid) return Number(r.govid);
//   } catch {}
//   return 1;
// }

// function resolveIsClientAdmin(): boolean {
//   // 1) explicit flag
//   const raw = fromSession("isClientAdmin");
//   if (raw && /^(true|1)$/i.test(raw)) return true;

//   // 2) userDetails booleans
//   try {
//     const u = JSON.parse(fromSession("userDetails") || "{}");
//     if (u?.isClientAdmin === true || u?.isSystemAdmin === true) return true;
//   } catch {}

//   // 3) roleDetails.roletype === 1 (Client Admin)
//   try {
//     const r = JSON.parse(fromSession("roleDetails") || "{}");
//     if (Number(r?.roletype) === 1) return true;
//   } catch {}

//   return false;
// }

// export default function ViewEditAssignments() {
//   // resolve once
//   const customerId = resolveCustomerId();
//   const userId = resolveUserId();
//   const govId = resolveGovId();
//   const isClientAdmin = resolveIsClientAdmin();

//   const [rows, setRows] = useState<AssignmentCard[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const [modalOpen, setModalOpen] = useState(false);
//   const [modalInit, setModalInit] = useState<any>(null);

//   const load = async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const json = isClientAdmin
//         ? await getAssignmentsForAdmin(customerId)
//         : await getAssignments(customerId, userId, 0);
//       setRows(flattenAssignments(json?.data ?? []));
//     } catch (e: any) {
//       setError(e?.message || "Failed to load assignments.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     load();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [customerId, userId, isClientAdmin]);

//   const openEdit = (a: AssignmentCard) => {
//     setModalInit({
//       id: a.id,
//       compliancePeriodId: a.compliancePeriodId,
//       activityMasterId: a.activityMasterId,
//       doerCliUserId: a.doerId,
//       approverCliUserId: a.approverId,
//       startDate: a.startDate,
//       endDate: a.endDate,
//     });
//     setModalOpen(true);
//   };



//   return (
//     <>
//       {modalOpen && (
//         <AssignmentFormModal
//           open={modalOpen}
//           onClose={() => setModalOpen(false)}
//           customerId={customerId}
//           govId={govId}
//           initial={modalInit}
//           onSaved={load}
//         />
//       )}

//       <div className="p-6">
//         <h1 className="text-2xl font-bold text-gray-900 mb-4">View/Edit Assignments</h1>

//         <div className="flex items-center gap-8 border-b mb-6">
//           {}
        
//         </div>

//         {}

//         {loading && (
//           <div className="bg-white border border-gray-200 rounded-lg p-6 text-sm text-gray-600">
//             Loading assignments…
//           </div>
//         )}
//         {!loading && error && (
//           <div className="bg-white border border-red-200 rounded-lg p-4 text-sm text-red-700">
//             {error}
//           </div>
//         )}

//         {!loading && !error && rows.length > 0 && (
//           <div className="space-y-4">
//             {rows.map((a) => {
//               const start = a.startDate ? new Date(a.startDate) : null;
//               const end = a.endDate ? new Date(a.endDate) : null;
//               const today = new Date();
//               let progress = 0;
//               if (start && end && end > start) {
//                 progress = Math.min(100, Math.max(0, ((today.getTime() - start.getTime()) / (end.getTime() - start.getTime())) * 100));
//               }
//               return (
//                 <div key={a.id} className="bg-white border border-gray-200 rounded-xl p-5">
//                   <div className="flex items-start justify-between">
//                     <div>
//                       <h3 className="text-lg font-semibold text-gray-900">{a.activityName || a.standardName}</h3>
//                       <p className="text-sm text-gray-600">Comprehensive compliance review for all active standards</p>
//                     </div>
//                     <span className="px-2 py-1 rounded-full text-xs bg-blue-50 text-blue-700 border border-blue-200">
//                       active
//                     </span>
//                   </div>

//                   {}

//                   <div className="mt-4 grid grid-cols-5 gap-6 text-sm">
//                     <div>
//                       <div className="text-gray-500">Assigned To:</div>
//                       <div className="font-medium text-gray-800">{a.doer || "—"}</div>
//                     </div>
//                     <div>
//                       <div className="text-gray-500">Created By:</div>
//                       <div className="font-medium text-gray-800">{a.approver || "—"}</div>
//                     </div>
//                     <div>
//                       <div className="text-gray-500">Created:</div>
//                       <div className="font-medium text-gray-800">{a.startDate ? new Date(a.startDate).toISOString().slice(0, 10) : "—"}</div>
//                     </div>
//                     <div>
//                       <div className="text-gray-500">Due Date:</div>
//                       <div className="font-medium text-gray-800">{a.endDate ? new Date(a.endDate).toISOString().slice(0, 10) : "—"}</div>
//                     </div>
//                     <div className="flex items-center justify-end gap-3">
//                       <button className="px-3 py-2 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700" onClick={() => openEdit(a)}>
//                         Edit Assignment
//                       </button>
                    
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         )}

//         {!loading && !error && rows.length === 0 && (
//           <div className="bg-white border border-gray-200 rounded-lg p-6 text-sm text-gray-600">
//             No assignments found.
//           </div>
//         )}
//       </div>
//     </>
//   );
// }




// src/components/assignments/ViewEditAssignments.tsx
import { useEffect, useMemo, useState } from "react";
import {
  AssignmentCard,
  flattenAssignments,
  getAssignments,
  getAssignmentsForAdmin,
} from "../../services/Assignments";
import AssignmentFormModal from "./AssignmentsForm";
import { LayoutGrid, List as ListIcon, Search as SearchIcon, X, Pencil, ChevronLeft, ChevronRight } from "lucide-react";

const fromSession = (k: string) =>
  (typeof window === "undefined" ? "" : sessionStorage.getItem(k) || "");

/** NEW: smart truncation helper — prefers sentence boundary, falls back to char limit */
function truncateSmart(
  text: string | undefined,
  opts: { sentences?: number; chars?: number } = {}
): string {
  const t = (text || "").trim();
  if (!t) return "—";
  const sentences = opts.sentences ?? 1;
  const chars = opts.chars ?? 110;

  // Split on sentence enders (., !, ?) followed by space/newline
  const parts = t.split(/(?<=[.!?])\s+/);
  if (parts.length > sentences) {
    return parts.slice(0, sentences).join(" ") + "…";
  }
  // Fallback to char limit (cut on last space if possible)
  if (t.length > chars) {
    const cut = t.slice(0, chars);
    const safe = cut.slice(0, cut.lastIndexOf(" ")).trim();
    return (safe || cut).trimEnd() + "…";
  }
  return t;
}

function resolveCustomerId(): number {
  try {
    const raw = sessionStorage.getItem("customerId");
    return raw ? Number(raw) : 4;
  } catch {
    return 4;
  }
}
 
function resolveUserId(): number {
  try {
    const raw = sessionStorage.getItem("userid") || sessionStorage.getItem("userId");
    if (raw) return Number(raw);
    
    const u = JSON.parse(sessionStorage.getItem("userDetails") || "{}");
    return Number(u.userId || u.userid || 2);
  } catch {
    return 2;
  }
}
 
function resolveGovId(): number {
  const stored = sessionStorage.getItem("selectedDomain");
  if (stored) {
    try {
      const d = JSON.parse(stored);
      if (d.id) return Number(d.id);
    } catch {}
  }
  return 0;
}
 
function resolveIsClientAdmin(): boolean {
  // 1) Explicit flag
  const raw = fromSession("isClientAdmin");
  if (raw && /^(true|1)$/i.test(raw)) return true;

  // 2) Role Details (roletype 1 = Client Admin)
  try {
    const r = JSON.parse(fromSession("roleDetails") || "{}");
    if (Number(r?.roletype) === 1 || Number(r?.roleId) === 1) return true;
  } catch {}

  // 3) User Details booleans
  try {
    const u = JSON.parse(fromSession("userDetails") || "{}");
    if (u?.isClientAdmin === true || u?.isSystemAdmin === true) return true;
  } catch {}

  return false;
}

type ViewMode = "cards" | "list";

export default function ViewEditAssignments() {
  // resolve once (memoized to prevent re-render loops)
  const [customerId] = useState<number>(() => resolveCustomerId());
  const [userId] = useState<number>(() => resolveUserId());
  const [govId] = useState<number>(() => resolveGovId());
  const [isClientAdmin] = useState<boolean>(() => resolveIsClientAdmin());

  const [rows, setRows] = useState<AssignmentCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalInit, setModalInit] = useState<any>(null);

  // View toggle + search (persisted)
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const v = sessionStorage.getItem("assignments:viewMode");
    return v === "list" || v === "cards" ? v : "cards";
  });
  const [searchQuery, setSearchQuery] = useState<string>(() => {
    return sessionStorage.getItem("assignments:searchQuery") ?? "";
  });
  const setMode = (m: ViewMode) => {
    setViewMode(m);
    sessionStorage.setItem("assignments:viewMode", m);
  };
  const onSearch = (val: string) => {
    setSearchQuery(val);
    sessionStorage.setItem("assignments:searchQuery", val);
    setPage(1); // reset page on search
  };

  // NEW: pagination (persisted)
  const [page, setPage] = useState<number>(() => {
    const p = Number(sessionStorage.getItem("assignments:page") ?? 1);
    return Number.isFinite(p) && p > 0 ? p : 1;
  });
  const [pageSize, setPageSize] = useState<number>(() => {
    const ps = Number(sessionStorage.getItem("assignments:pageSize") ?? 10);
    const allowed = [5, 10, 20, 50];
    return allowed.includes(ps) ? ps : 10;
  });
  const persistPage = (p: number) => sessionStorage.setItem("assignments:page", String(p));
  const persistPageSize = (ps: number) => sessionStorage.setItem("assignments:pageSize", String(ps));

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("[Assignments] Loading with IDs:", { customerId, userId, isClientAdmin });
      
      const json = isClientAdmin
        ? await getAssignmentsForAdmin(customerId)
        : await getAssignments(customerId, userId, 2); // Default to EnumId 2 (Current) instead of 0 (Empty)

      console.log("[Assignments] API Response:", json);
      
      // Handle both { data: [...] } and directly [...]
      const rawData = Array.isArray(json) ? json : (json?.data ?? []);
      setRows(flattenAssignments(rawData));
    } catch (e: any) {
      console.error("[Assignments] Load Error:", e);
      setError(e?.message || "Failed to load assignments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId, userId, isClientAdmin]);

  const openEdit = (a: AssignmentCard) => {
    setModalInit({
      id: a.id,
      compliancePeriodId: a.compliancePeriodId,
      activityMasterId: a.activityMasterId,
      doerCliUserId: a.doerId,
      approverCliUserId: a.approverId,
      startDate: a.startDate,
      endDate: a.endDate,
    });
    setModalOpen(true);
  };

  // Filter by activity name ONLY (case-insensitive)
  const filtered = useMemo(() => {
    const q = (searchQuery || "").trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => (r.activityName || "").toLowerCase().includes(q));
  }, [rows, searchQuery]);

  // Derived pagination slices
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  // keep page in range if filter/pageSize changes
  useEffect(() => {
    if (safePage !== page) {
      setPage(safePage);
      persistPage(safePage);
    }
  }, [safePage]);
  const start = (safePage - 1) * pageSize;
  const end = Math.min(start + pageSize, filtered.length);
  const pageItems = filtered.slice(start, end);

  const PageBar = () => (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between px-2">
      <div className="text-sm text-gray-600">
        Showing <span className="font-medium">{filtered.length === 0 ? 0 : start + 1}-{end}</span> of {filtered.length}
      </div>
      <div className="flex items-center gap-3">
        <label className="text-sm text-gray-600">Rows per page</label>
        <select
          value={pageSize}
          onChange={(e) => {
            const ps = Number(e.target.value) || 10;
            setPageSize(ps);
            persistPageSize(ps);
            setPage(1);
            persistPage(1);
          }}
          className="border rounded-md px-2 py-1 text-sm"
        >
          {[5, 10, 20, 50].map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        <div className="inline-flex border rounded-md overflow-hidden">
          <button
            onClick={() => { const p = Math.max(1, safePage - 1); setPage(p); persistPage(p); }}
            className="px-2 py-1 disabled:opacity-50"
            disabled={safePage === 1}
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="px-3 py-1 text-sm min-w-[4rem] text-center select-none">
            {safePage} / {totalPages}
          </div>
          <button
            onClick={() => { const p = Math.min(totalPages, safePage + 1); setPage(p); persistPage(p); }}
            className="px-2 py-1 disabled:opacity-50"
            disabled={safePage === totalPages}
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {modalOpen && (
        <AssignmentFormModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          customerId={customerId}
          govId={govId}
          initial={modalInit}
          onSaved={load}
        />
      )}

      <div className="p-6">
        {/* Header: title + search + toggle */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">View/Edit Assignments</h1>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-1 md:w-80">
              <SearchIcon className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
                placeholder="Search by activity name…"
                className="w-full pl-9 pr-9 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearch("")}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-100"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              )}
            </div>

            {/* View toggle */}
            <div className="inline-flex rounded-lg overflow-hidden border border-gray-300">
              <button
                onClick={() => setMode("cards")}
                className={`px-3 py-2 flex items-center gap-2 text-sm ${viewMode === "cards" ? "bg-blue-600 text-white" : "bg-white hover:bg-gray-50"}`}
                title="Cards"
              >
                <LayoutGrid className="w-4 h-4" />
                Cards
              </button>
              <button
                onClick={() => setMode("list")}
                className={`px-3 py-2 flex items-center gap-2 text-sm border-l border-gray-300 ${viewMode === "list" ? "bg-blue-600 text-white" : "bg-white hover:bg-gray-50"}`}
                title="List"
              >
                <ListIcon className="w-4 h-4" />
                List
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-8 border-b mb-6" />

        {/* States */}
        {loading && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 text-sm text-gray-600">
            Loading assignments…
          </div>
        )}
        {!loading && error && (
          <div className="bg-white border border-red-200 rounded-lg p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filtered.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 text-sm text-gray-600">
            No assignments found{searchQuery ? ` for “${searchQuery}”.` : "."}
          </div>
        )}

        {/* Content */}
        {!loading && !error && filtered.length > 0 && (
          viewMode === "cards" ? (
            /* -------- CARDS VIEW -------- */
            <>
              <div className="space-y-4">
                {pageItems.map((a) => (
                  <div key={a.id} className="bg-white border border-gray-200 rounded-xl p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        {/* TRUNCATED activity name */}
                        <h3 className="text-lg font-semibold text-gray-900">
                          {truncateSmart(a.activityName || a.standardName, { sentences: 1, chars: 110 })}
                        </h3>
                        {/* Optional small summary line */}
                        <p className="text-sm text-gray-600">
                          Comprehensive compliance review for all active standards
                        </p>
                      </div>
                      <span className="px-2 py-1 rounded-full text-xs bg-blue-50 text-blue-700 border border-blue-200">
                        active
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-5 gap-6 text-sm">
                      <div>
                        <div className="text-gray-500">Assigned To:</div>
                        <div className="font-medium text-gray-800">{a.doer || "—"}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Created By:</div>
                        <div className="font-medium text-gray-800">{a.approver || "—"}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Created:</div>
                        <div className="font-medium text-gray-800">
                          {a.startDate ? new Date(a.startDate).toISOString().slice(0, 10) : "—"}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500">Due Date:</div>
                        <div className="font-medium text-gray-800">
                          {a.endDate ? new Date(a.endDate).toISOString().slice(0, 10) : "—"}
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-3">
                        {isClientAdmin && (
                          <button
                            className="px-3 py-2 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700"
                            onClick={() => openEdit(a)}
                          >
                            Edit Assignment
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-3 mt-4">
                <PageBar />
              </div>
            </>
          ) : (
            /* -------- LIST (TABLE) VIEW -------- */
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr className="[&>th]:px-4 [&>th]:py-3 [&>th]:text-left [&>th]:font-semibold">
                      <th className="w-[28%]">Activity</th>
                      <th className="w-[16%]">Assigned To</th>
                      <th className="w-[16%]">Created By</th>
                      <th className="w-[14%]">Created</th>
                      <th className="w-[14%]">Due Date</th>
                      <th className="w-[12%] text-right pr-6">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {pageItems.map((a) => (
                      <tr key={a.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            {/* TRUNCATED activity name */}
                            <span className="font-medium text-gray-900">
                              {truncateSmart(a.activityName || a.standardName, { sentences: 1, chars: 110 })}
                            </span>
                            <span className="text-gray-500">
                              Comprehensive compliance review for all active standards
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-900">{a.doer || "—"}</td>
                        <td className="px-4 py-3 text-gray-900">{a.approver || "—"}</td>
                        <td className="px-4 py-3">
                          {a.startDate ? new Date(a.startDate).toISOString().slice(0, 10) : "—"}
                        </td>
                        <td className="px-4 py-3">
                          {a.endDate ? new Date(a.endDate).toISOString().slice(0, 10) : "—"}
                        </td>
                        <td className="px-4 py-3 pr-6 text-right">
                          {isClientAdmin && (
                            <button
                              onClick={() => openEdit(a)}
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                            >
                              <Pencil className="w-4 h-4" />
                              Edit
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="border-t p-3">
                <PageBar />
              </div>
            </div>
          )
        )}
      </div>
    </>
  );
}

