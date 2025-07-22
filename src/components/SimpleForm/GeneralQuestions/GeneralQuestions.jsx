
import { useTranslation } from 'react-i18next';
import './generalQuestions.scss';

export const GeneralQuestions = ({ answers, onChange, answerDescription, onChangeAnswerDescription, }) => {
  const { t } = useTranslation();

  // массив ключей вопроса
  const questionKeys = Array.from({ length: 19 }, (_, i) => `question${i + 1}`);
  const questionKeys2 = Array.from({ length: 15 }, (_, i) => `question${i + 20}`);

  return (
    <>
      <div className='generalQuestions'>
        <p className='generalQuestions__text'>{t('generalQuestions.text')}</p>

        <div className='generalQuestions__inputs'>
          {questionKeys.map((key) => {
            const isModified = ['question16', 'question17', 'question18'].includes(key);
            return (
              <div
                className={`generalQuestions__input${isModified ? ' generalQuestions__input--mod' : ''}`}
                key={key}
              >
                <legend
                  className='generalQuestions__legend'
                  dangerouslySetInnerHTML={{ __html: t(`generalQuestions.${key}`) }}
                ></legend>
                <label>
                  <input
                    type='radio'
                    name={key}
                    value={`${key}Yes`}
                    checked={answers[key] === `${key}Yes`}
                    onChange={() => onChange(key, `${key}Yes`)}
                    required
                    className='generalQuestions__input'
                  />
                  {t('generalQuestions.yes')}
                </label>
                <label>
                  <input
                    type='radio'
                    name={key}
                    value={`${key}No`}
                    checked={answers[key] === `${key}No`}
                    onChange={() => onChange(key, `${key}No`)}
                  />
                  {t('generalQuestions.no')}
                </label>
              </div>
            );
          })}
        </div>
      </div>

      <div className='generalQuestions'>
        <p className='generalQuestions__text'>{t('generalQuestions.text2')}</p>

        <div className='generalQuestions__inputs'>
          {questionKeys2.map((key) => {
            const isModified = ['question16', 'question17', 'question18'].includes(key);
            return (
              <div
                className={`generalQuestions__input${isModified ? ' generalQuestions__input--mod' : ''}`}
                key={key}
              >
                <legend
                  className='generalQuestions__legend'
                  dangerouslySetInnerHTML={{ __html: t(`generalQuestions.${key}`) }}
                ></legend>
                <label>
                  <input
                    type='radio'
                    name={key}
                    value={`${key}Yes`}
                    checked={answers[key] === `${key}Yes`}
                    onChange={() => onChange(key, `${key}Yes`)}
                    required
                    className='generalQuestions__input'
                  />
                  {t('generalQuestions.yes')}
                </label>
                <label>
                  <input
                    type='radio'
                    name={key}
                    value={`${key}No`}
                    checked={answers[key] === `${key}No`}
                    onChange={() => onChange(key, `${key}No`)}
                  />
                  {t('generalQuestions.no')}
                </label>
              </div>
            );
          })}
        </div>
      </div>

      <div className='generalQuestions'>
        <p className='generalQuestions__text'>{t('generalQuestions.text3')}</p>
        <textarea
          className='generalQuestions__answerDescription'
          value={answerDescription}
          onChange={(e) => onChangeAnswerDescription(e.target.value)}
        />
      </div>
    </>
  );
};
