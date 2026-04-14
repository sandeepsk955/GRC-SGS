import React, { useState } from 'react';
import { BarChart3, TrendingUp, Download, Calendar, Filter, LayoutDashboard } from 'lucide-react';

export const Reports: React.FC = () => {
  const [activeReport, setActiveReport] = useState('performance');

  const performanceData = {
    overview: {
      totalCompliance: 82,
      completedTasks: 156,
      pendingTasks: 34,
      overdueItems: 8,
      trend: '+5.2%'
    },
    domains: [
      { name: 'Cybersecurity', compliance: 85, tasks: 89, color: 'blue' },
      { name: 'BCMS', compliance: 78, tasks: 45, color: 'green' },
      { name: 'Quality', compliance: 92, tasks: 23, color: 'purple' },
      { name: 'Risk Management', compliance: 73, tasks: 33, color: 'yellow' }
    ]
  };

  const complianceMetrics = [
    { label: 'Overall Compliance Score', value: '82%', change: '+3.5%', trend: 'up' },
    { label: 'Controls Implemented', value: '347/420', change: '+12', trend: 'up' },
    { label: 'Risk Score', value: 'Medium', change: '↓ from High', trend: 'down' },
    { label: 'Audit Findings', value: '5 Open', change: '-3 this month', trend: 'down' }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Reports & Analytics</h2>
          <p className="text-gray-600">Comprehensive reporting and performance analytics</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">Last 30 days</span>
          </button>
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" />
            <span className="text-sm">Filter</span>
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'performance', label: 'Performance Report', icon: BarChart3 },
            { id: 'compliance', label: 'ComplianceDashboard', icon: LayoutDashboard }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveReport(tab.id)}
              className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeReport === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Performance Report */}
      {activeReport === 'performance' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <TrendingUp className="w-4 h-4" />
                  {performanceData.overview.trend}
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800 mb-1">
                  {performanceData.overview.totalCompliance}%
                </p>
                <p className="text-sm text-gray-600">Overall Compliance</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800 mb-1">
                  {performanceData.overview.completedTasks}
                </p>
                <p className="text-sm text-gray-600">Completed Tasks</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800 mb-1">
                  {performanceData.overview.pendingTasks}
                </p>
                <p className="text-sm text-gray-600">Pending Tasks</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-red-600" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800 mb-1">
                  {performanceData.overview.overdueItems}
                </p>
                <p className="text-sm text-gray-600">Overdue Items</p>
              </div>
            </div>
          </div>

          {/* Domain Performance */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Performance by Domain</h3>
            <div className="space-y-4">
              {performanceData.domains.map((domain, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      domain.color === 'blue' ? 'bg-blue-100' :
                      domain.color === 'green' ? 'bg-green-100' :
                      domain.color === 'purple' ? 'bg-purple-100' :
                      'bg-yellow-100'
                    }`}>
                      <BarChart3 className={`w-5 h-5 ${
                        domain.color === 'blue' ? 'text-blue-600' :
                        domain.color === 'green' ? 'text-green-600' :
                        domain.color === 'purple' ? 'text-purple-600' :
                        'text-yellow-600'
                      }`} />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">{domain.name}</h4>
                      <p className="text-sm text-gray-600">{domain.tasks} active tasks</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-800">{domain.compliance}%</div>
                      <div className="text-xs text-gray-500">Compliance</div>
                    </div>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          domain.color === 'blue' ? 'bg-blue-600' :
                          domain.color === 'green' ? 'bg-green-600' :
                          domain.color === 'purple' ? 'bg-purple-600' :
                          'bg-yellow-600'
                        }`}
                        style={{ width: `${domain.compliance}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Compliance Trend</h3>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Performance trend chart would be displayed here</p>
                <p className="text-sm text-gray-500">Integration with charting library (Chart.js, D3, etc.)</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Compliance Dashboard */}
      {activeReport === 'compliance' && (
        <div className="space-y-6">
          {/* Compliance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {complianceMetrics.map((metric, index) => (
              <div key={index} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <LayoutDashboard className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className={`flex items-center gap-1 text-sm ${
                    metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <TrendingUp className={`w-4 h-4 ${metric.trend === 'down' ? 'rotate-180' : ''}`} />
                    {metric.change}
                  </div>
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-800 mb-1">{metric.value}</p>
                  <p className="text-sm text-gray-600">{metric.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Control Status */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Control Implementation Status</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h4 className="font-medium text-gray-800 mb-4">By Status</h4>
                <div className="space-y-3">
                  {[
                    { label: 'Implemented', count: 347, total: 420, color: 'green' },
                    { label: 'In Progress', count: 45, total: 420, color: 'yellow' },
                    { label: 'Not Started', count: 28, total: 420, color: 'red' }
                  ].map((status, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          status.color === 'green' ? 'bg-green-500' :
                          status.color === 'yellow' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}></div>
                        <span className="text-sm font-medium text-gray-800">{status.label}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {status.count} ({Math.round((status.count / status.total) * 100)}%)
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-800 mb-4">By Priority</h4>
                <div className="space-y-3">
                  {[
                    { label: 'High Priority', count: 89, color: 'red' },
                    { label: 'Medium Priority', count: 156, color: 'yellow' },
                    { label: 'Low Priority', count: 175, color: 'green' }
                  ].map((priority, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          priority.color === 'red' ? 'bg-red-500' :
                          priority.color === 'yellow' ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}></div>
                        <span className="text-sm font-medium text-gray-800">{priority.label}</span>
                      </div>
                      <div className="text-sm text-gray-600">{priority.count} controls</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Recent Compliance Activities</h3>
            <div className="space-y-4">
              {[
                {
                  action: 'Control A.12.1.1 marked as completed',
                  user: 'John Smith',
                  timestamp: '2 hours ago',
                  type: 'completion'
                },
                {
                  action: 'Risk assessment updated for Cybersecurity domain',
                  user: 'Sarah Johnson',
                  timestamp: '4 hours ago',
                  type: 'update'
                },
                {
                  action: 'New audit finding added to Q1 2024 review',
                  user: 'Mike Davis',
                  timestamp: '6 hours ago',
                  type: 'finding'
                },
                {
                  action: 'SAMA CSF compliance report generated',
                  user: 'System',
                  timestamp: '1 day ago',
                  type: 'report'
                }
              ].map((activity, index) => (
                <div key={index} className="flex items-center gap-4 p-3 border border-gray-100 rounded-lg">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium ${
                    activity.type === 'completion' ? 'bg-green-600' :
                    activity.type === 'update' ? 'bg-blue-600' :
                    activity.type === 'finding' ? 'bg-red-600' :
                    'bg-purple-600'
                  }`}>
                    {activity.user[0]}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{activity.action}</p>
                    <p className="text-xs text-gray-500">by {activity.user} • {activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};