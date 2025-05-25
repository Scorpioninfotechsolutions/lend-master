
import { ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, Menu, Bell } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useLanguage } from "../contexts/LanguageContext";
import Sidebar from "./Sidebar";
import ProfileDashboard from "./ProfileDashboard";

interface LayoutProps {
  children: ReactNode;
  userRole: "admin" | "lender" | "borrower" | "referrer";
  onNavigate: (view: string) => void;
  onLogout: () => void;
}

const Layout = ({ children, userRole, onNavigate, onLogout }: LayoutProps) => {
  const [showProfile, setShowProfile] = useState(false);
  const { t } = useLanguage();

  const handleLogout = () => {
    console.log("Logout clicked");
    onLogout();
  };

  const handleProfileClick = () => {
    setShowProfile(true);
  };

  const handleCloseProfile = () => {
    setShowProfile(false);
  };

  const getAvatarLetter = () => {
    switch (userRole) {
      case "admin": return "A";
      case "lender": return "L";
      case "borrower": return "B";
      case "referrer": return "R";
      default: return "U";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-2 sm:px-4 lg:px-6 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64">
                <Sidebar userRole={userRole} onNavigate={onNavigate} />
              </SheetContent>
            </Sheet>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">{t('app.name')}</h1>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Button variant="ghost" size="icon" className="hidden sm:flex">
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <Avatar className="cursor-pointer h-8 w-8 sm:h-10 sm:w-10" onClick={handleProfileClick}>
              <AvatarFallback className="text-xs sm:text-sm">
                {getAvatarLetter()}
              </AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar for desktop */}
        <div className="hidden lg:block flex-shrink-0">
          <Sidebar userRole={userRole} onNavigate={onNavigate} />
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <div className="p-3 sm:p-4 lg:p-6 h-full">
            {children}
          </div>
        </main>
      </div>

      {/* Profile Dashboard Modal */}
      {showProfile && (
        <ProfileDashboard 
          userRole={userRole} 
          onClose={handleCloseProfile}
        />
      )}
    </div>
  );
};

export default Layout;
