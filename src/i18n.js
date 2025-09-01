import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { languages } from './languages/languages.js'

const resources = {
  en: languages.en,
  cn: languages.cn,
  th: languages.th,
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    debug: true,
    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: false,
    },
  });

export default i18n;
