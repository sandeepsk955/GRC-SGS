// import React, { useEffect, useMemo, useState } from "react";
// import { Bell, CheckSquare, ChevronDown, ChevronUp, Search } from "lucide-react";
// import { Link, useNavigate } from "react-router-dom";
// import PerformActivity from "./PerformActivity"; // Import the modal component

// type NotificationRow = {
//   notificationId: number;
//   notificationDate: string;
//   assignmentId: string;
//   assignmentStatus: string;
//   notificationType: string;
// };

// type SortKey = keyof NotificationRow;
// type SortDir = "asc" | "desc";

// type ApiNotification = {
//   notificationId: number;
//   notificationType: string;
//   assignmentId: number | string;
//   assignmentStatus: string;
//   notificationDate: string;
// };

// type ApiResponse = {
//   data?: ApiNotification[];
//   message?: string;
// };

// const formatMDY = (isoLike: string | undefined) => {
//   if (!isoLike) return "";
//   const d = new Date(isoLike);
//   if (Number.isNaN(d.getTime())) return isoLike;
//   return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
// };

// const fromSession = (key: string): string => {
//   if (typeof window === "undefined") return "";
//   return window.sessionStorage.getItem(key) || "";
// };

// export const MyNotifications: React.FC = () => {
//   const navigate = useNavigate();

//   const [customerId, setCustomerId] = useState<string>(fromSession("customerId") || "72be74a7");
//   const [userId, setUserId] = useState<string>(fromSession("userId") || "2");
//   const [govId, setGovId] = useState<string>(fromSession("govId") || "b7fb6b4d");

//   const [rows, setRows] = useState<NotificationRow[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedAssignment, setSelectedAssignment] = useState<NotificationRow | null>(null);

//   const [sortKey, setSortKey] = useState<SortKey>("notificationId");
//   const [sortDir, setSortDir] = useState<SortDir>("asc");
//   const [query, setQuery] = useState("");
//   const [rowsPerPage, setRowsPerPage] = useState(10);

//   useEffect(() => {
//     const handleStorageChange = () => {
//       setCustomerId(fromSession("customerId") || "72be74a7");
//       setUserId(fromSession("userId") || "2");
//       setGovId(fromSession("govId") || "b7fb6b4d");
//     };

//     handleStorageChange();
//     window.addEventListener("storage", handleStorageChange);
//     return () => window.removeEventListener("storage", handleStorageChange);
//   }, []);

//   useEffect(() => {
//     if (!customerId || !userId || !govId) {
//       setError(
//         "Missing required IDs in sessionStorage. Please set customerId, userId and govId in sessionStorage."
//       );
//       return;
//     }

//     const abort = new AbortController();
//     setLoading(true);
//     setError(null);

//     const params = new URLSearchParams({
//       CustomerId: customerId,
//       UserId: userId,
//       GovId: govId,
//     }).toString();

//     const url = `/api/MyNotification?${params}`;

//     (async () => {
//       try {
//         const res = await fetch(url, {
//           method: "GET",
//           headers: { accept: "application/json, text/plain, */*" },
//           signal: abort.signal,
//         });
//         if (!res.ok) {
//           const text = await res.text();
//           throw new Error(`HTTP ${res.status} - ${text || res.statusText}`);
//         }
//         const json = (await res.json()) as ApiResponse;

//         const list = (json?.data ?? []).map<NotificationRow>((n) => ({
//           notificationId: n.notificationId,
//           notificationDate: formatMDY(n.notificationDate),
//           assignmentId: String(n.assignmentId ?? ""),
//           assignmentStatus: n.assignmentStatus ?? "",
//           notificationType: n.notificationType ?? "",
//         }));

//         setRows(list);
//       } catch (e: any) {
//         if (e?.name !== "AbortError") {
//           setError(e?.message || "Failed to load notifications.");
//         }
//       } finally {
//         setLoading(false);
//       }
//     })();

//     return () => abort.abort();
//   }, [customerId, userId, govId]);

//   const sortedFiltered = useMemo(() => {
//     const filtered = rows.filter((r) => {
//       if (!query.trim()) return true;
//       const q = query.toLowerCase();
//       return (
//         r.notificationId.toString().includes(q) ||
//         r.notificationDate.toLowerCase().includes(q) ||
//         r.assignmentId.toLowerCase().includes(q) ||
//         r.assignmentStatus.toLowerCase().includes(q) ||
//         r.notificationType.toLowerCase().includes(q)
//       );
//     });

//     const arr = [...filtered].sort((a, b) => {
//       const va = a[sortKey];
//       const vb = b[sortKey];
//       if (va === vb) return 0;
//       const res =
//         typeof va === "number" && typeof vb === "number"
//           ? va - vb
//           : String(va).localeCompare(String(vb));
//       return sortDir === "asc" ? res : -res;
//     });

//     return arr.slice(0, rowsPerPage);
//   }, [rows, sortKey, sortDir, query, rowsPerPage]);

//   const toggleSort = (k: SortKey) => {
//     if (k === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
//     else {
//       setSortKey(k);
//       setSortDir("asc");
//     }
//   };

//   const handlePerform = (row: NotificationRow) => {
//     setSelectedAssignment(row);
//     setIsModalOpen(true);
//   };

//   const closeModal = () => {
//     setIsModalOpen(false);
//     setSelectedAssignment(null);
//   };

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold text-gray-900 mb-6">
//         <span className="text-gray-600">My Notifications</span>
//       </h1>

//       <div className="flex items-center justify-between mb-4">
//         <div className="flex items-center gap-6">
//           {/* <button
//             type="button"
//             className="inline-flex items-center gap-2 text-blue-700 font-medium border-b-2 border-blue-700 pb-2"
//             aria-current="page"
//           >
//             <Bell className="w-4 h-4" />
//             My Notifications
//           </button> */}

//           {/* <Link
//             to="/activities/reviews"
//             className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 pb-2"
//           >
//             <CheckSquare className="w-4 h-4" />
//             My Reviews
//           </Link> */}
//         </div>

//         <div className="flex items-center gap-3">
//           {/* <select
//             className="border border-gray-300 rounded-md text-sm px-3 py-2 bg-white"
//             defaultValue="ALL"
//             aria-label="Filter"
//           >
//             <option value="ALL">ALL</option>
//             <option value="NOTIFICATIONS">Notifications</option>
//             <option value="FIRST_ASSIGNMENT">First-Assignment</option>
//           </select> */}

//           <div className="relative">
//             <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
//             <input
//               type="text"
//               placeholder="Search..."
//               className="pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               value={query}
//               onChange={(e) => setQuery(e.target.value)}
//             />
//           </div>
//         </div>
//       </div>

//       {loading && (
//         <div className="bg-white border border-gray-200 rounded-lg p-6 text-sm text-gray-600">
//           Loading notifications…
//         </div>
//       )}
//       {!loading && error && (
//         <div className="bg-white border border-red-200 rounded-lg p-4 text-sm text-red-700">
//           {error}
//         </div>
//       )}
//       {!loading && !error && rows.length === 0 && (
//         <div className="bg-white border border-gray-200 rounded-lg p-6 text-sm text-gray-600">
//           No notifications found.
//         </div>
//       )}

//       {!loading && !error && rows.length > 0 && (
//         <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <Th label="NOTIFICATION ID" active={sortKey === "notificationId"} dir={sortDir} onClick={() => toggleSort("notificationId")} />
//                 <Th label="NOTIFICATION DATE" active={sortKey === "notificationDate"} dir={sortDir} onClick={() => toggleSort("notificationDate")} />
//                 <Th label="ASSIGNMENT ID" active={sortKey === "assignmentId"} dir={sortDir} onClick={() => toggleSort("assignmentId")} />
//                 <Th label="ASSIGNMENT STATUS" active={sortKey === "assignmentStatus"} dir={sortDir} onClick={() => toggleSort("assignmentStatus")} />
//                 <Th label="NOTIFICATION TYPE" active={sortKey === "notificationType"} dir={sortDir} onClick={() => toggleSort("notificationType")} />
//                 <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Action</th>
//               </tr>
//             </thead>

//             <tbody className="bg-white divide-y divide-gray-200">
//               {sortedFiltered.map((row) => (
//                 <tr key={row.notificationId} className="hover:bg-gray-50/60">
//                   <td className="px-6 py-4 text-sm text-gray-900">{row.notificationId}</td>
//                   <td className="px-6 py-4 text-sm text-gray-900">{row.notificationDate}</td>
//                   <td className="px-6 py-4 text-sm text-gray-900">{row.assignmentId}</td>
//                   <td className="px-6 py-4 text-sm text-gray-900">{row.assignmentStatus}</td>
//                   <td className="px-6 py-4 text-sm text-gray-900">{row.notificationType}</td>
//                   <td className="px-6 py-4 text-sm text-right">
//                     <button
//                       onClick={() => handlePerform(row)}
//                       className="inline-flex items-center justify-center px-4 py-1.5 rounded-md bg-green-600 text-white text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
//                     >
//                       Perform
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>

//           <div className="flex items-center justify-between px-6 py-3 bg-white">
//             <div className="flex items-center gap-2 text-sm text-gray-600">
//               <span>Items per page:</span>
//               <select
//                 className="border border-gray-300 rounded-md text-sm px-2 py-1 bg-white"
//                 value={rowsPerPage}
//                 onChange={(e) => setRowsPerPage(Number(e.target.value))}
//               >
//                 {[5, 10, 20, 50].map((n) => (
//                   <option key={n} value={n}>{n}</option>
//                 ))}
//               </select>
//             </div>

//             {/* <div className="flex items-center gap-2">
//               <button className="px-3 py-1.5 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50" disabled>
//                 Previous
//               </button>
//               <button className="px-3 py-1.5 text-sm rounded-md bg-blue-600 text-white">1</button>
//               <button className="px-3 py-1.5 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50" disabled>
//                 Next
//               </button>
//             </div> */}
//           </div>
//         </div>
//       )}

//       {isModalOpen && selectedAssignment && (
//         <PerformActivity
//           assignmentId={selectedAssignment.assignmentId}
//           customerId={customerId}
//           govId={govId}
//           onClose={closeModal}
//         />
//       )}
//     </div>
//   );
// };

// const Th: React.FC<{
//   label: string;
//   active?: boolean;
//   dir?: SortDir;
//   onClick?: () => void;
// }> = ({ label, active, dir, onClick }) => {
//   return (
//     <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider select-none">
//       <button type="button" onClick={onClick} className="inline-flex items-center gap-1 hover:text-gray-700">
//         {label}
//         <span className="inline-flex flex-col">
//           <ChevronUp className={`w-3 h-3 -mb-1 ${active && dir === "asc" ? "text-gray-800" : "text-gray-300"}`} />
//           <ChevronDown className={`w-3 h-3 ${active && dir === "desc" ? "text-gray-800" : "text-gray-300"}`} />
//         </span>
//       </button>
//     </th>
//   );
// };



import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import PerformActivity from "./PerformActivity";
import PerformReview from "./PerformReview"; 
import { notificationService } from "../../services/notificationService";

type NotificationRow = {
  notificationId: number;
  notificationDate: string;
  assignmentId: string;
  assignmentStatus: string;
  notificationType: string;
  isReview?: boolean;
};

type SortKey = keyof NotificationRow;
type SortDir = "asc" | "desc";

const formatMDY = (isoLike: string | undefined) => {
  if (!isoLike) return "";
  const d = new Date(isoLike);
  if (Number.isNaN(d.getTime())) return isoLike;
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
};

const fromSession = (key: string): string => {
  if (typeof window === "undefined") return "";
  return window.sessionStorage.getItem(key) || "";
};

export const MyNotifications: React.FC = () => {

  const getStoredGovId = () => {
    const stored = sessionStorage.getItem("selectedDomain");
    if (stored) {
      try {
        return JSON.parse(stored).id || "b7fb6b4d";
      } catch {
        return "b7fb6b4d";
      }
    }
    return "b7fb6b4d";
  };
 
  const [customerId, setCustomerId] = useState<string>(fromSession("customerId") || "72be74a7");
  const [userId, setUserId] = useState<string>(fromSession("userId") || "2");
  const [govId, setGovId] = useState<string>(getStoredGovId());

  const [rows, setRows] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<NotificationRow | null>(null);

  const [sortKey, setSortKey] = useState<SortKey>("notificationId");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [query, setQuery] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const handleStorageChange = () => {
      setCustomerId(fromSession("customerId") || "72be74a7");
      setUserId(fromSession("userId") || "2");
      setGovId(getStoredGovId());
    };

    handleStorageChange();
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    if (!customerId || !userId || !govId) {
      setError(
        "Missing required IDs in sessionStorage. Please set customerId, userId and govId in sessionStorage."
      );
      return;
    }

    setLoading(true);
    setError(null);

    (async () => {
      try {
        const [notifRes, reviewRes] = await Promise.allSettled([
          notificationService.getNotifications(Number(customerId), Number(userId), Number(govId)),
          notificationService.getReviews(Number(customerId), Number(userId), Number(govId))
        ]);

        const notifs = notifRes.status === "fulfilled" ? (notifRes.value ?? []) : [];
        const reviews = reviewRes.status === "fulfilled" ? (reviewRes.value ?? []) : [];

        const list: NotificationRow[] = [
          ...notifs.map((n) => ({
            notificationId: n.notificationId,
            notificationDate: formatMDY(n.notificationDate),
            assignmentId: String(n.assignmentId ?? ""),
            assignmentStatus: n.assignmentStatus ?? "",
            notificationType: n.notificationType ?? "Assignment",
            isReview: false,
          })),
          ...reviews.map((r) => ({
            notificationId: Number(r.assignmentId), // Reviews don't have a separate notifId in this API, using assignmentId
            notificationDate: formatMDY(r.actualStartDate || r.plannedStartdate || undefined),
            assignmentId: String(r.assignmentId ?? ""),
            assignmentStatus: "Pending Review",
            notificationType: "Review",
            isReview: true,
          }))
        ];

        setRows(list);
      } catch (e: any) {
        setError("No data to display.");
      } finally {
        setLoading(false);
      }
    })();
  }, [customerId, userId, govId]);

  const sortedFiltered = useMemo(() => {
    const filtered = rows.filter((r) => {
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        r.notificationId.toString().includes(q) ||
        r.notificationDate.toLowerCase().includes(q) ||
        r.assignmentId.toLowerCase().includes(q) ||
        r.assignmentStatus.toLowerCase().includes(q) ||
        r.notificationType.toLowerCase().includes(q)
      );
    });

    const arr = [...filtered].sort((a, b) => {
      const va = a[sortKey];
      const vb = b[sortKey];
      if (va === vb) return 0;
      const res =
        typeof va === "number" && typeof vb === "number"
          ? va - vb
          : String(va).localeCompare(String(vb));
      return sortDir === "asc" ? res : -res;
    });

    return arr.slice(0, rowsPerPage);
  }, [rows, sortKey, sortDir, query, rowsPerPage]);

  const toggleSort = (k: SortKey) => {
    if (k === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(k);
      setSortDir("asc");
    }
  };

  const handlePerform = (row: NotificationRow) => {
    setSelectedAssignment(row);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAssignment(null);
  };

  // ✅ Refresh notifications after successful submission
  const refreshNotifications = async () => {
    if (!customerId || !userId || !govId) return;

    try {
      setLoading(true);
      const data = await notificationService.getNotifications(
        Number(customerId),
        Number(userId),
        Number(govId)
      );

      const list = (data ?? []).map<NotificationRow>((n) => ({
        notificationId: n.notificationId,
        notificationDate: formatMDY(n.notificationDate),
        assignmentId: String(n.assignmentId ?? ""),
        assignmentStatus: n.assignmentStatus ?? "",
        notificationType: n.notificationType ?? "",
      }));

      setRows(list);
    } catch (e: any) {
      console.error("Failed to refresh notifications:", e?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        <span className="text-gray-600">My Notifications</span>
      </h1>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-6">
          {/* <button
            type="button"
            className="inline-flex items-center gap-2 text-blue-700 font-medium border-b-2 border-blue-700 pb-2"
            aria-current="page"
          >
            <Bell className="w-4 h-4" />
            My Notifications
          </button>

          <Link
            to="/activities/reviews"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 pb-2"
          >
            <CheckSquare className="w-4 h-4" />
            My Reviews
          </Link> */}
        </div>

        <div className="flex items-center gap-3">
          {/* <select
            className="border border-gray-300 rounded-md text-sm px-3 py-2 bg-white"
            defaultValue="ALL"
            aria-label="Filter"
          >
            <option value="ALL">ALL</option>
            <option value="NOTIFICATIONS">Notifications</option>
            <option value="FIRST_ASSIGNMENT">First-Assignment</option>
          </select> */}

          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 text-sm text-gray-600">
          Loading notifications…
        </div>
      )}
      {!loading && error && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 text-sm text-gray-600">
          {error}
        </div>
      )}
      {!loading && !error && rows.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 text-sm text-gray-600">
          No notifications found.
        </div>
      )}

      {!loading && !error && rows.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <Th label="NOTIFICATION ID" active={sortKey === "notificationId"} dir={sortDir} onClick={() => toggleSort("notificationId")} />
                <Th label="NOTIFICATION DATE" active={sortKey === "notificationDate"} dir={sortDir} onClick={() => toggleSort("notificationDate")} />
                <Th label="ASSIGNMENT ID" active={sortKey === "assignmentId"} dir={sortDir} onClick={() => toggleSort("assignmentId")} />
                <Th label="ASSIGNMENT STATUS" active={sortKey === "assignmentStatus"} dir={sortDir} onClick={() => toggleSort("assignmentStatus")} />
                <Th label="NOTIFICATION TYPE" active={sortKey === "notificationType"} dir={sortDir} onClick={() => toggleSort("notificationType")} />
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {sortedFiltered.map((row) => (
                <tr key={row.notificationId} className="hover:bg-gray-50/60">
                  <td className="px-6 py-4 text-sm text-gray-900">{row.notificationId}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{row.notificationDate}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{row.assignmentId}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{row.assignmentStatus}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{row.notificationType}</td>
                  <td className="px-6 py-4 text-sm text-right">
                    <button
                      onClick={() => handlePerform(row)}
                      className={`inline-flex items-center justify-center px-4 py-1.5 rounded-md text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        row.isReview 
                          ? "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500" 
                          : "bg-green-600 hover:bg-green-700 focus:ring-green-500"
                      }`}
                    >
                      {row.isReview ? "Review Task" : "Perform"}
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
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            {/* <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50" disabled>
                Previous
              </button>
              <button className="px-3 py-1.5 text-sm rounded-md bg-blue-600 text-white">1</button>
              <button className="px-3 py-1.5 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50" disabled>
                Next
              </button>
            </div> */}
          </div>
        </div>
      )}

      {isModalOpen && selectedAssignment && (
        selectedAssignment.isReview ? (
          <PerformReview
            assignmentId={selectedAssignment.assignmentId}
            customerId={customerId}
            govId={govId}
            onClose={closeModal}
            onSubmitSuccess={refreshNotifications}
            notificationId={selectedAssignment.notificationId}
          />
        ) : (
          <PerformActivity
            assignmentId={selectedAssignment.assignmentId}
            customerId={customerId}
            govId={govId}
            onClose={closeModal}
            notificationId={selectedAssignment.notificationId}
            onSubmitSuccess={refreshNotifications}
          />
        )
      )}
    </div>
  );
};

const Th: React.FC<{
  label: string;
  active?: boolean;
  dir?: SortDir;
  onClick?: () => void;
}> = ({ label, active, dir, onClick }) => {
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
};