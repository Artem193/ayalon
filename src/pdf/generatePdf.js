import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { pdfStyles } from './pdfStyles';

const TEMPLATES = {
  en: '/pdf-templates/ayalon_en.pdf',
  th: '/pdf-templates/ayalon_th.pdf',
  cn: '/pdf-templates/ayalon_cn.pdf',
};

const FONTS = {
  en: '/fonts/NotoSans-Regular.ttf',
  th: '/fonts/NotoSansThai-Regular.ttf',
  cn: '/fonts/NotoSerifCJKsc-Regular.otf',
};


function wrapText(text, font, size, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  for (let word of words) {
    const testLine = currentLine ? currentLine + ' ' + word : word;
    const testWidth = font.widthOfTextAtSize(testLine, size);

    if (testWidth > maxWidth && currentLine !== '') {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

function wrapTextCJK(text, font, size, maxWidth) {
  const str = String(text);
  const lines = [];
  let line = '';
  for (const ch of str) {
    const test = line + ch;
    if (font.widthOfTextAtSize(test, size) > maxWidth && line) {
      lines.push(line);
      line = ch;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export async function generatePdf(language, formData, signatureDataUrl) {
  const templatePath = TEMPLATES[language] || TEMPLATES.en;

  const templateBytes = await fetch(templatePath).then((res) => res.arrayBuffer());
  const pdfDoc = await PDFDocument.load(templateBytes);

  pdfDoc.registerFontkit(fontkit);
  const fontUrl = FONTS[language] || FONTS.en;
  const fontBytes = await fetch(fontUrl).then((res) => res.arrayBuffer());
  const customFont = await pdfDoc.embedFont(fontBytes, { subset: true });

  const pages = pdfDoc.getPages();
  const styles = pdfStyles[language] || pdfStyles.en;

  // 1. Вставка текстовых полей (исключая checkbox-вопросы)
  Object.entries(formData).forEach(([field, value]) => {
    if (!value || !styles[field]) return;

    // Пропускаем радио-кнопки (обрабатываются отдельно)
    if (
      (field.startsWith('question') && typeof value === 'string' && value.startsWith('question')) ||
      field === 'answerDescription' ||
      field === 'nameProposer' ||
      field === 'date'
    ) {
      return;
    }

    const style = styles[field];
    const page = pages[style.page ?? 0]; // по умолчанию первая страница

    page.drawText(value, {
      x: style.x,
      y: style.y,
      size: style.size || 9,
      font: customFont,
    });
  });

  // 1.0 nameProposer — отрисовка в двух местах
  if (formData.nameProposer) {
    const namePositions = ['nameProposer1', 'nameProposer2']; // ← ключи в pdfStyles

    namePositions.forEach((key) => {
      const style = styles[key];
      if (!style) return;

      const page = pages[style.page ?? 0];
      page.drawText(formData.nameProposer, {
        x: style.x,
        y: style.y,
        size: style.size || 9,
        font: customFont,
      });
    });
  }

  if (formData.passport) {
    const passportPositions = ['passport1', 'passport2']; // ← ключи в pdfStyles

    passportPositions.forEach((key) => {
      const style = styles[key];
      if (!style) return;

      const page = pages[style.page ?? 0];
      page.drawText(formData.passport, {
        x: style.x,
        y: style.y,
        size: style.size || 9,
        font: customFont,
      });
    });
  }

  if (formData.date) {
    const namePositions = ['date1', 'date2']; // ← ключи в pdfStyles

    namePositions.forEach((key) => {
      const style = styles[key];
      if (!style) return;

      const page = pages[style.page ?? 0];
      page.drawText(formData.date, {
        x: style.x,
        y: style.y,
        size: style.size || 9,
        font: customFont,
      });
    });
  }

  // 1.1 answerDescription с переносом строк
  if (formData.answerDescription && styles.answerDescription) {
    const { x, y, width, page: pageIndex = 0 } = styles.answerDescription;
    const lines = (language === 'cn')
      ? wrapTextCJK(formData.answerDescription, customFont, 9, width)
      : wrapText(formData.answerDescription, customFont, 9, width);
    const page = pages[pageIndex];

    lines.forEach((line, index) => {
      page.drawText(line, {
        x,
        y: y - index * 14, // вертикальный отступ между строками
        size: 9,
        font: customFont,
      });
    });
  }

  if (formData.gender) {
    const key = formData.gender === 'M' ? 'genderMLine' : 'genderFLine';
    const st = styles[key];
    if (st) {
      const page = pages[st.page ?? 0];
      page.drawRectangle({
        x: st.x,
        y: st.y,
        width: st.width ?? 12,
        height: st.height ?? 1,
        color: rgb(0, 0, 0),
        opacity: 1,
      });
    }
  }

  // 2. Отрисовка крестиков для 16 вопросов
  for (let i = 1; i <= 34; i++) {
    const fieldKey = `question${i}`;
    const answer = formData[fieldKey];

    if (!answer) continue;

    const yesCoords = styles[`${fieldKey}Yes`];
    const noCoords = styles[`${fieldKey}No`];

    const getPage = (coords) => pages[coords?.page ?? 0];

    if (answer === `${fieldKey}Yes` && yesCoords) {
      getPage(yesCoords).drawText('X', {
        x: yesCoords.x,
        y: yesCoords.y,
        size: 12,
        font: customFont,
      });
    } else if (answer === `${fieldKey}No` && noCoords) {
      getPage(noCoords).drawText('X', {
        x: noCoords.x,
        y: noCoords.y,
        size: 12,
        font: customFont,
      });
    }
  }

  // 3. Подпись в нескольких местах
  const signatureBytes = await fetch(signatureDataUrl).then((res) => res.arrayBuffer());
  const signatureImage = await pdfDoc.embedPng(signatureBytes);

  // Нарисовать подпись в signature1..signature4
  ['signature1', 'signature2', 'signature3'].forEach((key) => {
    const style = styles[key];
    if (!style) return;
    const page = pages[style.page ?? 0];

    page.drawImage(signatureImage, {
      x: style.x,
      y: style.y,
      width: style.width,
      height: style.height,
      opacity: 1,
    });
  });

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
}
