import { useState, useEffect } from "react";
import Login from "./Login";
import Layout from "../components/Layout";
import Dashboard from "../components/Dashboard";
import LoanForm from "../components/LoanForm";
import BorrowersPage from "../components/BorrowersPage";
import RepaymentsPage from "../components/RepaymentsPage";
import SchedulePage from "../components/SchedulePage";
import ReportsPage from "../components/ReportsPage";
import ReferrersPage from "../components/ReferrersPage";
import AdminLenders from "../components/AdminLenders";
import AdminLogs from "../components/AdminLogs";
import AdminSettings from "../components/AdminSettings";
import ReferrerDashboard from "../components/ReferrerDashboard";
import ReferrerReports from "../components/ReferrerReports";
import { useAuth } from "../contexts/AuthContext";

const Index = () => {
  const { isAuthenticated, user, logout, loading } = useAuth();
  const [currentView, setCurrentView] = useState("dashboard");

  // Reset to dashboard when user changes or on login
  useEffect(() => {
    if (user) {
      console.log(`User role detected: ${user.role}, setting initial view to dashboard`);
      setCurrentView("dashboard");
    }
  }, [user]);

  // Handle navigation
  const handleNavigation = (view: string) => {
    // Validate if the view is allowed for this user role
    if (user) {
      const allowedViews = getAllowedViewsForRole(user.role);
      if (allowedViews.includes(view)) {
        setCurrentView(view);
        console.log(`Navigating to ${view}`);
      } else {
        console.warn(`View "${view}" is not allowed for ${user.role} role`);
        // Default to dashboard if trying to access unauthorized view
        setCurrentView("dashboard");
      }
    }
  };
  
  // Helper function to get allowed views per role
  const getAllowedViewsForRole = (role: string) => {
    switch (role) {
      case "admin":
        return ["dashboard", "lenders", "logs", "settings"];
      case "lender":
        return ["dashboard", "new-loan", "borrowers", "repayments", "schedule", "referrers", "reports"];
      case "borrower":
        return ["dashboard", "loans", "repayments", "schedule"];
      case "referrer":
        return ["dashboard", "reports", "schedule", "repayments"];
      default:
        return ["dashboard"];
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
        <div className="text-zinc-200 text-xl">Loading...</div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated || !user) {
    return <Login />;
  }

  const renderContent = () => {
    // Admin-specific views
    if (user.role === "admin") {
      switch (currentView) {
        case "lenders":
          return <AdminLenders />;
        case "logs":
          return <AdminLogs />;
        case "settings":
          return <AdminSettings />;
        default:
          return <Dashboard userRole={user.role} />;
      }
    }
    
    // Referrer-specific views
    if (user.role === "referrer") {
      switch (currentView) {
        case "reports":
          return <ReferrerReports />;
        case "repayments":
          return <RepaymentsPage userRole={user.role} />;
        case "schedule":
          return <SchedulePage userRole={user.role} />;
        default:
          return <ReferrerDashboard />;
      }
    }
    
    // Lender-specific views
    if (user.role === "lender") {
      switch (currentView) {
        case "new-loan":
          return <LoanForm />;
        case "borrowers":
          return <BorrowersPage userRole={user.role} />;
        case "repayments":
          return <RepaymentsPage userRole={user.role} />;
        case "schedule":
          return <SchedulePage userRole={user.role} />;
        case "referrers":
          return <ReferrersPage />;
        case "reports":
          return <ReportsPage />;
        default:
          return <Dashboard userRole={user.role} />;
      }
    }
    
    // Borrower-specific views (default fallback)
    switch (currentView) {
      case "repayments":
        return <RepaymentsPage userRole={user.role} />;
      case "schedule":
        return <SchedulePage userRole={user.role} />;
      default:
        return <Dashboard userRole={user.role} />;
    }
  };

  return (
    <Layout 
      userRole={user.role} 
      onNavigate={handleNavigation}
      onLogout={logout}
    >
      {renderContent()}
    </Layout>
  );
};

export default Index;
