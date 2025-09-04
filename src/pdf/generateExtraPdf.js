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

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
}
