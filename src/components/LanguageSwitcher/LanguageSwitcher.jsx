import { useTranslation } from 'react-i18next';
import './languageSwitcher.scss';

export const LanguageSwitcher = () => {
  const { t, i18n } = useTranslation();

  const handleChange = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <div className='languageSwitcher'>
      <p className='languageSwitcher__label'>{t('languageSwitcher.text')}</p>

      <div className='languageSwitcher__input'>
        <select
          className='languageSwitcher__select'
          value={i18n.language}
          onChange={handleChange}
        >
          <option value='en'>EN</option>
          <option value='th'>TH</option>
        </select>
      </div>
    </div>
  );
};
