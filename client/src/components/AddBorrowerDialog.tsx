import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Upload, CreditCard, User, ArrowRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "../contexts/LanguageContext";
import type { NewBorrowerData, Referrer } from "../types/borrower";

interface AddBorrowerDialogProps {
  referrers: Referrer[];
  onAddBorrower: (borrowerData: any) => void;
}

const AddBorrowerDialog = ({ referrers, onAddBorrower }: AddBorrowerDialogProps) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("personal");
  const [open, setOpen] = useState(false);
  const [newBorrowerData, setNewBorrowerData] = useState<NewBorrowerData>({
    profilePicture: null,
    fullName: "",
    username: "",
    password: "",
    phone: "",
    address: "",
    idProof: null,
    cardNumber: "",
    cardName: "",
    validTil: "",
    cvv: "",
    atmPin: "",
    referrer: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setNewBorrowerData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewBorrowerData(prev => ({ ...prev, [field]: file }));
    }
  };

  const handleAddBorrower = () => {
    console.log("Adding new borrower:", newBorrowerData);
    
    // Generate email from username (since server requires email)
    const email = `${newBorrowerData.username.toLowerCase()}@example.com`;
    
    // Format data according to the User model
    onAddBorrower({
      name: newBorrowerData.fullName,
      email: email, // Include email for server compatibility
      username: newBorrowerData.username,
      password: newBorrowerData.password,
      phone: newBorrowerData.phone,
      address: newBorrowerData.address,
      referrer: newBorrowerData.referrer,
      // Send card details as direct fields
      cardNumber: newBorrowerData.cardNumber,
      cardName: newBorrowerData.cardName,
      validTil: newBorrowerData.validTil,
      cvv: newBorrowerData.cvv,
      atmPin: newBorrowerData.atmPin,
      // Set role explicitly to 'borrower'
      role: 'borrower'
    });
    
    // Reset form
    setNewBorrowerData({
      profilePicture: null,
      fullName: "",
      username: "",
      password: "",
      phone: "",
      address: "",
      idProof: null,
      cardNumber: "",
      cardName: "",
      validTil: "",
      cvv: "",
      atmPin: "",
      referrer: ""
    });
    
    // Close the dialog
    setOpen(false);
  };

  const handleNextStep = () => {
    setActiveTab("card");
  };

  // Reset to personal tab whenever dialog opens
  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    if (open) {
      setActiveTab("personal");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          {t('borrowers.addBorrower')}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-3xl p-4 sm:p-6 overflow-y-auto max-h-[90vh] sm:max-h-[80vh]">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-lg sm:text-xl">{t('borrowers.addNew')}</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-2 mb-4">
            <TabsTrigger value="personal" className="flex items-center justify-center gap-2 py-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">{t('borrowers.personalInfo')}</span>
              <span className="sm:hidden">Personal</span>
            </TabsTrigger>
            <TabsTrigger value="card" className="flex items-center justify-center gap-2 py-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">{t('borrowers.atmCardDetails')}</span>
              <span className="sm:hidden">Card</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Personal Information Tab */}
          <TabsContent value="personal">
            <form 
              autoComplete="off" 
              autoCorrect="off" 
              autoCapitalize="off" 
              spellCheck="false"
              onSubmit={(e) => e.preventDefault()}
            >
              {/* Hidden fields to defeat autocomplete */}
              <div style={{ display: 'none' }}>
                <input type="text" name="hidden-name" autoComplete="username" />
                <input type="password" name="hidden-password" autoComplete="current-password" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* First row: Full Name (left) and Phone (right) */}
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium">{t('borrowers.fullName')}</Label>
                  <Input 
                    id="fullName" 
                    placeholder={t('borrowers.fullName')}
                    value={newBorrowerData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    autoComplete="nope"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    name={`fullName-${Math.random().toString(36).substr(2, 9)}`}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">{t('borrowers.phoneNumber')}</Label>
                  <Input 
                    id="phone" 
                    placeholder={t('borrowers.phoneNumber')}
                    value={newBorrowerData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    autoComplete="nope"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    name={`phone-${Math.random().toString(36).substr(2, 9)}`}
                  />
                </div>
                
                {/* Username and Password */}
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium">{t('login.username')}</Label>
                  <Input 
                    id="username" 
                    placeholder={t('login.username')}
                    value={newBorrowerData.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                    autoComplete="nope"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    name={`username-${Math.random().toString(36).substr(2, 9)}`}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">{t('login.password')}</Label>
                  <Input 
                    id="password" 
                    type="password"
                    placeholder={t('login.password')}
                    value={newBorrowerData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    autoComplete="new-password"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    name={`password-${Math.random().toString(36).substr(2, 9)}`}
                  />
                </div>
                
                {/* Second row: Address (left) and ID Proof with Referrer (right) */}
                <div className="space-y-2 h-full">
                  <Label htmlFor="address" className="text-sm font-medium">{t('borrowers.address')}</Label>
                  <Textarea 
                    id="address" 
                    placeholder={t('borrowers.address')}
                    value={newBorrowerData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    rows={6}
                    className="h-[calc(100%-2rem)]"
                    autoComplete="nope"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    name={`address-${Math.random().toString(36).substr(2, 9)}`}
                  />
                </div>
                <div className="space-y-4">
                  {/* ID Proof upload */}
                  <div className="space-y-2">
                    <Label htmlFor="idProof" className="text-sm font-medium">{t('borrowers.idProof')}</Label>
                    <div className="flex items-center space-x-2">
                      <Input 
                        id="idProof" 
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload("idProof", e)}
                        className="file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs sm:file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 text-xs sm:text-sm"
                      />
                      <Upload className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    </div>
                    <p className="text-xs text-gray-500">{t('borrowers.idProofDesc')}</p>
                  </div>
                  
                  {/* Referrer field - now under ID proof */}
                  <div className="space-y-2 mt-2">
                    <Label htmlFor="referrer" className="text-sm font-medium">{t('borrowers.referrer')}</Label>
                    <Select onValueChange={(value) => handleInputChange("referrer", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('borrowers.selectReferrer')} />
                      </SelectTrigger>
                      <SelectContent>
                        {referrers.map((referrer) => (
                          <SelectItem key={referrer.id} value={referrer.name}>
                            {referrer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">{t('borrowers.referrerDesc')}</p>
                  </div>
                </div>
              </div>
              
              <Button className="w-full mt-6" onClick={handleNextStep} type="button">
                <ArrowRight className="mr-2 h-4 w-4" />
                {t('common.next')}
              </Button>
            </form>
          </TabsContent>
          
          {/* ATM Card Details Tab */}
          <TabsContent value="card">
            <form 
              autoComplete="off" 
              autoCorrect="off" 
              autoCapitalize="off" 
              spellCheck="false"
              onSubmit={(e) => e.preventDefault()}
            >
              {/* Hidden fields to defeat autocomplete */}
              <div style={{ display: 'none' }}>
                <input type="text" name="hidden-name" autoComplete="username" />
                <input type="password" name="hidden-password" autoComplete="current-password" />
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cardNumber" className="text-sm font-medium">{t('borrowers.cardNumber')}</Label>
                  <Input 
                    id="cardNumber" 
                    placeholder="xxxx-xxxx-xxxx-xxxx"
                    value={newBorrowerData.cardNumber}
                    onChange={(e) => handleInputChange("cardNumber", e.target.value)}
                    maxLength={19}
                    autoComplete="nope"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    name={`cardNumber-${Math.random().toString(36).substr(2, 9)}`}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cardName" className="text-sm font-medium">{t('borrowers.cardName')}</Label>
                  <Input 
                    id="cardName" 
                    placeholder={t('borrowers.cardName')}
                    value={newBorrowerData.cardName}
                    onChange={(e) => handleInputChange("cardName", e.target.value)}
                    autoComplete="nope"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    name={`cardName-${Math.random().toString(36).substr(2, 9)}`}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="validTil" className="text-sm font-medium">{t('borrowers.validTill')}</Label>
                    <Input 
                      id="validTil" 
                      placeholder="MM/YY"
                      value={newBorrowerData.validTil}
                      onChange={(e) => handleInputChange("validTil", e.target.value)}
                      maxLength={5}
                      autoComplete="nope"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck="false"
                      name={`validTil-${Math.random().toString(36).substr(2, 9)}`}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv" className="text-sm font-medium">{t('borrowers.cvv')}</Label>
                    <Input 
                      id="cvv" 
                      placeholder="xxx"
                      type="password"
                      value={newBorrowerData.cvv}
                      onChange={(e) => handleInputChange("cvv", e.target.value)}
                      maxLength={3}
                      autoComplete="new-password"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck="false"
                      name={`cvv-${Math.random().toString(36).substr(2, 9)}`}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="atmPin" className="text-sm font-medium">{t('borrowers.atmPin')}</Label>
                    <Input 
                      id="atmPin" 
                      placeholder="xxxx"
                      type="password"
                      value={newBorrowerData.atmPin}
                      onChange={(e) => handleInputChange("atmPin", e.target.value)}
                      maxLength={4}
                      autoComplete="new-password"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck="false"
                      name={`atmPin-${Math.random().toString(36).substr(2, 9)}`}
                    />
                  </div>
                </div>
              </div>
              
              <Button className="w-full mt-6" onClick={handleAddBorrower} type="button">
                {t('borrowers.addBorrower')}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AddBorrowerDialog;
