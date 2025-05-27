import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "../contexts/LanguageContext";

const LoanForm = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    borrowerName: "",
    borrowerPhone: "",
    borrowerEmail: "",
    borrowerAddress: "",
    loanAmount: "",
    interestRate: "",
    loanType: "interest-only",
    startDate: "",
    tenure: "10",
    transactionMode: "",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Integrate with MERN backend to create loan
    console.log("New loan data:", formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{t('loan.createNew')}</CardTitle>
          <CardDescription>
            {t('loan.createDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Borrower Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">{t('loan.borrowerInfo')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="borrowerName">{t('borrowers.fullName')}</Label>
                  <Input
                    id="borrowerName"
                    value={formData.borrowerName}
                    onChange={(e) => handleChange("borrowerName", e.target.value)}
                    required
                    autoComplete="off"
                  />
                </div>
                <div>
                  <Label htmlFor="borrowerPhone">{t('borrowers.phoneNumber')}</Label>
                  <Input
                    id="borrowerPhone"
                    value={formData.borrowerPhone}
                    onChange={(e) => handleChange("borrowerPhone", e.target.value)}
                    required
                    autoComplete="off"
                  />
                </div>
                <div>
                  <Label htmlFor="borrowerEmail">{t('lenders.email')}</Label>
                  <Input
                    id="borrowerEmail"
                    type="email"
                    value={formData.borrowerEmail}
                    onChange={(e) => handleChange("borrowerEmail", e.target.value)}
                    autoComplete="off"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="borrowerAddress">{t('borrowers.address')}</Label>
                <Textarea
                  id="borrowerAddress"
                  value={formData.borrowerAddress}
                  onChange={(e) => handleChange("borrowerAddress", e.target.value)}
                  rows={3}
                  autoComplete="off"
                />
              </div>
            </div>

            {/* Loan Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">{t('loan.loanDetails')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="loanAmount">{t('loan.loanAmount')}</Label>
                  <Input
                    id="loanAmount"
                    type="number"
                    value={formData.loanAmount}
                    onChange={(e) => handleChange("loanAmount", e.target.value)}
                    required
                    autoComplete="off"
                  />
                </div>
                <div>
                  <Label htmlFor="startDate">{t('loan.startDate')}</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleChange("startDate", e.target.value)}
                    required
                    autoComplete="off"
                  />
                </div>
              </div>

              <div>
                <Label>{t('loan.loanType')}</Label>
                <RadioGroup
                  value={formData.loanType}
                  onValueChange={(value) => handleChange("loanType", value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="interest-only" id="interest-only" />
                    <Label htmlFor="interest-only">{t('loan.interestOnly')}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="emi" id="emi" />
                    <Label htmlFor="emi">{t('loan.emi')}</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="interestRate">{t('loan.interestRate')}</Label>
                  <Input
                    id="interestRate"
                    type="number"
                    step="0.01"
                    value={formData.loanType === "interest-only" ? "5" : "3"}
                    onChange={(e) => handleChange("interestRate", e.target.value)}
                    disabled
                    autoComplete="off"
                  />
                </div>
                {formData.loanType === "emi" && (
                  <div>
                    <Label htmlFor="tenure">{t('loan.tenure')}</Label>
                    <Input
                      id="tenure"
                      type="number"
                      value="10"
                      disabled
                      autoComplete="off"
                    />
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="transactionMode">{t('loan.transactionMode')}</Label>
                <Select onValueChange={(value) => handleChange("transactionMode", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('loan.selectTransactionMode')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">{t('loan.cash')}</SelectItem>
                    <SelectItem value="bank-transfer">{t('loan.bankTransfer')}</SelectItem>
                    <SelectItem value="cheque">{t('loan.cheque')}</SelectItem>
                    <SelectItem value="online">{t('loan.online')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">{t('loan.notes')}</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  rows={3}
                  placeholder={t('loan.notesPlaceholder')}
                  autoComplete="off"
                />
              </div>
            </div>

            <Button type="submit" className="w-full">
              {t('loan.createLoan')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoanForm;
