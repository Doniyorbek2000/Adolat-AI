import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import uz from './uz.json';
import ru from './ru.json';
import en from './en.json';

i18n.use(initReactI18next).init({
  resources: {
    uz: { translation: uz },
    ru: { translation: ru },
    en: { translation: en },
  },
  lng: 'uz',
  fallbackLng: 'uz',
  interpolation: { escapeValue: false },
});

export const changeLanguage = (lang: 'uz' | 'ru' | 'en') => i18n.changeLanguage(lang);
export default i18n;
