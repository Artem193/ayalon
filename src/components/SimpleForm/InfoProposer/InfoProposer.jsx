import { useTranslation } from 'react-i18next';

import './infoProposer.scss';

export const InfoProposer = () => {
  const { t } = useTranslation();

  return (
    <>
      <div className='infoProposer'>
        <p className='infoProposer__text'>{t('infoProposer.text1')}</p>
        <li className='infoProposer__list' dangerouslySetInnerHTML={{ __html: t('infoProposer.list1') }}></li>
      </div>

      <div className='infoProposer'>
        <p className='infoProposer__text'>{t('infoProposer.text2')}</p>
        <li className='infoProposer__list' dangerouslySetInnerHTML={{ __html: t('infoProposer.list2') }}></li>
      </div>
    </>
  )
}