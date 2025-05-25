
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "../contexts/LanguageContext";
import LanguageSelector from "./LanguageSelector";

const AdminSettings = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t('settings.systemSettings')}</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('settings.general')}</CardTitle>
            <CardDescription>{t('settings.generalDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company-name">{t('settings.companyName')}</Label>
              <Input id="company-name" defaultValue="Lend-Master" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="support-email">{t('settings.supportEmail')}</Label>
              <Input id="support-email" type="email" defaultValue="support@lendmaster.com" />
            </div>
            <LanguageSelector />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('settings.loan')}</CardTitle>
            <CardDescription>{t('settings.loanDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="max-loan">{t('settings.maxLoan')}</Label>
              <Input id="max-loan" type="number" defaultValue="1000000" />
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="auto-approval" />
              <Label htmlFor="auto-approval">{t('settings.autoApproval')}</Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('settings.notification')}</CardTitle>
            <CardDescription>{t('settings.notificationDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch id="email-notifications" defaultChecked />
              <Label htmlFor="email-notifications">{t('settings.emailNotifications')}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="sms-notifications" />
              <Label htmlFor="sms-notifications">{t('settings.smsNotifications')}</Label>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button>{t('settings.saveSettings')}</Button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
