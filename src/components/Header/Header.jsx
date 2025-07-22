import { useTranslation } from 'react-i18next';

import './header.scss';

export const Header = () => {
  const { t } = useTranslation();

  return (
    <div className='header'>
      <img src="/header/logo.svg" alt="logo" className='header__logo'/>
      <p className='header__contacts' dangerouslySetInnerHTML={{ __html: t('header.contacts') }}></p>
    </div>
  )
}
