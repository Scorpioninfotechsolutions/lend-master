
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, User, DollarSign, Settings } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

const AdminLogs = () => {
  const { t } = useLanguage();

  const mockLogs = [
    { id: 1, action: t('logs.userLogin'), user: "john@example.com", timestamp: "2025-01-20 10:30 AM", type: "auth" },
    { id: 2, action: t('logs.loanCreated'), user: "sarah@example.com", timestamp: "2025-01-20 09:15 AM", type: "loan" },
    { id: 3, action: t('logs.paymentReceived'), user: "mike@example.com", timestamp: "2025-01-20 08:45 AM", type: "payment" },
    { id: 4, action: t('logs.settingsUpdated'), user: "admin@example.com", timestamp: "2025-01-19 04:20 PM", type: "system" },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'auth': return <User className="h-4 w-4 sm:h-5 sm:w-5" />;
      case 'loan': return <Activity className="h-4 w-4 sm:h-5 sm:w-5" />;
      case 'payment': return <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />;
      case 'system': return <Settings className="h-4 w-4 sm:h-5 sm:w-5" />;
      default: return <Activity className="h-4 w-4 sm:h-5 sm:w-5" />;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold">{t('logs.activityLogs')}</h1>

      <div className="space-y-3 sm:space-y-4">
        {mockLogs.map((log) => (
          <Card key={log.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 pb-2">
              <div className="flex items-center space-x-2 sm:space-x-3">
                {getIcon(log.type)}
                <CardTitle className="text-base sm:text-lg">{log.action}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:justify-between space-y-1 sm:space-y-0">
                <CardDescription className="text-sm">{t('logs.user')}: {log.user}</CardDescription>
                <CardDescription className="text-sm">{log.timestamp}</CardDescription>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminLogs;
