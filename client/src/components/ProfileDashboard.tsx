
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Shield, Calendar } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import LanguageSelector from "./LanguageSelector";

interface ProfileDashboardProps {
  userRole: "admin" | "lender" | "borrower" | "referrer";
  onClose: () => void;
}

const ProfileDashboard = ({ userRole, onClose }: ProfileDashboardProps) => {
  const { t } = useLanguage();

  const getUserInfo = () => {
    switch (userRole) {
      case "admin":
        return {
          name: "John Admin",
          email: "admin@lenderp.com",
          joinDate: "January 2024",
          permissions: [t('profile.fullAccess'), t('profile.userManagement'), t('profile.systemSettings')]
        };
      case "lender":
        return {
          name: "Jane Lender",
          email: "lender@lenderp.com",
          joinDate: "February 2024",
          permissions: [t('profile.loanManagement'), t('profile.borrowerAccess'), t('nav.reports')]
        };
      case "borrower":
        return {
          name: "Mike Borrower",
          email: "borrower@lenderp.com",
          joinDate: "March 2024",
          permissions: [t('profile.viewLoans'), t('profile.makePayments'), t('profile.viewSchedule')]
        };
      case "referrer":
        return {
          name: "Rajesh Kumar",
          email: "referrer@lenderp.com",
          joinDate: "April 2024",
          permissions: [t('profile.viewReferrals'), t('profile.trackCommissions'), t('nav.detailedReports')]
        };
      default:
        return {
          name: "User",
          email: "user@lenderp.com",
          joinDate: "2024",
          permissions: []
        };
    }
  };

  const userInfo = getUserInfo();

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-2xl">
                {getAvatarLetter()}
              </AvatarFallback>
            </Avatar>
          </div>
          <CardTitle className="text-xl">{userInfo.name}</CardTitle>
          <CardDescription>
            <Badge variant="outline" className="capitalize">
              {t(`login.${userRole}`)}
            </Badge>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-3">
            <Mail className="h-4 w-4 text-gray-500" />
            <span className="text-sm">{userInfo.email}</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm">{t('profile.joined')} {userInfo.joinDate}</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <Shield className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">{t('profile.permissions')}</span>
            </div>
            <div className="ml-7 space-y-1">
              {userInfo.permissions.map((permission, index) => (
                <Badge key={index} variant="secondary" className="text-xs mr-2">
                  {permission}
                </Badge>
              ))}
            </div>
          </div>

          <LanguageSelector />

          <div className="pt-4 space-y-2">
            <Button variant="outline" className="w-full">
              <User className="mr-2 h-4 w-4" />
              {t('profile.editProfile')}
            </Button>
            <Button variant="outline" onClick={onClose} className="w-full">
              {t('profile.close')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileDashboard;
