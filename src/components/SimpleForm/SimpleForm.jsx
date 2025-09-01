import { useTranslation } from 'react-i18next';
import { useRef, useState, useEffect } from 'react';
import SignaturePad from 'signature_pad';

import { generatePdf } from '../../pdf/generatePdf';
import { LanguageSwitcher } from '../LanguageSwitcher/LanguageSwitcher';
import { PersonalDetails } from './PersonalDetails/PersonalDetails';
import { InfoBlock } from './InfoBlock/InfoBlock';
import { GeneralQuestions } from './GeneralQuestions/GeneralQuestions';
import { InfoProposer } from './InfoProposer/InfoProposer';

import './simpleForm.scss';

export const SimpleForm = () => {
  const { t } = useTranslation();

  // начальные поля
  const initialData = {
    surname: '',
    firstName: '',
    passport: '',
    gender: '',
    dateOfBirth: '',
    weight: '',
    height: '',
    answerDescription: '',
    date: '',
    nameProposer: '',
  };

  // генерация пустых вопросов
  for (let i = 1; i <= 34; i++) {
    initialData[`question${i}`] = '';
  }

  const [formData, setFormData] = useState(initialData);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const canvasRef = useRef(null);
  const signaturePadRef = useRef(null);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (canvasRef.current) {
      signaturePadRef.current = new SignaturePad(canvasRef.current);
    }
  }, []);

  const handleClearSignature = () => {
    signaturePadRef.current.clear();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (signaturePadRef.current.isEmpty()) {
      alert('Please provide a signature');
      return;
    }

    setIsSending(true);

    try {
      // const signatureDataUrl = signaturePadRef.current.toDataURL();
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      // Очистка с прозрачностью (убирает белый фон)
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Перерисовать подпись поверх прозрачного фона
      signaturePadRef.current._drawStroke = SignaturePad.prototype._drawStroke; // защита от багов
      signaturePadRef.current.fromData(signaturePadRef.current.toData());

      // Затем получить PNG
      const signatureDataUrl = canvasRef.current.toDataURL('image/png');

      const [pdfEn, pdfTh] = await Promise.all([
        generatePdf('en', formData, signatureDataUrl),
        generatePdf('th', formData, signatureDataUrl),
      ]);

      const formDataToSend = new FormData();
      formDataToSend.append('pdfEn', new File([pdfEn], 'form_en.pdf', { type: 'application/pdf' }));
      formDataToSend.append('pdfTh', new File([pdfTh], 'form_th.pdf', { type: 'application/pdf' }));

      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });

      const response = await fetch('/send-pdf', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error('Failed to send PDF');
      }

      alert('Documents sent!');
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to send documents. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <form className="simpleForm" onSubmit={handleSubmit}>
      <h1
        className="simpleForm__title"
        dangerouslySetInnerHTML={{ __html: t('simpleForm.title') }}
      />
      <LanguageSwitcher />

      <PersonalDetails
        surname={formData.surname}
        onChangeSurname={(value) => updateField('surname', value)}
        firstName={formData.firstName}
        onChangeFirstName={(value) => updateField('firstName', value)}
        passport={formData.passport}
        onChangePassport={(value) => updateField('passport', value)}
        gender={formData.gender}
        onChangeGender={(value) => updateField('gender', value)}
        dateOfBirth={formData.dateOfBirth}
        onChanDateOfBirth={(value) => updateField('dateOfBirth', value)}
        weight={formData.weight}
        onChanWeight={(value) => updateField('weight', value)}
        height={formData.height}
        onChanHeight={(value) => updateField('height', value)}
      />

      <div className='simpleForm__extraText'>{t('simpleForm.extraText1')}</div>

      <InfoBlock />

      <GeneralQuestions
        answers={formData}
        onChange={(field, value) => updateField(field, value)}
        answerDescription={formData.answerDescription}
        onChangeAnswerDescription={(value) => updateField('answerDescription', value)}
      />

      <InfoProposer />

      <div className='simpleForm__signatureBlock'>
        <div className='simpleForm__inputs'>
          <label className="simpleForm__label">
            {t('simpleForm.signature')}
          </label>

          <div className="simpleForm__signature">
            <canvas
              ref={canvasRef}
              className='simpleForm__canvas'
              width={150}
              height={75}
            />
          </div>
          <button
            type="button"
            onClick={handleClearSignature}
            className='simpleForm__clear'
          >
            {t('simpleForm.clear')}
          </button>
        </div>

        <input
          className="simpleForm__input simpleForm__date"
          type="date"
          value={formData.date}
          onChange={(e) => updateField('date', e.target.value)}
          required
        />

        <label className='simpleForm__label'>
          {t('simpleForm.nameProposer')}
          <input
            className="simpleForm__input"
            type="text"
            value={formData.nameProposer}
            onChange={(e) => updateField('nameProposer', e.target.value)}
            required
          />
        </label>
      </div>

      {isSending ? (
        <p className="simpleForm__loading">Sending...</p>
      ) : (
        <button type="submit" className='simpleForm__submit'>{t('simpleForm.submit')}</button>
      )}
    </form>
  );
};
