import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext'; // Provides notifications state and actions (add/remove/show*)
import NotificationContainer from './components/NotificationContainer'; // Renders notifications from context at top-right
import ProtectedRoute, { AuthRoute } from './components/ProtectedRoute';
import { useNavigationGuard } from './hooks/useNavigationGuard';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import VisitRequests from './pages/admin/VisitRequests';
import PrisonBlocks from './pages/admin/PrisonBlocks';
import ManageWardens from './pages/admin/ManageWardens';
import AddPrisoners from './pages/admin/AddPrisoners';
import BehavioralReports from './pages/admin/BehavioralReports';
import ActivityReports from './pages/admin/ActivityReports';
import VisitRules from './pages/admin/VisitRules';
import PrisonRules from './pages/admin/PrisonRules';
import AllUsers from './pages/admin/AllUsers';
import Settings from './pages/admin/Settings';
import AdminResetPassword from './pages/admin/AdminResetPassword';
import ValidationTest from './components/ValidationTest';
import TestUserForm from './components/TestUserForm';
import RouteTest from './components/RouteTest';

// Staff Pages
import StaffDashboard from './pages/staff/StaffDashboard';
import InmatesView from './pages/staff/InmatesView';
import ReportIncidents from './pages/staff/ReportIncidents';
import MySchedule from './pages/staff/MySchedule';
import MyReports from './pages/staff/MyReports';
import BehaviorRatings from './pages/staff/BehaviorRatings';
import CounselingSessions from './pages/staff/CounselingSessions';
import LeaveRequests from './pages/staff/LeaveRequests';
import FaceRecognitionAttendance from './pages/staff/FaceRecognitionAttendance';
import TestStaff from './pages/staff/TestStaff';

// Warden Pages
import WardenDashboard from './pages/warden/WardenDashboard';
import InmatesManagement from './pages/warden/InmatesManagement';
import ManageStaff from './pages/warden/ManageStaff';
import ScheduleManagement from './pages/warden/ScheduleManagement';
import ReportsManagement from './pages/warden/ReportsManagement';
import BehaviorAnalytics from './pages/warden/BehaviorAnalytics';
import WardenLeaveRequests from './pages/warden/LeaveRequests';
import ParoleRequests from './pages/warden/ParoleRequests';
import RehabilitationPrograms from './pages/warden/RehabilitationPrograms';
import WardenSettings from './pages/warden/WardenSettings';

import './App.css';

// Component to apply navigation guard globally
const AppWithGuard = () => {
  useNavigationGuard();
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={
        <AuthRoute>
          <Login />
        </AuthRoute>
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin" element={
        <ProtectedRoute>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/blocks" element={
        <ProtectedRoute>
          <PrisonBlocks />
        </ProtectedRoute>
      } />
      <Route path="/admin/wardens" element={
        <ProtectedRoute>
          <ManageWardens />
        </ProtectedRoute>
      } />
      <Route path="/admin/prisoners" element={
        <ProtectedRoute>
          <AddPrisoners />
        </ProtectedRoute>
      } />
      <Route path="/admin/behavioral-reports" element={
        <ProtectedRoute>
          <BehavioralReports />
        </ProtectedRoute>
      } />
      <Route path="/admin/activity-reports" element={
        <ProtectedRoute>
          <ActivityReports />
        </ProtectedRoute>
      } />
      <Route path="/admin/visit-rules" element={
        <ProtectedRoute>
          <VisitRules />
        </ProtectedRoute>
      } />
      <Route path="/admin/prison-rules" element={
        <ProtectedRoute>
          <PrisonRules />
        </ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute>
          <AllUsers />
        </ProtectedRoute>
      } />
      <Route path="/admin/settings" element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      } />

      <Route path="/validation-test" element={<ValidationTest />} />
      <Route path="/test-user-form" element={<TestUserForm />} />
      <Route path="/route-test" element={<RouteTest />} />
      <Route path="/staff/dashboard" element={
        <ProtectedRoute>
          <StaffDashboard />
        </ProtectedRoute>
      } />

      <Route path="/admin/visit-requests" element={
        <ProtectedRoute>
          <VisitRequests />
        </ProtectedRoute>
      } />
      <Route path="/staff/inmates" element={
        <ProtectedRoute>
          <InmatesView />
        </ProtectedRoute>
      } />
      <Route path="/staff/incidents" element={
        <ProtectedRoute>
          <ReportIncidents />
        </ProtectedRoute>
      } />
      <Route path="/staff/schedule" element={
        <ProtectedRoute>
          <MySchedule />
        </ProtectedRoute>
      } />
      <Route path="/staff/reports" element={
        <ProtectedRoute>
          <MyReports />
        </ProtectedRoute>
      } />
      <Route path="/staff/behavior" element={
        <ProtectedRoute>
          <BehaviorRatings />
        </ProtectedRoute>
      } />
      <Route path="/staff/counseling" element={
        <ProtectedRoute>
          <CounselingSessions />
        </ProtectedRoute>
      } />
      <Route path="/staff/leave" element={
        <ProtectedRoute>
          <LeaveRequests />
        </ProtectedRoute>
      } />
      <Route path="/staff/attendance" element={
        <ProtectedRoute>
          <FaceRecognitionAttendance />
        </ProtectedRoute>
      } />
      <Route path="/staff/test" element={
        <ProtectedRoute>
          <TestStaff />
        </ProtectedRoute>
      } />
      <Route path="/warden/dashboard" element={
        <ProtectedRoute>
          <WardenDashboard />
        </ProtectedRoute>
      } />
      <Route path="/warden/inmates" element={
        <ProtectedRoute>
          <InmatesManagement />
        </ProtectedRoute>
      } />
      <Route path="/warden/staff" element={
        <ProtectedRoute>
          <ManageStaff />
        </ProtectedRoute>
      } />
      <Route path="/warden/schedule" element={
        <ProtectedRoute>
          <ScheduleManagement />
        </ProtectedRoute>
      } />
      <Route path="/warden/reports" element={
        <ProtectedRoute>
          <ReportsManagement />
        </ProtectedRoute>
      } />
      <Route path="/warden/behavior" element={
        <ProtectedRoute>
          <BehaviorAnalytics />
        </ProtectedRoute>
      } />
      <Route path="/warden/leaves" element={
        <ProtectedRoute>
          <WardenLeaveRequests />
        </ProtectedRoute>
      } />
      <Route path="/warden/paroles" element={
        <ProtectedRoute>
          <ParoleRequests />
        </ProtectedRoute>
      } />
      <Route path="/warden/rehabilitation" element={
        <ProtectedRoute>
          <RehabilitationPrograms />
        </ProtectedRoute>
      } />
      <Route path="/warden/settings" element={
        <ProtectedRoute>
          <WardenSettings />
        </ProtectedRoute>
      } />
      <Route path="/forgot-password" element={
        <AuthRoute>
          <ForgotPassword />
        </AuthRoute>
      } />
      <Route path="/reset-password/:token" element={
        <AuthRoute>
          <ResetPassword />
        </AuthRoute>
      } />
    </Routes>
  );
};

function App() {
  return (
    <NotificationProvider> {/* Notification context provider (state stored here) */}
      <AuthProvider>
        <Router>
          <AppWithGuard />
        </Router>
        <NotificationContainer /> {/* Where notifications render on the page */}
      </AuthProvider>
    </NotificationProvider>
  );
}

export default App;
