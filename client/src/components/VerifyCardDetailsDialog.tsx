import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "../contexts/LanguageContext";
import { Eye, EyeOff, ShieldAlert, Lock } from "lucide-react";
import api from "../utils/api";

interface VerifyCardDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onVerificationSuccess: () => void;
  fieldToVerify: "cvv" | "atmPin" | "validTil" | "password";
}

const VerifyCardDetailsDialog = ({
  open,
  onOpenChange,
  userId,
  onVerificationSuccess,
  fieldToVerify
}: VerifyCardDetailsDialogProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Reset password field when dialog opens or closes
  useEffect(() => {
    setPassword("");
    setShowPassword(false);
  }, [open]);

  const handleVerify = async () => {
    if (!password) {
      toast({
        title: t('common.error'),
        description: t('borrowers.passwordRequired'),
        variant: "destructive"
      });
      return;
    }

    console.log("Verifying password for user:", userId);
    setIsLoading(true);
    
    try {
      // Use the password verification endpoint instead of card verification
      const response = await api.post('/auth/verify-password', {
        password
      });

      console.log("Password verification response:", response.data);
      
      if (response.data.success) {
        console.log("Password verification successful, calling onVerificationSuccess");
        toast({
          title: t('common.success'),
          description: t('security.verificationSuccess')
        });
        onVerificationSuccess();
        onOpenChange(false);
      } else {
        toast({
          title: t('common.error'),
          description: t('borrowers.incorrectPassword'),
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Password verification error:', error);
      toast({
        title: t('common.error'),
        description: t('borrowers.passwordVerificationFailed'),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Custom handler for the Cancel button to ensure password is cleared
  const handleCancel = () => {
    setPassword("");
    setShowPassword(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      // When dialog is being closed, reset the password
      if (!newOpen) {
        setPassword("");
        setShowPassword(false);
      }
      onOpenChange(newOpen);
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-amber-500" />
            {t('borrowers.enterPassword')}
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-sm text-amber-800">
            {t('borrowers.passwordVerificationDesc')}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password-input">{t('login.password')}</Label>
            <div className="relative">
              <Input
                id="password-input"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleVerify();
                  }
                }}
                className="pr-10"
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleCancel}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleVerify} disabled={isLoading}>
              {isLoading ? t('common.verifying') : t('borrowers.verify')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VerifyCardDetailsDialog; 