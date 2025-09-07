import { PDFDocument } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { pdfStyles } from './pdfStyles';

export async function generateExtraPdf(formData) {
  const templatePath = '/pdf-templates/ayalon_extra.pdf';
  const fontPath = '/fonts/NotoSans-Regular.ttf';

  const templateBytes = await fetch(templatePath).then(res => res.arrayBuffer());
  const fontBytes = await fetch(fontPath).then(res => res.arrayBuffer());

  const pdfDoc = await PDFDocument.load(templateBytes);
  pdfDoc.registerFontkit(fontkit);
  const font = await pdfDoc.embedFont(fontBytes);

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
  ]

  // 🔲 Вставка status (галочка)
  if (formData.status === 'new' && styles.statusNew) {
    page.drawText('X', {
      x: styles.statusNew.x,
      y: styles.statusNew.y,
      size: 12,
      font,
    });
  }

  if (formData.status === 'renewal' && styles.statusRenewal) {
    page.drawText('X', {
      x: styles.statusRenewal.x,
      y: styles.statusRenewal.y,
      size: 12,
      font,
    });
  }

  if (formData.purposeOfVisit === 'nursing' && styles.nursing) {
    page.drawText('X', {
      x: styles.nursing.x,
      y: styles.nursing.y,
      size: 12,
      font,
    });
  }

  if (formData.purposeOfVisit === 'agriculture' && styles.agriculture) {
    page.drawText('X', {
      x: styles.agriculture.x,
      y: styles.agriculture.y,
      size: 12,
      font,
    });
  }

  if (formData.purposeOfVisit === 'construction' && styles.construction) {
    page.drawText('X', {
      x: styles.construction.x,
      y: styles.construction.y,
      size: 12,
      font,
    });
  }

  if (formData.purposeOfVisit === 'industry' && styles.industry) {
    page.drawText('X', {
      x: styles.industry.x,
      y: styles.industry.y,
      size: 12,
      font,
    });
  }

  if (formData.purposeOfVisit === 'other' && styles.other) {
    page.drawText('X', {
      x: styles.other.x,
      y: styles.other.y,
      size: 12,
      font,
    });
  }

  if (formData.program === 'foreignWorker' && styles.foreignWorker) {
    page.drawText('X', {
      x: styles.foreignWorker.x,
      y: styles.foreignWorker.y,
      size: 12,
      font,
    });
  }

  if (formData.program === 'touristMedical' && styles.touristMedical) {
    page.drawText('X', {
      x: styles.touristMedical.x,
      y: styles.touristMedical.y,
      size: 12,
      font,
    });
  }

  if (formData.gender === 'M' && styles.M) {
    page.drawText('X', {
      x: styles.M.x,
      y: styles.M.y,
      size: 12,
      font,
    });
  }

  if (formData.gender === 'F' && styles.F) {
    page.drawText('X', {
      x: styles.F.x,
      y: styles.F.y,
      size: 12,
      font,
    });
  }

  if (formData.previousIns === 'yes' && styles.yes) {
    page.drawText('X', {
      x: styles.yes.x,
      y: styles.yes.y,
      size: 12,
      font,
    });
  }

  if (formData.previousIns === 'no' && styles.no) {
    page.drawText('X', {
      x: styles.no.x,
      y: styles.no.y,
      size: 12,
      font,
    });
  }

  inputs.forEach((key) => {
    if (formData[key] && styles[key]) {
      const entries = Array.isArray(styles[key]) ? styles[key] : [styles[key]];
      entries.forEach(({ x, y }) => {
        page.drawText(formData[key], {
          x,
          y,
          size: 10,
          font,
        });
      });
    }
  });

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
}
