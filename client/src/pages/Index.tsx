
import { useState } from "react";
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

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<"admin" | "lender" | "borrower" | "referrer">("lender");
  const [currentView, setCurrentView] = useState("dashboard");

  // Handle login with role selection
  const handleLogin = (role: "admin" | "lender" | "borrower" | "referrer") => {
    setUserRole(role);
    setIsLoggedIn(true);
    setCurrentView("dashboard"); // Reset to dashboard on login
    console.log(`User logged in as ${role}`);
  };

  // Handle logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole("lender");
    setCurrentView("dashboard");
    console.log("User logged out");
  };

  // Handle navigation
  const handleNavigation = (view: string) => {
    setCurrentView(view);
    console.log(`Navigating to ${view}`);
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  const renderContent = () => {
    // Referrer-specific views
    if (userRole === "referrer") {
      switch (currentView) {
        case "reports":
          return <ReferrerReports />;
        case "repayments":
          return <RepaymentsPage userRole={userRole as "admin" | "lender" | "borrower"} />;
        case "schedule":
          return <SchedulePage userRole={userRole as "admin" | "lender" | "borrower"} />;
        default:
          return <ReferrerDashboard />;
      }
    }

    // Other role views
    switch (currentView) {
      case "new-loan":
        return <LoanForm />;
      case "borrowers":
        return <BorrowersPage userRole={userRole as "admin" | "lender" | "borrower"} />;
      case "repayments":
        return <RepaymentsPage userRole={userRole as "admin" | "lender" | "borrower"} />;
      case "schedule":
        return <SchedulePage userRole={userRole as "admin" | "lender" | "borrower"} />;
      case "referrers":
        return <ReferrersPage />;
      case "reports":
        return <ReportsPage />;
      case "lenders":
        return <AdminLenders />;
      case "logs":
        return <AdminLogs />;
      case "settings":
        return <AdminSettings />;
      default:
        return <Dashboard userRole={userRole} />;
    }
  };

  return (
    <Layout 
      userRole={userRole} 
      onNavigate={handleNavigation}
      onLogout={handleLogout}
    >
      {renderContent()}
    </Layout>
  );
};

export default Index;
