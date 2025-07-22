import { useTranslation } from 'react-i18next';

import './personalDetails.scss';

export const PersonalDetails = ({
  surname,
  onChangeSurname,
  firstName,
  onChangeFirstName,
  passport,
  onChangePassport,
  gender,
  onChangeGender,
  dateOfBirth,
  onChanDateOfBirth,
  weight,
  onChanWeight,
  height,
  onChanHeight,
}) => {
  const { t } = useTranslation();

  return (
    <div className="personalDetails">
      <p className='personalDetails__text'>{t('personalDetails.text')}</p>
      <div className='personalDetails__inputs'>
        <label className="personalDetails__label">
          {t('personalDetails.surname')}
          <input
            className="personalDetails__input"
            type="text"
            value={surname}
            onChange={(e) => onChangeSurname(e.target.value)}
            required
            pattern="^[A-Za-zА-Яа-яЁёЇїІіЄєҐґ]{2,}$"
          />
        </label>

        <label className="personalDetails__label">
          {t('personalDetails.firstName')}
          <input
            className="personalDetails__input"
            type="text"
            value={firstName}
            onChange={(e) => onChangeFirstName(e.target.value)}
            required
            pattern="^[A-Za-zА-Яа-яЁёЇїІіЄєҐґ]{2,}$"
          />
        </label>

        <label className="personalDetails__label">
          {t('personalDetails.passport')}
          <input
            className="personalDetails__input"
            type="number"
            value={passport}
            onChange={(e) => onChangePassport(e.target.value)}
            required
            pattern="^\d$"
          />
        </label>

        <fieldset className="personalDetails__label personalDetails__label--radio">
          <legend className='personalDetails__legend'>{t('personalDetails.gender')}</legend>
          <label>
            <input
              type="radio"
              name="gender"
              value="M"
              checked={gender === t('personalDetails.male')}
              onChange={() => onChangeGender(t('personalDetails.male'))}
              required
            /> {t('personalDetails.male')}
          </label>
          <label>
            <input
              type="radio"
              name="gender"
              value="F"
              checked={gender === t('personalDetails.female')}
              onChange={() => onChangeGender(t('personalDetails.female'))}
              required
            /> {t('personalDetails.female')}
          </label>
        </fieldset>

        <label className="personalDetails__label">
          {t('personalDetails.dateOfBirth')}
          <input
            className="personalDetails__input"
            type="date"
            value={dateOfBirth}
            onChange={(e) => onChanDateOfBirth(e.target.value)}
            required
          />
        </label>

        <label className="personalDetails__label">
          {t('personalDetails.weight')}
          <input
            className="personalDetails__input"
            type="number"
            value={weight}
            onChange={(e) => onChanWeight(e.target.value)}
            required
            pattern="^\d$"
          />
        </label>

        <label className="personalDetails__label">
          {t('personalDetails.height')}
          <input
            className="personalDetails__input"
            type="number"
            value={height}
            onChange={(e) => onChanHeight(e.target.value)}
            required
            pattern="^\d$"
          />
        </label>
      </div>
    </div>
  );
};
