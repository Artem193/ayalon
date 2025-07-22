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

// 🧭 Для роботи з __dirname в ES-модулях
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

// 🟢 СТАТИЧНІ ФАЙЛИ з dist
app.use(express.static(path.join(__dirname, 'dist')));

// 🟢 SPA ROUTING — все інше веде на index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// 🟢 API: надсилання PDF
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
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
