// import React from 'react';
// import { Bell, User } from 'lucide-react';
// import { useAuth } from '../../context/AuthContext';
// import { useStandards } from '../../context/StandardsContext';
// import { useLocation } from 'react-router-dom';


// const ROUTE_TITLES: Record<string, string> = {
//   "/": "Dashboard",
//   "/activities/manage": "View / Edit Activities",
//   "/activities/assignments": "View / Edit Assignment",
//   "/notifications": "My Notifications",
//   "/reviews": "My Reviews",
//   // add other routes you have…
// };

// export const Header: React.FC = () => {
//   const { userEmail, selectedDomain, selectedRole } = useAuth();
//   const { selectedStandard } = useStandards();
//   const { pathname } = useLocation();

//   const selectedLinkName = ROUTE_TITLES[pathname] ?? "Dashboard";

//   const heading =
//     selectedDomain?.name
//       ? `${selectedDomain.name} Dashboard`
//       : selectedStandard?.name
//         ? `Viewing ${selectedStandard.name}`
//         : selectedLinkName; // fallback to dashboard / current link name

//   return (
//     <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
//       <div className="flex items-center gap-6">
//         <h1 className="text-xl font-semibold text-gray-800">
//           {/* {selectedDomain?.name} Dashboard */}
//           <p className="text-gray-600 font-bold">{heading}</p>


//         </h1>
//         {/* <p className="text-gray-600 font-bold">
//           {selectedStandard
//             ? `Viewing  ${selectedStandard.name}`
//             : ''}
//         </p> */}
//       </div>

//       <div className="flex items-center gap-4">
//         {/* Search */}
//         {/* <div className="relative">
//           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//           <input
//             type="text"
//             placeholder="Search..."
//             className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//           />
//         </div> */}

//         {/* Notifications */}
//         <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
//           <Bell className="w-5 h-5" />
//           <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
//         </button>

//         {/* User Menu */}
//         <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
//           <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
//             <User className="w-4 h-4 text-white" />
//           </div>
//           <div className="text-right">
//             <p className="text-sm font-medium text-gray-800">Admin User</p>
//             <p className="text-xs text-gray-600">
//               {selectedRole?.name} • {userEmail}
//             </p>
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// };




import React, { useEffect, useState, useRef } from 'react';
import { Bell, User, Clock, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStandards } from '../../context/StandardsContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { notificationService, Notification } from '../../services/notificationService';

const ROUTE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/activities/manage": "View / Edit Activities",
  "/activities/assignments": "View / Edit Assignment",
  "/notifications": "My Notifications",
  "/reviews": "My Reviews",
};

export const Header: React.FC = () => {
  const { userEmail, selectedDomain, selectedRole } = useAuth();
  const { selectedStandard } = useStandards();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchStats = async () => {
    try {
      const cS = sessionStorage.getItem('customerId');
      const uS = sessionStorage.getItem('userid') || sessionStorage.getItem('userId');
      const gS = selectedDomain?.id;
      if (!cS || !uS || !gS) return;

      const [notes, reviews] = await Promise.all([
        notificationService.getNotifications(Number(cS), Number(uS), Number(gS)).catch(() => []),
        notificationService.getReviews(Number(cS), Number(uS), Number(gS)).catch(() => [])
      ]);
      
      // Combine and sort by date. 
      // Reviews are also counted as 'notifications' for the badge count.
      const transformedReviews = reviews.map(r => ({
        notificationId: -(Number(r.assignmentId) || Math.random()), // negative ID to avoid collision
        activity: r.activityTitle,
        notificationType: 'Pending Review',
        assignmentId: Number(r.assignmentId),
        assignmentStatus: 'Review',
        notificationDate: r.plannedEndDate || new Date().toISOString(),
        plannedStartdate: r.plannedStartdate || '',
        helpRefDocs: '',
        plannedEndDate: r.plannedEndDate || null,
        duration: r.duration || null
      }));

      const combined = [...notes, ...transformedReviews].sort((a, b) => 
        new Date(b.notificationDate).getTime() - new Date(a.notificationDate).getTime()
      );
      setNotifications(combined);
    } catch (e) {
      console.error('[Header] Failed to fetch notifications', e);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, [selectedDomain?.id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedLinkName = ROUTE_TITLES[pathname] ?? "Dashboard";

  const heading =
    selectedDomain?.name
      ? `${selectedDomain.name} Dashboard`
      : selectedStandard?.name
        ? `Viewing ${selectedStandard.name}`
        : selectedLinkName;

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
      <div className="flex items-center gap-6">
        <h1 className="text-xl font-semibold text-gray-800">
          <p className="text-gray-600 font-bold">{heading}</p>
        </h1>
      </div>

      <div className="flex items-center gap-4 relative">
        <button 
          onClick={() => setShowDropdown(!showDropdown)}
          className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Bell className="w-5 h-5" />
          {notifications.length > 0 && (
            <span className="absolute top-1 right-1 px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] text-center">
              {notifications.length > 9 ? '9+' : notifications.length}
            </span>
          )}
        </button>

        {showDropdown && (
          <div 
            ref={dropdownRef}
            className="absolute right-0 top-12 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Notifications</h3>
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                {notifications.length} New
              </span>
            </div>
            
            <div className="max-h-[320px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Info className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">All caught up!</p>
                </div>
              ) : (
                notifications.slice(0, 5).map((n) => (
                  <div 
                    key={n.notificationId}
                    className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => { setShowDropdown(false); navigate('/activities/notifications'); }}
                  >
                    <div className="flex gap-3">
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                        <Clock className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{n.activity}</p>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{n.notificationType}</p>
                        <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {new Date(n.notificationDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button 
              onClick={() => { setShowDropdown(false); navigate('/activities/notifications'); }}
              className="w-full p-3 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors border-t border-gray-100"
            >
              View All Notifications
            </button>
          </div>
        )}

        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="text-right">
<p className="text-sm font-medium text-gray-800">
  {userEmail ? userEmail.split('@')[0] : 'User'}
</p>            <p className="text-xs text-gray-600">
              {selectedRole?.name} • {userEmail}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
