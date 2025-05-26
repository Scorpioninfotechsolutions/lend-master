import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "lender" | "borrower" | "referrer">("lender");
  const { t } = useLanguage();
  const { login, error, loading, clearError } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await login(username, password, role);
    } catch (err) {
      console.error("Authentication error:", err);
    }
  };

  // Show error toast when error changes
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900 px-4 py-8">
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-gray-400 filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full bg-gray-500 filter blur-3xl animate-pulse" style={{ animationDuration: '8s' }}></div>
      </div>
      
      <Card className="w-full max-w-md mx-auto bg-black/70 backdrop-blur-sm border border-zinc-700 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-lg opacity-80 z-0"></div>
        
        <CardHeader className="relative z-10 space-y-4 text-center pt-8">
          <div className="mx-auto relative">
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-300 to-white rounded-full opacity-10 blur-md"></div>
            <img src="/logo.webp" alt="Lend Master Logo" className="mx-auto h-28 w-auto relative z-10" />
          </div>
          
          <div className="space-y-2">
            <CardTitle className="text-4xl font-extrabold text-zinc-100 tracking-tight">Lend Master</CardTitle>
            <CardDescription className="text-base text-zinc-400">— Master Your Money Flow. Effortlessly —</CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="relative z-10 space-y-6 pb-8">
          <form onSubmit={handleSubmit} className="space-y-5">            
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm text-zinc-300">{t('login.username')}</Label>
              <Input 
                id="username" 
                type="text" 
                placeholder={t('login.username')} 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                required 
                className="bg-zinc-800/70 border-zinc-700 text-zinc-200 placeholder:text-zinc-500 focus:border-zinc-500 focus:ring-zinc-500"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm text-zinc-300">{t('login.password')}</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder={t('login.password')} 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                className="bg-zinc-800/70 border-zinc-700 text-zinc-200 placeholder:text-zinc-500 focus:border-zinc-500 focus:ring-zinc-500"
              />
            </div>
            
            <div className="space-y-3">
              <Label className="text-sm text-zinc-300">{t('login.loginAs')}</Label>
              <RadioGroup 
                value={role} 
                onValueChange={(value) => setRole(value as "admin" | "lender" | "borrower" | "referrer")} 
                className="grid grid-cols-2 gap-3"
              >
                <label htmlFor="admin" className="flex items-center space-x-2 bg-zinc-800/50 p-3 rounded-lg border border-zinc-700 hover:border-zinc-600 transition-all cursor-pointer">
                  <RadioGroupItem value="admin" id="admin" className="text-zinc-300" />
                  <span className="text-sm text-zinc-300">{t('login.admin')}</span>
                </label>
                <label htmlFor="lender" className="flex items-center space-x-2 bg-zinc-800/50 p-3 rounded-lg border border-zinc-700 hover:border-zinc-600 transition-all cursor-pointer">
                  <RadioGroupItem value="lender" id="lender" className="text-zinc-300" />
                  <span className="text-sm text-zinc-300">{t('login.lender')}</span>
                </label>
                <label htmlFor="borrower" className="flex items-center space-x-2 bg-zinc-800/50 p-3 rounded-lg border border-zinc-700 hover:border-zinc-600 transition-all cursor-pointer">
                  <RadioGroupItem value="borrower" id="borrower" className="text-zinc-300" />
                  <span className="text-sm text-zinc-300">{t('login.borrower')}</span>
                </label>
                <label htmlFor="referrer" className="flex items-center space-x-2 bg-zinc-800/50 p-3 rounded-lg border border-zinc-700 hover:border-zinc-600 transition-all cursor-pointer">
                  <RadioGroupItem value="referrer" id="referrer" className="text-zinc-300" />
                  <span className="text-sm text-zinc-300">{t('login.referrer')}</span>
                </label>
              </RadioGroup>
            </div>
            
            <Button 
              type="submit" 
              className="w-full py-3 bg-gradient-to-r from-zinc-700 to-zinc-600 hover:from-zinc-600 hover:to-zinc-500 text-zinc-100 font-medium text-base tracking-wide border border-zinc-600 shadow-lg transition-all"
              disabled={loading}
            >
              {loading ? 'Please wait...' : t('login.signIn')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
