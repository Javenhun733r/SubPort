// middleware/multer.config.js
import multer from 'multer';

// Використовуємо memoryStorage, щоб отримати файл як буфер у req.file.buffer
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    // Ваш існуючий фільтр типів файлів
    const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'application/zip'
    ];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        console.error(`MULTER_CONFIG: File type not supported: ${file.mimetype}`);
        cb(new Error('Тип файлу не підтримується. Дозволені: зображення, pdf, doc, docx, txt, zip.'), false);
    }
};

// Можна створити окремий middleware для чат-файлів, якщо налаштування відрізняються
const uploadToMemory = multer({
    storage: storage,
    limits: {
        fileSize: 15 * 1024 * 1024 // Наприклад, 15MB, можна налаштувати
    },
    fileFilter: fileFilter
});

export default uploadToMemory; // Експортуємо налаштований multer