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

// 👉 зверни увагу на шляхи: файли реально мають лежати в /public/fonts/
const FONTS = {
  en: ['/fonts/NotoSans-Regular.ttf'],                             // латиниця+кирилиця
  he: ['/fonts/NotoSansHebrew-Regular.ttf'],                       // іврит
  th: [
    '/fonts/NotoSansThai-Regular.ttf',                             // бажаний (≈120–130 KB)
    '/fonts/NotoSansThaiLooped-Regular.ttf',                       // фолбек (≈80–100 KB)
  ],
  cn: ['/fonts/NotoSerifCJKsc-Regular.otf'],                       // китайський (≈24 MB)
};

/* ---------------------------- loaders ---------------------------- */

async function fetchArrayBuffer(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetch ${url} -> ${res.status}`);
  return res.arrayBuffer();
}

// пробуємо кілька шляхів для одного шрифту, поки якийсь не спрацює
async function loadFirstAvailableFont(pdfDoc, urls) {
  let lastErr;
  for (const url of urls) {
    try {
      const bytes = await fetchArrayBuffer(url);
      return await pdfDoc.embedFont(bytes, { subset: true });
    } catch (e) {
      lastErr = e;
      console.warn('Font candidate failed:', url, e?.message || e);
    }
  }
  throw lastErr || new Error('No font candidates worked');
}

/* ---------------------------- text helpers ---------------------------- */

// малюємо 1 символ шрифтом, який його «тягне»
function safeDrawChar(page, ch, x, y, size, fonts) {
  // порядок важливий: дешевші/дрібніші шрифти — спочатку
  const candidates = [fonts.he, fonts.en, fonts.th, fonts.cn];
  for (const f of candidates) {
    if (!f) continue;
    try {
      // якщо glyph відсутній або формат кривий — pdf-lib кине помилку; ловимо й пробуємо наступний
      page.drawText(ch, { x, y, size, font: f });
      return f.widthOfTextAtSize(ch, size);
    } catch (_) { /* try next */ }
  }
  // як зовсім немає гліфа — пропускаємо символ (або намалюй □, якщо хочеш)
  console.warn('Missing glyph for char:', ch, ch.codePointAt(0)?.toString(16));
  return 0;
}

function mixedTextWidth(text, size, fonts) {
  let w = 0;
  const s = String(text ?? '');
  for (const ch of s) {
    const candidates = [fonts.he, fonts.en, fonts.th, fonts.cn];
    let added = false;
    for (const f of candidates) {
      try { w += f.widthOfTextAtSize(ch, size); added = true; break; } catch (_) {}
    }
    if (!added) console.warn('Missing glyph (width):', ch);
  }
  return w;
}

function safeDrawMixedText(page, text, x, y, size, fonts) {
  let cx = x;
  const s = String(text ?? '');
  for (const ch of s) cx += safeDrawChar(page, ch, cx, y, size, fonts);
}

function wrapMixed(text, size, maxWidth, fonts) {
  const s = String(text ?? '');
  const lines = [];
  let line = '';
  for (const ch of s) {
    const test = line + ch;
    if (mixedTextWidth(test, size, fonts) > maxWidth && line.length) {
      lines.push(line);
      line = ch;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/* ---------------------------- main ---------------------------- */

export async function generatePdf(language, formData, signatureDataUrl) {
  const templatePath = TEMPLATES[language] || TEMPLATES.en;
  const templateBytes = await fetchArrayBuffer(templatePath);
  const pdfDoc = await PDFDocument.load(templateBytes);

  pdfDoc.registerFontkit(fontkit);

  // вантажимо шрифти з фолбеками
  const [en, he, th, cn] = await Promise.all([
    loadFirstAvailableFont(pdfDoc, FONTS.en),
    loadFirstAvailableFont(pdfDoc, FONTS.he),
    loadFirstAvailableFont(pdfDoc, FONTS.th),
    loadFirstAvailableFont(pdfDoc, FONTS.cn),
  ]);

  const fonts = { en, he, th, cn };

  const pages = pdfDoc.getPages();
  const styles = pdfStyles[language] || pdfStyles.en;

  // 1) прості текстові поля
  Object.entries(formData).forEach(([field, value]) => {
    if (!value || !styles[field]) return;

    // радіо/довгі поля — нижче
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

  // 1.0) nameProposer у двох місцях
  if (formData.nameProposer) {
    for (const key of ['nameProposer1', 'nameProposer2']) {
      const st = styles[key];
      if (!st) continue;
      const page = pages[st.page ?? 0];
      safeDrawMixedText(page, formData.nameProposer, st.x, st.y, st.size || 9, fonts);
    }
  }

  // 1.1) date у двох місцях
  if (formData.date) {
    for (const key of ['date1', 'date2']) {
      const st = styles[key];
      if (!st) continue;
      const page = pages[st.page ?? 0];
      safeDrawMixedText(page, formData.date, st.x, st.y, st.size || 9, fonts);
    }
  }

  // 1.2) довге поле з переносами
  if (formData.answerDescription && styles.answerDescription) {
    const st = styles.answerDescription;
    const page = pages[st.page ?? 0];
    const size = st.size || 9;
    const lineHeight = st.lineHeight || 14;
    const lines = wrapMixed(formData.answerDescription, size, st.width, fonts);
    lines.forEach((line, i) => {
      safeDrawMixedText(page, line, st.x, st.y - i * lineHeight, size, fonts);
    });
  }

  // 2) gender
  if (formData.gender) {
    const key = formData.gender === 'M' ? 'genderMLine' : 'genderFLine';
    const st = styles[key];
    if (st) {
      const page = pages[st.page ?? 0];
      page.drawRectangle({
        x: st.x, y: st.y,
        width: st.width ?? 12, height: st.height ?? 1,
        color: rgb(0, 0, 0), opacity: 1,
      });
    }
  }

  // 3) X для Yes/No
  for (let i = 1; i <= 34; i++) {
    const k = `question${i}`;
    const a = formData[k];
    if (!a) continue;
    const yes = styles[`${k}Yes`];
    const no  = styles[`${k}No`];
    const pageOf = (c) => pages[c?.page ?? 0];

    if (a === `${k}Yes` && yes) pageOf(yes).drawText('X', { x: yes.x, y: yes.y, size: 12, font: fonts.en });
    else if (a === `${k}No` && no) pageOf(no).drawText('X',  { x: no.x,  y: no.y,  size: 12, font: fonts.en });
  }

  // 4) підпис
  if (signatureDataUrl) {
    const sigBytes = await fetchArrayBuffer(signatureDataUrl);
    const sig = await pdfDoc.embedPng(sigBytes);
    for (const key of ['signature1', 'signature2', 'signature3']) {
      const st = styles[key];
      if (!st) continue;
      const page = pages[st.page ?? 0];
      page.drawImage(sig, { x: st.x, y: st.y, width: st.width, height: st.height, opacity: 1 });
    }
  }

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
}
