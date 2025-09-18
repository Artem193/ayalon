import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { pdfStyles } from './pdfStyles';

const TEMPLATES = {
  en: '/pdf-templates/ayalon_en.pdf',
  th: '/pdf-templates/ayalon_th.pdf',
  cn: '/pdf-templates/ayalon_cn.pdf',
};

const FONTS = {
  en: '/fonts/NotoSans-Regular.ttf',          // Latin + Cyrillic
  th: '/fonts/NotoSansThai-Regular.ttf',      // Thai
  cn: '/fonts/NotoSerifCJKsc-Regular.otf',    // Chinese
  he: '/fonts/NotoSansHebrew-Regular.ttf',    // Hebrew
};

// перевірка, чи містить рядок івритські символи
function containsHebrew(text) {
  return /[\u0590-\u05FF]/.test(text);
}

// перенос для латиниці/тайської
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

// перенос для китайської (CJK)
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

  // завантажуємо основний + іврит
  const [mainFontBytes, hebrewFontBytes] = await Promise.all([
    fetch(FONTS[language] || FONTS.en).then((r) => r.arrayBuffer()),
    fetch(FONTS.he).then((r) => r.arrayBuffer()),
  ]);

  const mainFont = await pdfDoc.embedFont(mainFontBytes, { subset: true });
  const hebrewFont = await pdfDoc.embedFont(hebrewFontBytes, { subset: true });

  const fonts = { main: mainFont, he: hebrewFont };

  const pages = pdfDoc.getPages();
  const styles = pdfStyles[language] || pdfStyles.en;

  // універсальна функція малювання
  function drawSmartText(page, text, x, y, size = 9) {
    const font = containsHebrew(text) ? fonts.he : fonts.main;
    page.drawText(text, { x, y, size, font });
  }

  // 1. текстові поля
  Object.entries(formData).forEach(([field, value]) => {
    if (!value || !styles[field]) return;
    if (
      (field.startsWith('question') && typeof value === 'string' && value.startsWith('question')) ||
      field === 'answerDescription' ||
      field === 'nameProposer' ||
      field === 'date'
    ) return;

    const st = styles[field];
    const page = pages[st.page ?? 0];
    drawSmartText(page, value, st.x, st.y, st.size || 9);
  });

  // 1.0 nameProposer у двох місцях
  if (formData.nameProposer) {
    ['nameProposer1', 'nameProposer2'].forEach((key) => {
      const st = styles[key];
      if (!st) return;
      const page = pages[st.page ?? 0];
      drawSmartText(page, formData.nameProposer, st.x, st.y, st.size || 9);
    });
  }

  // 1.1 date у двох місцях
  if (formData.date) {
    ['date1', 'date2'].forEach((key) => {
      const st = styles[key];
      if (!st) return;
      const page = pages[st.page ?? 0];
      drawSmartText(page, formData.date, st.x, st.y, st.size || 9);
    });
  }

  // 1.2 answerDescription з переносами
  if (formData.answerDescription && styles.answerDescription) {
    const { x, y, width, page: pageIndex = 0 } = styles.answerDescription;
    const font = containsHebrew(formData.answerDescription) ? fonts.he : fonts.main;
    const lines = (language === 'cn')
      ? wrapTextCJK(formData.answerDescription, font, 9, width)
      : wrapText(formData.answerDescription, font, 9, width);
    const page = pages[pageIndex];
    lines.forEach((line, idx) => {
      page.drawText(line, {
        x,
        y: y - idx * 14,
        size: 9,
        font,
      });
    });
  }

  // 2. gender
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

  // 3. Yes/No питання
  for (let i = 1; i <= 34; i++) {
    const fieldKey = `question${i}`;
    const answer = formData[fieldKey];
    if (!answer) continue;

    const yes = styles[`${fieldKey}Yes`];
    const no = styles[`${fieldKey}No`];
    const getPage = (coords) => pages[coords?.page ?? 0];

    if (answer === `${fieldKey}Yes` && yes) {
      getPage(yes).drawText('X', { x: yes.x, y: yes.y, size: 12, font: fonts.main });
    } else if (answer === `${fieldKey}No` && no) {
      getPage(no).drawText('X', { x: no.x, y: no.y, size: 12, font: fonts.main });
    }
  }

  // 4. підпис
  const sigBytes = await fetch(signatureDataUrl).then((res) => res.arrayBuffer());
  const sigImage = await pdfDoc.embedPng(sigBytes);
  ['signature1', 'signature2', 'signature3'].forEach((key) => {
    const st = styles[key];
    if (!st) return;
    const page = pages[st.page ?? 0];
    page.drawImage(sigImage, {
      x: st.x,
      y: st.y,
      width: st.width,
      height: st.height,
      opacity: 1,
    });
  });

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
}
