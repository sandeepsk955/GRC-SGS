import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  CheckCircle,
  Clock,
  Users,
  FileText,
  Shield
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
 
import { useState, useEffect } from 'react';
import { dashboardService, DashboardAssignment } from '../../services/dashboardService';
import { getUsers } from '../../services/userservice';
 
export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { selectedDomain, selectedRole } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
 
  // State for metrics
  const [activePeriods, setActivePeriods] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
 
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const fromSession = (k: string) => sessionStorage.getItem(k) || "";
        const cS = fromSession('customerId');
        const uS = fromSession('userid') || fromSession('userId');
        
        if (!cS) return;
        const customerId = Number(cS);
        
        let userId = Number(uS);
        // Try userDetails fallback for userId
        if (!userId) {
          try {
            const u = JSON.parse(fromSession("userDetails") || "{}");
            userId = Number(u?.userId || u?.userid || 0);
          } catch {}
        }

        const resolveIsClientAdmin = (): boolean => {
          const raw = fromSession("isClientAdmin");
          if (raw && /^(true|1)$/i.test(raw)) return true;
          try {
            const r = JSON.parse(fromSession("roleDetails") || "{}");
            if (Number(r?.roletype) === 1 || Number(r?.roleId) === 1) return true;
          } catch {}
          try {
            const u = JSON.parse(fromSession("userDetails") || "{}");
            if (u?.isClientAdmin === true || u?.isSystemAdmin === true) return true;
          } catch {}
          const roleName = (selectedRole?.name || '').toLowerCase();
          return roleName.includes('admin') || roleName.includes('officer') || roleName.includes('manager');
        };

        const isAdmin = resolveIsClientAdmin();
        console.log('[Dashboard] Role Check:', { isAdmin, roleName: selectedRole?.name });
        
        // 1. Users (Attempt for all, fallback to 0 if denied)
        let userCount = 0;
        try {
          const usersRes = await getUsers(customerId);
          console.log('Raw users response:', usersRes);
          userCount = Array.isArray(usersRes) ? usersRes.length : 0;
          setActiveUsers(userCount);
        } catch (e) {
          console.error('Users fetch failed:', e);
          setActiveUsers(0);
        }
 
        // 2. Compliance Periods
        let periodCount = 0;
        if (selectedDomain?.id) {
          const periods = await dashboardService.getCompliancePeriods(customerId, Number(selectedDomain.id)).catch(() => []);
          console.log('Raw periods response:', periods);
          periodCount = Array.isArray(periods) ? periods.length : 0;
          setActivePeriods(periodCount);
        }
 
        // 3. Assignments
        let notStarted: DashboardAssignment[] = [];
        let doerWip: DashboardAssignment[] = [];
        let reviewerWip: DashboardAssignment[] = [];
        let completed: DashboardAssignment[] = [];
 
        if (isAdmin) {
          [notStarted, doerWip, reviewerWip, completed] = await Promise.all([
            dashboardService.getAssignmentsNotStarted(customerId).catch(() => []),
            dashboardService.getAssignmentsDoerWip(customerId).catch(() => []),
            dashboardService.getAssignmentsReviewerWip(customerId).catch(() => []),
            dashboardService.getAssignmentsCompleted(customerId).catch(() => [])
          ]);
        } else {
          // User specific
          [notStarted, doerWip, reviewerWip, completed] = await Promise.all([
            dashboardService.getAssignmentsNotStartedByUser(customerId, userId).catch(() => []),
            dashboardService.getAssignmentsDoerWipByUser(customerId, userId).catch(() => []),
            dashboardService.getAssignmentsReviewerWipByUser(customerId).catch(() => []),
            dashboardService.getAssignmentsCompletedByUser(customerId, userId).catch(() => [])
          ]);
        }
        console.log('Assignment counts:', { notStarted: notStarted.length, doerWip: doerWip.length, reviewerWip: reviewerWip.length, completed: completed.length });
 
        const pCount = notStarted.length + doerWip.length + reviewerWip.length;
        const cCount = completed.length;
        setPendingCount(pCount);
        setCompletedCount(cCount);
 
        // Combine for Recent Activities table
        const combined = [
          ...notStarted.map(i => ({ ...i, fallbackStatus: 'pending' })),
          ...doerWip.map(i => ({ ...i, fallbackStatus: 'in-progress' })),
          ...reviewerWip.map(i => ({ ...i, fallbackStatus: 'in-progress' })),
          ...completed.map(i => ({ ...i, fallbackStatus: 'completed' }))
        ];
 
        // Sort by dates (newest plannedEndDate first) or fallback to ID
        combined.sort((a, b) => {
          const tA = a.plannedEndDate ? new Date(a.plannedEndDate).getTime() : 0;
          const tB = b.plannedEndDate ? new Date(b.plannedEndDate).getTime() : 0;
          if (tA !== tB) return tA - tB;
          return (Number(b.assignmentId) || 0) - (Number(a.assignmentId) || 0);
        });
 
        // Map to expected format
        const mappedRecent = combined.slice(0, 5).map(item => ({
          id: String(item.assignmentId || Math.random()),
          title: item.activityTitle || item.activityDetail || 'Unnamed Activity',
          status: item.workflowStatus || item.fallbackStatus,
          assignee: item.doer || item.reviewer || 'Unassigned',
          dueDate: item.plannedEndDate ? new Date(item.plannedEndDate).toLocaleDateString() : 'N/A',
          priority: 'medium'
        }));
 
        setRecentActivities(mappedRecent);
        console.log('Dashboard counts:', { activePeriods: periodCount, activeUsers: userCount, pending: pCount, completed: cCount });
 
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };
 
    fetchData();
  }, [selectedDomain, selectedRole]);
 
  const stats = [
    {
      title: 'Active Compliance Periods',
      value: activePeriods.toString(),
      change: '--',
      trend: 'up',
      icon: FileText,
      color: 'blue'
    },
    {
      title: 'Pending Activities',
      value: pendingCount.toString(),
      change: '--',
      trend: 'down',
      icon: Clock,
      color: 'yellow'
    },
    {
      title: 'Completed Tasks',
      value: completedCount.toString(),
      change: '--',
      trend: 'up',
      icon: CheckCircle,
      color: 'green'
    },
    {
      title: 'Active Users',
      value: activeUsers.toString(),
      change: '--',
      trend: 'up',
      icon: Users,
      color: 'purple'
    }
  ];
 
  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('complete')) return 'bg-green-100 text-green-800';
    if (s.includes('progress') || s.includes('wip') || s.includes('started')) return 'bg-blue-100 text-blue-800';
    if (s.includes('pending') || s.includes('not started')) return 'bg-yellow-100 text-yellow-800';
    if (s.includes('overdue') || s.includes('reject')) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };
 
  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };
 
  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">
          Welcome to {selectedDomain?.name || 'GRC Platform'}
        </h2>
        <p className="text-blue-100">
          Monitor and manage your governance, risk, and compliance activities
        </p>
      </div>
 
      {isLoading ? (
        <div className="flex justify-center p-10">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 stat-card cursor-default">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    stat.color === 'blue' ? 'bg-blue-100' :
                    stat.color === 'yellow' ? 'bg-yellow-100' :
                    stat.color === 'green' ? 'bg-green-100' :
                    'bg-purple-100'
                  }`}>
                    <stat.icon className={`w-5 h-5 ${
                      stat.color === 'blue' ? 'text-blue-600' :
                      stat.color === 'yellow' ? 'text-yellow-600' :
                      stat.color === 'green' ? 'text-green-600' :
                      'text-purple-600'
                    }`} />
                  </div>
                  <div className={`flex items-center gap-1 text-sm ${
                    stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <TrendingUp className={`w-4 h-4 ${stat.trend === 'down' ? 'rotate-180' : ''}`} />
                    {stat.change}
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                </div>
              </div>
            ))}
          </div>
 
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activities */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Recent Activities</h3>
                <button 
                  onClick={() => navigate('/activities/assignments')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {recentActivities.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">No recent activities found.</p>
                ) : (
                  recentActivities.map((activity) => (
                    <div 
                      key={activity.id} 
                      onClick={() => navigate('/activities/assignments')}
                      className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-800">{activity.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                            {activity.status.replace('-', ' ')}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>{activity.assignee}</span>
                          <span>Due: {activity.dueDate}</span>
                          <span className={`font-medium ${getPriorityColor(activity.priority)}`}>
                            {activity.priority} priority
                          </span>
                        </div>
                      </div>
                      <FileText className="w-4 h-4 text-gray-400" />
                    </div>
                  ))
                )}
              </div>
            </div>
 
            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Quick Actions</h3>
              <div className="space-y-3">
                {[
                  { icon: FileText, label: 'Create New Compliance Period', color: 'blue', path: '/config/periods/create' },
                  { icon: Users, label: 'Add New User', color: 'green', path: '/users/manage' },
                  { icon: Shield, label: 'Manage Licenses', color: 'indigo', path: '/config/licenses' }
                ].map((action, index) => (
                  <button
                    key={index}
                    onClick={() => navigate(action.path)}
                    className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      action.color === 'blue' ? 'bg-blue-100' :
                      action.color === 'green' ? 'bg-green-100' :
                      action.color === 'yellow' ? 'bg-yellow-100' :
                      action.color === 'purple' ? 'bg-purple-100' :
                      'bg-indigo-100'
                    }`}>
                      <action.icon className={`w-4 h-4 ${
                        action.color === 'blue' ? 'text-blue-600' :
                        action.color === 'green' ? 'text-green-600' :
                        action.color === 'yellow' ? 'text-yellow-600' :
                        action.color === 'purple' ? 'text-purple-600' :
                        'text-indigo-600'
                      }`} />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
 
          {/* Activity Status Overview */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Activity Status Overview</h3>
            <div className="h-64 bg-gray-50 rounded-lg flex items-end justify-around p-8">
              {(() => {
                const total = pendingCount + completedCount || 1;
                const pPercent = (pendingCount / total) * 100;
                const cPercent = (completedCount / total) * 100;
                return (
                  <>
                    <div className="flex flex-col items-center gap-2 group w-24">
                      <div 
                        className="bg-yellow-400 w-full rounded-t-lg chart-bar hover:bg-yellow-500 shadow-sm"
                        style={{ height: `${Math.max(pPercent, 5)}%` }}
                        title={`Pending: ${pendingCount}`}
                      ></div>
                      <span className="text-xs font-semibold text-gray-600">Pending ({pendingCount})</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 group w-24">
                      <div 
                        className="bg-green-500 w-full rounded-t-lg chart-bar hover:bg-green-600 shadow-sm"
                        style={{ height: `${Math.max(cPercent, 5)}%` }}
                        title={`Completed: ${completedCount}`}
                      ></div>
                      <span className="text-xs font-semibold text-gray-600">Completed ({completedCount})</span>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </>
      )}
    </div>
  );
};