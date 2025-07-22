import { useTranslation } from 'react-i18next';

import './infoBlock.scss';

export const InfoBlock = () => {
  const { t } = useTranslation();

  return (
    <div className='infoBlock'>
      <p className='infoBlock__text'>{t('infoBlock.text')}</p>
      <p className='infoBlock__description'>{t('infoBlock.description')}</p>
    </div>
  )
}
