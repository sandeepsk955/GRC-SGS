// src/components/MainApp.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { Header } from './layout/Header';
import { Sidebar } from './layout/Sidebar';

import { Dashboard } from './pages/Dashboard';
import { Portfolio } from './pages/Portfolio';
import  RoleManagement  from './pages/RoleManagement';
import  Activities  from './pages/Activities';
import { Configuration } from './pages/Configuration';
import { Reports } from './pages/Reports';
import { HelpContent } from './pages/HelpContent';
import { Documents } from './pages/Documents';
import { MyNotifications } from './pages/MyNotifications';
import MyReviews from './pages/MyReviews';
import ViewEditAssignments from './pages/Assignments';
import CreateInternalAudit from './pages/CreateInternalAudit';
import ManageLicence from './pages/ManageLicence';
import ManageInternalAudit from './pages/ManageInternalAudit';
import CAPAUpdate from './pages/CAPAUpdate';
import CAPAReview from './pages/CAPAReview';

export const MainApp: React.FC = () => {
  
  return (
    <BrowserRouter>
      <div className="h-screen bg-gray-50 flex">
        {/* ⛔ No props here — Sidebar is router-driven */}
        <Sidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto">
            <Routes>
              {/* Home -> Dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* Dashboard */}
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Portfolio */}
              <Route path="/portfolio" element={<Portfolio />} />
              {/* When clicking a specific standard like /portfolio/iso-27001 */}
              <Route path="/portfolio/:slug" element={<Portfolio />} />

              {/* Role/User Management */}
              <Route path="/roles/types" element={<RoleManagement />} />
              <Route path="/roles/manage" element={<RoleManagement />} />
              <Route path="/users/manage" element={<RoleManagement />} />

              {/* Activities */}
              <Route path="/activities/manage" element={<Activities />} />
              <Route path="/activities/assignments" element={<ViewEditAssignments />} />
              <Route path="/activities/notifications" element={<MyNotifications />} />
              <Route path="/activities/reviews" element={<MyReviews />} />

              {/* Configuration */}
              <Route path="/config/periods/create" element={<Configuration />} />
              <Route path="/config/periods/manage" element={<Configuration />} />
              <Route path="/config/assignments/create" element={<Configuration />} />
              <Route path="/config/periods/close" element={<Configuration />} />
              <Route path="/config/licenses" element={<ManageLicence />} />
              <Route path="/config/audits/create" element={<CreateInternalAudit />} />
              <Route path="/config/internal-audits" element={<Configuration />} />

              {/* Reports */}
              <Route path="/reports/performance" element={<Reports />} />
              <Route path="/reports/compliance" element={<Reports />} />

              {/* Help */}
              <Route path="/help/topics" element={<HelpContent />} />
              <Route path="/help/tickets" element={<HelpContent />} />

              {/* Documents */}
              <Route path="/documents" element={<Documents />} />
                            <Route path="/audit/manage-internal" element={<ManageInternalAudit />} />
                            <Route path="/audit/capa-update" element={<CAPAUpdate/>}/>
                            <Route path="/audit/capa-review" element={<CAPAReview/>}/>


              {/* Fallback */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
};
