// import { PDFDocument, rgb } from 'pdf-lib';
// import fontkit from '@pdf-lib/fontkit';
// import { pdfStyles } from './pdfStyles';

// const TEMPLATES = {
//   en: '/pdf-templates/ayalon_en.pdf',
//   th: '/pdf-templates/ayalon_th.pdf',
//   cn: '/pdf-templates/ayalon_cn.pdf',
// };

// const FONTS = {
//   en: '/fonts/NotoSans-Regular.ttf',
//   th: '/fonts/NotoSansThai-Regular.ttf',
//   cn: '/fonts/NotoSerifCJKsc-Regular.otf',
// };


// function wrapText(text, font, size, maxWidth) {
//   const words = text.split(' ');
//   const lines = [];
//   let currentLine = '';

//   for (let word of words) {
//     const testLine = currentLine ? currentLine + ' ' + word : word;
//     const testWidth = font.widthOfTextAtSize(testLine, size);

//     if (testWidth > maxWidth && currentLine !== '') {
//       lines.push(currentLine);
//       currentLine = word;
//     } else {
//       currentLine = testLine;
//     }
//   }

//   if (currentLine) {
//     lines.push(currentLine);
//   }

//   return lines;
// }

// function wrapTextCJK(text, font, size, maxWidth) {
//   const str = String(text);
//   const lines = [];
//   let line = '';
//   for (const ch of str) {
//     const test = line + ch;
//     if (font.widthOfTextAtSize(test, size) > maxWidth && line) {
//       lines.push(line);
//       line = ch;
//     } else {
//       line = test;
//     }
//   }
//   if (line) lines.push(line);
//   return lines;
// }

// export async function generatePdf(language, formData, signatureDataUrl) {
//   const templatePath = TEMPLATES[language] || TEMPLATES.en;

//   const templateBytes = await fetch(templatePath).then((res) => res.arrayBuffer());
//   const pdfDoc = await PDFDocument.load(templateBytes);

//   pdfDoc.registerFontkit(fontkit);
//   const fontUrl = FONTS[language] || FONTS.en;
//   const fontBytes = await fetch(fontUrl).then((res) => res.arrayBuffer());
//   const customFont = await pdfDoc.embedFont(fontBytes, { subset: true });

//   const pages = pdfDoc.getPages();
//   const styles = pdfStyles[language] || pdfStyles.en;

//   // 1. Вставка текстовых полей (исключая checkbox-вопросы)
//   Object.entries(formData).forEach(([field, value]) => {
//     if (!value || !styles[field]) return;

//     // Пропускаем радио-кнопки (обрабатываются отдельно)
//     if (
//       (field.startsWith('question') && typeof value === 'string' && value.startsWith('question')) ||
//       field === 'answerDescription' ||
//       field === 'nameProposer' ||
//       field === 'date'
//     ) {
//       return;
//     }

//     const style = styles[field];
//     const page = pages[style.page ?? 0]; // по умолчанию первая страница

//     page.drawText(value, {
//       x: style.x,
//       y: style.y,
//       size: style.size || 9,
//       font: customFont,
//     });
//   });

//   // 1.0 nameProposer — отрисовка в двух местах
//   if (formData.nameProposer) {
//     const namePositions = ['nameProposer1', 'nameProposer2']; // ← ключи в pdfStyles

//     namePositions.forEach((key) => {
//       const style = styles[key];
//       if (!style) return;

//       const page = pages[style.page ?? 0];
//       page.drawText(formData.nameProposer, {
//         x: style.x,
//         y: style.y,
//         size: style.size || 9,
//         font: customFont,
//       });
//     });
//   }

//   if (formData.date) {
//     const namePositions = ['date1', 'date2']; // ← ключи в pdfStyles

//     namePositions.forEach((key) => {
//       const style = styles[key];
//       if (!style) return;

//       const page = pages[style.page ?? 0];
//       page.drawText(formData.date, {
//         x: style.x,
//         y: style.y,
//         size: style.size || 9,
//         font: customFont,
//       });
//     });
//   }

//   // 1.1 answerDescription с переносом строк
//   if (formData.answerDescription && styles.answerDescription) {
//     const { x, y, width, page: pageIndex = 0 } = styles.answerDescription;
//     const lines = (language === 'cn')
//       ? wrapTextCJK(formData.answerDescription, customFont, 9, width)
//       : wrapText(formData.answerDescription, customFont, 9, width);
//     const page = pages[pageIndex];

//     lines.forEach((line, index) => {
//       page.drawText(line, {
//         x,
//         y: y - index * 14, // вертикальный отступ между строками
//         size: 9,
//         font: customFont,
//       });
//     });
//   }

//   if (formData.gender) {
//     const key = formData.gender === 'M' ? 'genderMLine' : 'genderFLine';
//     const st = styles[key];
//     if (st) {
//       const page = pages[st.page ?? 0];
//       page.drawRectangle({
//         x: st.x,
//         y: st.y,
//         width: st.width ?? 12,
//         height: st.height ?? 1,
//         color: rgb(0, 0, 0),
//         opacity: 1,
//       });
//     }
//   }

//   // 2. Отрисовка крестиков для 16 вопросов
//   for (let i = 1; i <= 34; i++) {
//     const fieldKey = `question${i}`;
//     const answer = formData[fieldKey];

//     if (!answer) continue;

//     const yesCoords = styles[`${fieldKey}Yes`];
//     const noCoords = styles[`${fieldKey}No`];

//     const getPage = (coords) => pages[coords?.page ?? 0];

//     if (answer === `${fieldKey}Yes` && yesCoords) {
//       getPage(yesCoords).drawText('X', {
//         x: yesCoords.x,
//         y: yesCoords.y,
//         size: 12,
//         font: customFont,
//       });
//     } else if (answer === `${fieldKey}No` && noCoords) {
//       getPage(noCoords).drawText('X', {
//         x: noCoords.x,
//         y: noCoords.y,
//         size: 12,
//         font: customFont,
//       });
//     }
//   }

//   // 3. Подпись в нескольких местах
//   const signatureBytes = await fetch(signatureDataUrl).then((res) => res.arrayBuffer());
//   const signatureImage = await pdfDoc.embedPng(signatureBytes);

//   // Нарисовать подпись в signature1..signature4
//   ['signature1', 'signature2', 'signature3'].forEach((key) => {
//     const style = styles[key];
//     if (!style) return;
//     const page = pages[style.page ?? 0];

//     page.drawImage(signatureImage, {
//       x: style.x,
//       y: style.y,
//       width: style.width,
//       height: style.height,
//       opacity: 1,
//     });
//   });

//   const pdfBytes = await pdfDoc.save();
//   return new Blob([pdfBytes], { type: 'application/pdf' });
// }


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
  he: '/fonts/NotoSansHebrew-Regular.ttf',    // Hebrew
  th: '/fonts/NotoSansThai-Regular.ttf',      // Thai
  cn: '/fonts/NotoSerifCJKsc-Regular.otf',    // Chinese
};

/* ---------------------- Font selection with safe fallback ---------------------- */
function fontForCodePoint(code, fonts) {
  // перевіряємо всі шрифти, чи є символ
  for (const key of ['he', 'en', 'th', 'cn']) {
    const font = fonts[key];
    if (font && font.hasGlyphForCodePoint(code)) {
      return font;
    }
  }
  console.warn('❌ Missing glyph for code:', code.toString(16));
  return fonts.en; // дефолт, навіть якщо квадратик
}

/* ----------------------------- Mixed text drawing ----------------------------- */
function safeDrawMixedText(page, text, x, y, size, fonts) {
  let cursorX = x;
  const str = String(text ?? '');

  for (const ch of str) {
    const code = ch.codePointAt(0);
    const font = fontForCodePoint(code, fonts);
    const w = font.widthOfTextAtSize(ch, size);
    page.drawText(ch, { x: cursorX, y, size, font });
    cursorX += w;
  }
  return cursorX;
}

function mixedTextWidth(text, size, fonts) {
  let w = 0;
  for (const ch of String(text ?? '')) {
    const code = ch.codePointAt(0);
    const font = fontForCodePoint(code, fonts);
    w += font.widthOfTextAtSize(ch, size);
  }
  return w;
}

function wrapMixed(text, size, maxWidth, fonts) {
  const s = String(text ?? '');
  const lines = [];
  let line = '';
  for (const ch of s) {
    const next = line + ch;
    if (mixedTextWidth(next, size, fonts) > maxWidth && line.length > 0) {
      lines.push(line);
      line = ch;
    } else {
      line = next;
    }
  }
  if (line.length) lines.push(line);
  return lines;
}

/* ---------------------------------- Main ---------------------------------- */
export async function generatePdf(language, formData, signatureDataUrl) {
  const templatePath = TEMPLATES[language] || TEMPLATES.en;
  const templateBytes = await fetch(templatePath).then((res) => res.arrayBuffer());
  const pdfDoc = await PDFDocument.load(templateBytes);

  pdfDoc.registerFontkit(fontkit);

  // Завантажуємо всі шрифти
  const [enBytes, heBytes, thBytes, cnBytes] = await Promise.all([
    fetch(FONTS.en).then((r) => r.arrayBuffer()),
    fetch(FONTS.he).then((r) => r.arrayBuffer()),
    fetch(FONTS.th).then((r) => r.arrayBuffer()),
    fetch(FONTS.cn).then((r) => r.arrayBuffer()),
  ]);

  const fonts = {
    en: await pdfDoc.embedFont(enBytes, { subset: true }),
    he: await pdfDoc.embedFont(heBytes, { subset: true }),
    th: await pdfDoc.embedFont(thBytes, { subset: true }),
    cn: await pdfDoc.embedFont(cnBytes, { subset: true }),
  };

  const pages = pdfDoc.getPages();
  const styles = pdfStyles[language] || pdfStyles.en;

  // 1. Текстові поля
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
    safeDrawMixedText(page, value, st.x, st.y, st.size || 9, fonts);
  });

  // 1.0 nameProposer у двох місцях
  if (formData.nameProposer) {
    for (const key of ['nameProposer1', 'nameProposer2']) {
      const st = styles[key];
      if (!st) continue;
      const page = pages[st.page ?? 0];
      safeDrawMixedText(page, formData.nameProposer, st.x, st.y, st.size || 9, fonts);
    }
  }

  // 1.1 date у двох місцях
  if (formData.date) {
    for (const key of ['date1', 'date2']) {
      const st = styles[key];
      if (!st) continue;
      const page = pages[st.page ?? 0];
      safeDrawMixedText(page, formData.date, st.x, st.y, st.size || 9, fonts);
    }
  }

  // 1.2 answerDescription
  if (formData.answerDescription && styles.answerDescription) {
    const st = styles.answerDescription;
    const page = pages[st.page ?? 0];
    const size = st.size || 9;
    const lineHeight = st.lineHeight || 14;
    const lines = wrapMixed(formData.answerDescription, size, st.width, fonts);
    lines.forEach((line, idx) => {
      safeDrawMixedText(page, line, st.x, st.y - idx * lineHeight, size, fonts);
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

  // 3. питання Yes/No
  for (let i = 1; i <= 34; i++) {
    const fieldKey = `question${i}`;
    const answer = formData[fieldKey];
    if (!answer) continue;
    const yes = styles[`${fieldKey}Yes`];
    const no = styles[`${fieldKey}No`];
    const getPage = (coords) => pages[coords?.page ?? 0];

    if (answer === `${fieldKey}Yes` && yes) {
      getPage(yes).drawText('X', { x: yes.x, y: yes.y, size: 12, font: fonts.en });
    } else if (answer === `${fieldKey}No` && no) {
      getPage(no).drawText('X', { x: no.x, y: no.y, size: 12, font: fonts.en });
    }
  }

  // 4. підпис
  if (signatureDataUrl) {
    const sigBytes = await fetch(signatureDataUrl).then((res) => res.arrayBuffer());
    const sigImage = await pdfDoc.embedPng(sigBytes);
    for (const key of ['signature1', 'signature2', 'signature3']) {
      const st = styles[key];
      if (!st) continue;
      const page = pages[st.page ?? 0];
      page.drawImage(sigImage, {
        x: st.x,
        y: st.y,
        width: st.width,
        height: st.height,
        opacity: 1,
      });
    }
  }

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
}
