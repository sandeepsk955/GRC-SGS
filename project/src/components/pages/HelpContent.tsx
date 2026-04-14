import React, { useState } from 'react';
import { HelpCircle, BookOpen, Ticket, Search, Plus, MessageSquare, Clock, CheckCircle } from 'lucide-react';

export const HelpContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('topics');

  const helpTopics = [
    {
      id: '1',
      category: 'Getting Started',
      title: 'How to create your first compliance period',
      description: 'Learn how to set up and configure a new compliance period for your organization',
      lastUpdated: '2024-01-10',
      views: 156
    },
    {
      id: '2',
      category: 'User Management',
      title: 'Managing roles and permissions',
      description: 'Complete guide to setting up user roles and managing access permissions',
      lastUpdated: '2024-01-08',
      views: 89
    },
    {
      id: '3',
      category: 'Compliance',
      title: 'Understanding ISO 27001 controls',
      description: 'Detailed explanation of ISO 27001 security controls and implementation',
      lastUpdated: '2024-01-05',
      views: 234
    },
    {
      id: '4',
      category: 'Reporting',
      title: 'Generating performance reports',
      description: 'How to create and customize performance reports for stakeholders',
      lastUpdated: '2024-01-03',
      views: 67
    },
    {
      id: '5',
      category: 'Configuration',
      title: 'Setting up audit schedules',
      description: 'Configure automated audit schedules and notifications',
      lastUpdated: '2024-01-01',
      views: 45
    }
  ];

  const tickets = [
    {
      id: 'TKT-001',
      subject: 'Unable to close compliance period',
      description: 'Getting an error when trying to close the Q4 2023 compliance period',
      status: 'open',
      priority: 'high',
      submittedBy: 'John Smith',
      submittedDate: '2024-01-15',
      lastUpdate: '2024-01-15',
      category: 'Configuration'
    },
    {
      id: 'TKT-002',
      subject: 'Missing user permissions for portfolio access',
      description: 'New user cannot see ISO 27001 portfolio items despite having correct role',
      status: 'in-progress',
      priority: 'medium',
      submittedBy: 'Sarah Johnson',
      submittedDate: '2024-01-14',
      lastUpdate: '2024-01-14',
      category: 'User Management'
    },
    {
      id: 'TKT-003',
      subject: 'Export functionality not working',
      description: 'Performance report export to PDF returns empty document',
      status: 'resolved',
      priority: 'low',
      submittedBy: 'Mike Davis',
      submittedDate: '2024-01-12',
      lastUpdate: '2024-01-13',
      category: 'Reporting'
    },
    {
      id: 'TKT-004',
      subject: 'License expiry notification not received',
      description: 'Did not receive notification about upcoming license expiry for SAMA CSF',
      status: 'open',
      priority: 'medium',
      submittedBy: 'Emma Wilson',
      submittedDate: '2024-01-11',
      lastUpdate: '2024-01-11',
      category: 'Licensing'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <Ticket className="w-4 h-4 text-red-600" />;
      case 'in-progress': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'resolved': return <CheckCircle className="w-4 h-4 text-green-600" />;
      default: return <Ticket className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const categories = ['All', 'Getting Started', 'User Management', 'Compliance', 'Reporting', 'Configuration'];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Help & Support</h2>
          <p className="text-gray-600">Find answers to your questions and get help with the platform</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Ticket
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'topics', label: 'Help Topics', icon: BookOpen },
            { id: 'tickets', label: 'Ticketing', icon: Ticket }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
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

      {/* Help Topics Tab */}
      {activeTab === 'topics' && (
        <div className="space-y-6">
          {/* Search and Categories */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search help topics..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Help Topics List */}
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-200">
            {helpTopics.map((topic) => (
              <div key={topic.id} className="p-6 hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                        {topic.category}
                      </span>
                      <h3 className="text-lg font-medium text-gray-800">{topic.title}</h3>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{topic.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Updated: {topic.lastUpdated}</span>
                      <span>Views: {topic.views}</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: 'Getting Started Guide', description: 'Complete walkthrough for new users' },
                { title: 'Video Tutorials', description: 'Watch step-by-step video guides' },
                { title: 'API Documentation', description: 'Integration and API reference' }
              ].map((link, index) => (
                <button
                  key={index}
                  className="text-left p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <h4 className="font-medium text-gray-800 mb-1">{link.title}</h4>
                  <p className="text-sm text-gray-600">{link.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tickets Tab */}
      {activeTab === 'tickets' && (
        <div className="space-y-6">
          {/* Tickets Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <Ticket className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">2</p>
                  <p className="text-sm text-gray-600">Open Tickets</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">1</p>
                  <p className="text-sm text-gray-600">In Progress</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">1</p>
                  <p className="text-sm text-gray-600">Resolved</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">4</p>
                  <p className="text-sm text-gray-600">Total Tickets</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tickets List */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Support Tickets</h3>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search tickets..."
                      className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      {getStatusIcon(ticket.status)}
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-medium text-gray-800">{ticket.subject}</h4>
                          <span className="text-sm text-gray-500">#{ticket.id}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                            {ticket.status.replace('-', ' ')}
                          </span>
                          <span className={`text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority} priority
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{ticket.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Category: {ticket.category}</span>
                          <span>Submitted by: {ticket.submittedBy}</span>
                          <span>Date: {ticket.submittedDate}</span>
                          <span>Last update: {ticket.lastUpdate}</span>
                        </div>
                      </div>
                    </div>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      View Details
                    </button>
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