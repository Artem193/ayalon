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
  status,
  onChangeStatus,
  purposeOfVisit,
  onChangePurposeOfVisit,
  program,
  onChangeProgram,
  periodRequestedFrom,
  onChangePeriodRequestedFrom,
  periodRequestedUp,
  onChangePeriodRequestedUp,
  countryOfBirth,
  onChangeCountryOfBirth,
  israelEntryDay,
  onChangeIsraelEntryDay,
  eMail,
  onChangeEMail,
  mobile,
  onChangeMobile,
  anotherPhone,
  onChangeAnotherPhone,
  street,
  onChangeStreet,
  town,
  onChangeTown,
  zipCode,
  onChangeZipCode,
  previousIns,
  onChangePreviousIns,
  insuranceCo,
  onChangeInsuranceCo,
  membershipNo,
  onChangeMembershipNo,
  fromDate,
  onChangeFromDate,
  upToDate,
  onChangeUpToDate,
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
          />
        </label>

        <label className="personalDetails__label">
          {t('personalDetails.passport')}
          <input
            className="personalDetails__input"
            type="text"
            value={passport}
            onChange={(e) => onChangePassport(e.target.value)}
            required
            pattern="^[a-zA-Z0-9]+$"
          />
        </label>

        <fieldset className="personalDetails__label personalDetails__label--radio">
          <legend className='personalDetails__legend'>{t('personalDetails.gender')}</legend>
          <label>
            <input
              type="radio"
              name="gender"
              value="M"
              checked={gender === 'M'}
              onChange={() => onChangeGender('M')}
              required
            /> {t('personalDetails.male')}
          </label>
          <label>
            <input
              type="radio"
              name="gender"
              value="F"
              checked={gender === 'F'}
              onChange={() => onChangeGender('F')}
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

        <fieldset className="personalDetails__label personalDetails__label--radio">
          <legend className='personalDetails__legend'>{t('personalDetails.status')}</legend>
          <label>
            <input
              className="personalDetails__input--radio"
              type="radio"
              name="status"
              value="new"
              checked={status === 'new'}
              onChange={() => onChangeStatus('new')}
              required
            /> {t('personalDetails.new')}
          </label>

          <label>
            <input
              className="personalDetails__input--radio"
              type="radio"
              name="status"
              value="renewal"
              checked={status === 'renewal'}
              onChange={() => onChangeStatus('renewal')}
              required
            /> {t('personalDetails.renewal')}
          </label>
        </fieldset>

        <fieldset className="personalDetails__label personalDetails__label--radio">
          <legend className='personalDetails__legend'>{t('personalDetails.purposeOfVisit')}</legend>
          <label>
            <input
              className="personalDetails__input--radio"
              type="radio"
              name="purposeOfVisit"
              value="nursing"
              checked={purposeOfVisit === 'nursing'}
              onChange={() => onChangePurposeOfVisit('nursing')}
              required
            /> {t('personalDetails.nursing')}
          </label>

          <label>
            <input
              className="personalDetails__input--radio"
              type="radio"
              name="purposeOfVisit"
              value="agriculture"
              checked={purposeOfVisit === 'agriculture'}
              onChange={() => onChangePurposeOfVisit('agriculture')}
              required
            /> {t('personalDetails.agriculture')}
          </label>

          <label>
            <input
              className="personalDetails__input--radio"
              type="radio"
              name="purposeOfVisit"
              value="construction"
              checked={purposeOfVisit === 'construction'}
              onChange={() => onChangePurposeOfVisit('construction')}
              required
            /> {t('personalDetails.construction')}
          </label>

          <label>
            <input
              className="personalDetails__input--radio"
              type="radio"
              name="purposeOfVisit"
              value="industry"
              checked={purposeOfVisit === 'industry'}
              onChange={() => onChangePurposeOfVisit('industry')}
              required
            /> {t('personalDetails.industry')}
          </label>

          <label>
            <input
              className="personalDetails__input--radio"
              type="radio"
              name="purposeOfVisit"
              value="other"
              checked={purposeOfVisit === 'other'}
              onChange={() => onChangePurposeOfVisit('other')}
              required
            /> {t('personalDetails.other')}
          </label>
        </fieldset>

        <fieldset className="personalDetails__label personalDetails__label--radio">
          <legend className='personalDetails__legend'>{t('personalDetails.program')}</legend>
          <label>
            <input
              className="personalDetails__input--radio"
              type="radio"
              name="program"
              value="foreignWorker"
              checked={program === 'foreignWorker'}
              onChange={() => onChangeProgram('foreignWorker')}
              required
            /> {t('personalDetails.foreignWorker')}
          </label>

          <label>
            <input
              className="personalDetails__input--radio"
              type="radio"
              name="program"
              value="touristMedical"
              checked={program === 'touristMedical'}
              onChange={() => onChangeProgram('touristMedical')}
              required
            /> {t('personalDetails.touristMedical')}
          </label>
        </fieldset>

        <label className="personalDetails__label">
          {t('personalDetails.periodRequested')}
        </label>

        <label className="personalDetails__label">
          {t('personalDetails.periodRequestedFrom')}
          <input
            className="personalDetails__input"
            type="date"
            value={periodRequestedFrom}
            onChange={(e) => onChangePeriodRequestedFrom(e.target.value)}
            required
          />
        </label>

        <label className="personalDetails__label">
          {t('personalDetails.periodRequestedUp')}
          <input
            className="personalDetails__input"
            type="date"
            value={periodRequestedUp}
            onChange={(e) => onChangePeriodRequestedUp(e.target.value)}
            required
          />
        </label>

        <label className="personalDetails__label">
          {t('personalDetails.countryOfBirth')}
          <input
            className="personalDetails__input"
            type="text"
            value={countryOfBirth}
            onChange={(e) => onChangeCountryOfBirth(e.target.value)}
            required
          />
        </label>

        <label className="personalDetails__label">
          {t('personalDetails.israelEntryDay')}
          <input
            className="personalDetails__input"
            type="date"
            value={israelEntryDay}
            onChange={(e) => onChangeIsraelEntryDay(e.target.value)}
            required
          />
        </label>

        <label className="personalDetails__label">
          {t('personalDetails.eMail')}
          <input
            className="personalDetails__input"
            type="text"
            value={eMail}
            onChange={(e) => onChangeEMail(e.target.value)}
            required
          />
        </label>

        <label className="personalDetails__label">
          {t('personalDetails.mobile')}
          <input
            className="personalDetails__input"
            type="text"
            value={mobile}
            onChange={(e) => onChangeMobile(e.target.value)}
            required
          />
        </label>

        <label className="personalDetails__label">
          {t('personalDetails.anotherPhone')}
          <input
            className="personalDetails__input"
            type="text"
            value={anotherPhone}
            onChange={(e) => onChangeAnotherPhone(e.target.value)}
            required
          />
        </label>

        <label className="personalDetails__label">
          {t('personalDetails.address')}
        </label>

        <label className="personalDetails__label">
          {t('personalDetails.street')}
          <input
            className="personalDetails__input"
            type="text"
            value={street}
            onChange={(e) => onChangeStreet(e.target.value)}
            required
          />
        </label>

        <label className="personalDetails__label">
          {t('personalDetails.town')}
          <input
            className="personalDetails__input"
            type="text"
            value={town}
            onChange={(e) => onChangeTown(e.target.value)}
            required
          />
        </label>

        <label className="personalDetails__label">
          {t('personalDetails.zipCode')}
          <input
            className="personalDetails__input"
            type="text"
            value={zipCode}
            onChange={(e) => onChangeZipCode(e.target.value)}
            required
          />
        </label>

        <fieldset className="personalDetails__label personalDetails__label--radio">
          <legend className='personalDetails__legend'>{t('personalDetails.previousIns')}</legend>
          <label>
            <input
              className="personalDetails__input--radio"
              type="radio"
              name="previousIns"
              value="yes"
              checked={previousIns === 'yes'}
              onChange={() => onChangePreviousIns('yes')}
              required
            /> {t('personalDetails.yes')}
          </label>

          <label>
            <input
              className="personalDetails__input--radio"
              type="radio"
              name="previousIns"
              value="no"
              checked={previousIns === 'no'}
              onChange={() => onChangePreviousIns('no')}
              required
            /> {t('personalDetails.no')}
          </label>
        </fieldset>

        <label className="personalDetails__label">
          {t('personalDetails.insuranceCo')}
          <input
            className="personalDetails__input"
            type="text"
            value={insuranceCo}
            onChange={(e) => onChangeInsuranceCo(e.target.value)}
          />
        </label>

        <label className="personalDetails__label">
          {t('personalDetails.membershipNo')}
          <input
            className="personalDetails__input"
            type="text"
            value={membershipNo}
            onChange={(e) => onChangeMembershipNo(e.target.value)}
          />
        </label>

        <label className="personalDetails__label">
          {t('personalDetails.fromDate')}
          <input
            className="personalDetails__input"
            type="date"
            value={fromDate}
            onChange={(e) => onChangeFromDate(e.target.value)}
          />
        </label>

        <label className="personalDetails__label">
          {t('personalDetails.upToDate')}
          <input
            className="personalDetails__input"
            type="date"
            value={upToDate}
            onChange={(e) => onChangeUpToDate(e.target.value)}
          />
        </label>
      </div>
    </div>
  );
};
