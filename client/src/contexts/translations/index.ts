
import { englishTranslations } from './en';
import { tamilTranslations } from './ta';
import { Language, Translations } from '../types';

export const translations: Record<Language, Translations> = {
  en: englishTranslations,
  ta: tamilTranslations,
};
