// import dotenv from 'dotenv';
// import express from 'express';
// import multer from 'multer';
// import cors from 'cors';
// import nodemailer from 'nodemailer';

// dotenv.config();

// const app = express();

// // Ограничения на размер файлов
// const upload = multer({
//   limits: {
//     fileSize: 5 * 1024 * 1024, // 5MB
//   },
// });

// app.use(cors({
//   origin: 'http://localhost:5173',
// }));
// app.use(express.json());

// app.post('/send-pdf', upload.fields([{ name: 'pdfEn' }, { name: 'pdfTh' }]), async (req, res) => {
//   try {
//     const { surname } = req.body;
//     const pdfEn = req.files?.pdfEn?.[0];
//     const pdfTh = req.files?.pdfTh?.[0];

//     if (!surname || typeof surname !== 'string' || !pdfEn || !pdfTh) {
//       return res.status(400).json({ message: 'Invalid input' });
//     }

//     // ✅ Проверка MIME-типа
//     if (
//       pdfEn.mimetype !== 'application/pdf' ||
//       pdfTh.mimetype !== 'application/pdf'
//     ) {
//       return res.status(400).json({ message: 'Only PDF files are allowed' });
//     }

//     const transporter = nodemailer.createTransport({
//       service: 'Gmail',
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
//     });

//     await transporter.sendMail({
//       from: process.env.EMAIL_USER,
//       to: process.env.EMAIL_TO,
//       subject: `New form submission from ${surname}`,
//       text: 'Attached are the English and Thai PDFs.',
//       attachments: [
//         { filename: 'form_en.pdf', content: pdfEn.buffer },
//         { filename: 'form_th.pdf', content: pdfTh.buffer },
//       ],
//     });

//     res.status(200).send('Emails sent successfully');
//   } catch (error) {
//     console.error('🔥 Backend error in /send-pdf:', error);
//     console.error('Error sending email:', error);
//     res.status(500).send('Email failed');
//   }
// });

// const PORT = process.env.PORT || 3001;
// app.listen(PORT, () => {
//   console.log(`✅ Backend running on http://localhost:${PORT}`);
// });


import dotenv from 'dotenv';
import express from 'express';
import multer from 'multer';
import cors from 'cors';
import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();

// ⬇️ Потрібно для коректного визначення шляхів у ES-модулях (якщо ви використовуєте "type": "module")
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ограничения на размер файлов
const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

app.use(cors());
app.use(express.json());

// 🟢 Обслуговування фронтенд-файлів
app.use(express.static(path.join(__dirname, 'dist')));

// 🟢 Обробка запитів до фронтенду (SPA routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// 🟢 Ваш API-ендпоінт
app.post('/send-pdf', upload.fields([{ name: 'pdfEn' }, { name: 'pdfTh' }]), async (req, res) => {
  try {
    const { surname } = req.body;
    const pdfEn = req.files?.pdfEn?.[0];
    const pdfTh = req.files?.pdfTh?.[0];

    if (!surname || typeof surname !== 'string' || !pdfEn || !pdfTh) {
      return res.status(400).json({ message: 'Invalid input' });
    }

    if (
      pdfEn.mimetype !== 'application/pdf' ||
      pdfTh.mimetype !== 'application/pdf'
    ) {
      return res.status(400).json({ message: 'Only PDF files are allowed' });
    }

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_TO,
      subject: `New form submission from ${surname}`,
      text: 'Attached are the English and Thai PDFs.',
      attachments: [
        { filename: 'form_en.pdf', content: pdfEn.buffer },
        { filename: 'form_th.pdf', content: pdfTh.buffer },
      ],
    });

    res.status(200).send('Emails sent successfully');
  } catch (error) {
    console.error('🔥 Backend error in /send-pdf:', error);
    res.status(500).send('Email failed');
  }
});

const PORT = process.env.PORT || 3001;
console.log('🧪 ENV VARS:', process.env);
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
