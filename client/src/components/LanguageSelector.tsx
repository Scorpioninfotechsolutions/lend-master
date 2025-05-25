
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useLanguage } from "../contexts/LanguageContext";

const LanguageSelector = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="space-y-2">
      <Label htmlFor="language">{t('settings.language')}</Label>
      <Select value={language} onValueChange={(value: 'en' | 'ta') => setLanguage(value)}>
        <SelectTrigger>
          <SelectValue placeholder={t('settings.selectLanguage')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">{t('settings.english')}</SelectItem>
          <SelectItem value="ta">{t('settings.tamil')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSelector;
