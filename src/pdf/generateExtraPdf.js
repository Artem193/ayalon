// import { PDFDocument } from 'pdf-lib';
// import fontkit from '@pdf-lib/fontkit';
// import { pdfStyles } from './pdfStyles';

// export async function generateExtraPdf(formData) {
//   const templatePath = '/pdf-templates/ayalon_extra.pdf';
//   const fontPath = '/fonts/NotoSans-Regular.ttf';

//   const templateBytes = await fetch(templatePath).then(res => res.arrayBuffer());
//   const fontBytes = await fetch(fontPath).then(res => res.arrayBuffer());

//   const pdfDoc = await PDFDocument.load(templateBytes);
//   pdfDoc.registerFontkit(fontkit);
//   const font = await pdfDoc.embedFont(fontBytes);

//   const page = pdfDoc.getPage(0);
//   const styles = pdfStyles.extra;

//   const inputs = [
//     'periodRequestedFrom',
//     'periodRequestedUp',
//     'passport',
//     'surname',
//     'firstName',
//     'dateOfBirth',
//     'countryOfBirth',
//     'israelEntryDay',
//     'eMail',
//     'mobile',
//     'anotherPhone',
//     'street',
//     'town',
//     'zipCode',
//     'insuranceCo',
//     'membershipNo',
//     'fromDate',
//     'upToDate',
//     'contactName',
//     'contactPhone',
//   ]

//   // 🔲 Вставка status (галочка)
//   if (formData.status === 'new' && styles.statusNew) {
//     page.drawText('X', {
//       x: styles.statusNew.x,
//       y: styles.statusNew.y,
//       size: 12,
//       font,
//     });
//   }

//   if (formData.status === 'renewal' && styles.statusRenewal) {
//     page.drawText('X', {
//       x: styles.statusRenewal.x,
//       y: styles.statusRenewal.y,
//       size: 12,
//       font,
//     });
//   }

//   if (formData.purposeOfVisit === 'nursing' && styles.nursing) {
//     page.drawText('X', {
//       x: styles.nursing.x,
//       y: styles.nursing.y,
//       size: 12,
//       font,
//     });
//   }

//   if (formData.purposeOfVisit === 'agriculture' && styles.agriculture) {
//     page.drawText('X', {
//       x: styles.agriculture.x,
//       y: styles.agriculture.y,
//       size: 12,
//       font,
//     });
//   }

//   if (formData.purposeOfVisit === 'construction' && styles.construction) {
//     page.drawText('X', {
//       x: styles.construction.x,
//       y: styles.construction.y,
//       size: 12,
//       font,
//     });
//   }

//   if (formData.purposeOfVisit === 'industry' && styles.industry) {
//     page.drawText('X', {
//       x: styles.industry.x,
//       y: styles.industry.y,
//       size: 12,
//       font,
//     });
//   }

//   if (formData.purposeOfVisit === 'other' && styles.other) {
//     page.drawText('X', {
//       x: styles.other.x,
//       y: styles.other.y,
//       size: 12,
//       font,
//     });
//   }

//   if (formData.program === 'foreignWorker' && styles.foreignWorker) {
//     page.drawText('X', {
//       x: styles.foreignWorker.x,
//       y: styles.foreignWorker.y,
//       size: 12,
//       font,
//     });
//   }

//   if (formData.program === 'touristMedical' && styles.touristMedical) {
//     page.drawText('X', {
//       x: styles.touristMedical.x,
//       y: styles.touristMedical.y,
//       size: 12,
//       font,
//     });
//   }

//   if (formData.gender === 'M' && styles.M) {
//     page.drawText('X', {
//       x: styles.M.x,
//       y: styles.M.y,
//       size: 12,
//       font,
//     });
//   }

//   if (formData.gender === 'F' && styles.F) {
//     page.drawText('X', {
//       x: styles.F.x,
//       y: styles.F.y,
//       size: 12,
//       font,
//     });
//   }

//   if (formData.previousIns === 'yes' && styles.yes) {
//     page.drawText('X', {
//       x: styles.yes.x,
//       y: styles.yes.y,
//       size: 12,
//       font,
//     });
//   }

//   if (formData.previousIns === 'no' && styles.no) {
//     page.drawText('X', {
//       x: styles.no.x,
//       y: styles.no.y,
//       size: 12,
//       font,
//     });
//   }

//   inputs.forEach((key) => {
//     if (formData[key] && styles[key]) {
//       const entries = Array.isArray(styles[key]) ? styles[key] : [styles[key]];
//       entries.forEach(({ x, y }) => {
//         page.drawText(formData[key], {
//           x,
//           y,
//           size: 10,
//           font,
//         });
//       });
//     }
//   });

//   const pdfBytes = await pdfDoc.save();
//   return new Blob([pdfBytes], { type: 'application/pdf' });
// }

import { PDFDocument } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { pdfStyles } from './pdfStyles';

const FONTS = {
  en: '/fonts/NotoSans-Regular.ttf',       // Latin + Cyrillic
  he: '/fonts/NotoSansHebrew-Regular.ttf', // Hebrew
  th: '/fonts/NotoSansThai-Regular.ttf',   // Thai
  cn: '/fonts/NotoSerifCJKsc-Regular.otf', // Chinese
};

// Намалювати символ у правильному шрифті
function safeDrawChar(page, ch, x, y, size, fonts) {
  const candidates = [fonts.he, fonts.en, fonts.th, fonts.cn];
  for (const f of candidates) {
    try {
      f.encodeText(ch); // перевірка, чи підтримується символ
      page.drawText(ch, { x, y, size, font: f });
      return f.widthOfTextAtSize(ch, size);
    } catch (err) {
      continue;
    }
  }
  return 0;
}

// Намалювати рядок посимвольно
function safeDrawMixedText(page, text, x, y, size, fonts) {
  let cursorX = x;
  for (const ch of String(text ?? '')) {
    const w = safeDrawChar(page, ch, cursorX, y, size, fonts);
    cursorX += w;
  }
}

export async function generateExtraPdf(formData) {
  const templatePath = '/pdf-templates/ayalon_extra.pdf';
  const templateBytes = await fetch(templatePath).then(res => res.arrayBuffer());

  const pdfDoc = await PDFDocument.load(templateBytes);
  pdfDoc.registerFontkit(fontkit);

  // завантажуємо всі шрифти
  const [enBytes, heBytes, thBytes, cnBytes] = await Promise.all([
    fetch(FONTS.en).then(res => res.arrayBuffer()),
    fetch(FONTS.he).then(res => res.arrayBuffer()),
    fetch(FONTS.th).then(res => res.arrayBuffer()),
    fetch(FONTS.cn).then(res => res.arrayBuffer()),
  ]);

  const fonts = {
    en: await pdfDoc.embedFont(enBytes, { subset: true }),
    he: await pdfDoc.embedFont(heBytes, { subset: true }),
    th: await pdfDoc.embedFont(thBytes, { subset: true }),
    cn: await pdfDoc.embedFont(cnBytes, { subset: true }),
  };

  const page = pdfDoc.getPage(0);
  const styles = pdfStyles.extra;

  const inputs = [
    'periodRequestedFrom',
    'periodRequestedUp',
    'passport',
    'surname',
    'firstName',
    'dateOfBirth',
    'countryOfBirth',
    'israelEntryDay',
    'eMail',
    'mobile',
    'anotherPhone',
    'street',
    'town',
    'zipCode',
    'insuranceCo',
    'membershipNo',
    'fromDate',
    'upToDate',
    'contactName',
    'contactPhone',
  ];

  // чекбокси
  const checkboxFields = [
    { key: 'status', values: { new: 'statusNew', renewal: 'statusRenewal' } },
    { key: 'purposeOfVisit', values: { nursing: 'nursing', agriculture: 'agriculture', construction: 'construction', industry: 'industry', other: 'other' } },
    { key: 'program', values: { foreignWorker: 'foreignWorker', touristMedical: 'touristMedical' } },
    { key: 'gender', values: { M: 'M', F: 'F' } },
    { key: 'previousIns', values: { yes: 'yes', no: 'no' } },
  ];

  checkboxFields.forEach(({ key, values }) => {
    const val = formData[key];
    const styleKey = values[val];
    if (styleKey && styles[styleKey]) {
      const { x, y } = styles[styleKey];
      page.drawText('X', { x, y, size: 12, font: fonts.en });
    }
  });

  // текстові поля
  inputs.forEach((key) => {
    if (formData[key] && styles[key]) {
      const entries = Array.isArray(styles[key]) ? styles[key] : [styles[key]];
      entries.forEach(({ x, y }) => {
        safeDrawMixedText(page, formData[key], x, y, 10, fonts);
      });
    }
  });

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
}
