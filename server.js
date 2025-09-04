import dotenv from 'dotenv';
import express from 'express';
import multer from 'multer';
import cors from 'cors';
import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 🟢 Додатковий парсер для FormData-текстових полів
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());

// 🟢 Завантаження файлів через multer
const upload = multer({ limits: { fileSize: 5 * 1024 * 1024 } });

// 🟢 Статика
app.use(express.static(path.join(__dirname, 'dist')));

// 🟢 Обробка форми
app.post(
  '/send-pdf',
  upload.fields([
    { name: 'pdfEn' },
    { name: 'pdfTh' },
    { name: 'pdfCn' },
    { name: 'pdfExtra' },
  ]),
  async (req, res) => {
    try {
      const { surname } = req.body;
      const pdfEn = req.files?.pdfEn?.[0];
      const pdfTh = req.files?.pdfTh?.[0];
      const pdfCn = req.files?.pdfCn?.[0];
      const pdfExtra = req.files?.pdfExtra?.[0];

      // 🧪 dryRun режим
      if (req.query.dryRun === '1') {
        return res.json({
          surname,
          received: [
            { key: 'pdfEn', present: !!pdfEn, size: pdfEn?.size },
            { key: 'pdfTh', present: !!pdfTh, size: pdfTh?.size },
            { key: 'pdfCn', present: !!pdfCn, size: pdfCn?.size },
          ],
        });
      }

      // ✅ Перевірка вхідних даних
      if (!surname || typeof surname !== 'string') {
        return res.status(400).json({ message: 'Missing surname' });
      }
      if (!pdfEn || !pdfTh || !pdfCn) {
        return res.status(400).json({ message: 'Missing one or more PDFs' });
      }

      // ✉️ Налаштування транспорту
      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      // 📤 Відправка листа
      // 📎 Підготовка вкладень
      const attachments = [
        { filename: 'form_en.pdf', content: pdfEn.buffer },
        { filename: 'form_th.pdf', content: pdfTh.buffer },
        { filename: 'form_cn.pdf', content: pdfCn.buffer },
      ];

      if (pdfExtra) {
        attachments.push({ filename: 'form_extra.pdf', content: pdfExtra.buffer });
      }

      // 📤 Відправка листа
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_TO,
        subject: `New form submission from ${surname}`,
        text: `Attached are the English, Thai, Chinese, and Extra PDFs.
קבוצת גלובל ח.פ.516936457
מספר מעסיק 2104
מספר הסכם 7652
מספר סוכן 321720
חיש סוכנות לביטוח`,
        attachments, // ← вставлено сюди
      });

      res.status(200).send('Emails sent successfully');
    } catch (error) {
      console.error('🔥 Backend error in /send-pdf:', error.message);
      console.error(error.stack);
      res.status(500).send('Email failed');
    }
  }
);

// 🟢 Запуск
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
