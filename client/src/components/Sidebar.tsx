
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Users, 
  PlusCircle, 
  Calendar, 
  Activity, 
  Settings,
  DollarSign,
  FileText,
  UserCheck
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

interface SidebarProps {
  userRole: "admin" | "lender" | "borrower" | "referrer";
  onNavigate: (view: string) => void;
}

const Sidebar = ({ userRole, onNavigate }: SidebarProps) => {
  const { t } = useLanguage();

  const adminMenuItems = [
    { icon: Home, label: t('nav.dashboard'), view: "dashboard" },
    { icon: Users, label: t('nav.manageLenders'), view: "lenders" },
    { icon: Activity, label: t('nav.activityLogs'), view: "logs" },
    { icon: Settings, label: t('nav.settings'), view: "settings" },
  ];

  const lenderMenuItems = [
    { icon: Home, label: t('nav.dashboard'), view: "dashboard" },
    { icon: Users, label: t('nav.borrowers'), view: "borrowers" },
    { icon: PlusCircle, label: t('nav.newLoan'), view: "new-loan" },
    { icon: DollarSign, label: t('nav.repayments'), view: "repayments" },
    { icon: Calendar, label: t('nav.schedule'), view: "schedule" },
    { icon: UserCheck, label: t('nav.referrers'), view: "referrers" },
    { icon: FileText, label: t('nav.reports'), view: "reports" },
  ];

  const borrowerMenuItems = [
    { icon: Home, label: t('nav.myLoans'), view: "loans" },
    { icon: DollarSign, label: t('nav.repayments'), view: "repayments" },
    { icon: Calendar, label: t('nav.schedule'), view: "schedule" },
  ];

  const referrerMenuItems = [
    { icon: Home, label: t('nav.dashboard'), view: "dashboard" },
    { icon: FileText, label: t('nav.detailedReports'), view: "reports" },
    { icon: Calendar, label: t('nav.schedule'), view: "schedule" },
    { icon: DollarSign, label: t('nav.repayments'), view: "repayments" },
  ];

  const getMenuItems = () => {
    switch (userRole) {
      case "admin":
        return adminMenuItems;
      case "lender":
        return lenderMenuItems;
      case "borrower":
        return borrowerMenuItems;
      case "referrer":
        return referrerMenuItems;
      default:
        return [];
    }
  };

  return (
    <div className="w-full lg:w-64 bg-white border-r border-gray-200 h-full flex flex-col">
      <div className="p-3 sm:p-4 flex-1 overflow-y-auto">
        <div className="space-y-1 sm:space-y-2">
          {getMenuItems().map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.view}
                variant="ghost"
                className="w-full justify-start text-sm sm:text-base py-2 sm:py-3 px-3 sm:px-4 h-auto"
                onClick={() => onNavigate(item.view)}
              >
                <Icon className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
