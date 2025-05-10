import multer from 'multer';
import { BlobServiceClient } from '@azure/storage-blob';
import path from 'path';

// Налаштування для Azure Blob Storage
const accountName = process.env.ACCOUNT_NAME;
const sasToken = process.env.SAS_TOKEN;
const containerName = process.env.CONTAINER_NAME;
const blobServiceClient = new BlobServiceClient(`https://${accountName}.blob.core.windows.net/?${sasToken}`);
const containerClient = blobServiceClient.getContainerClient(containerName);

// Налаштування multer для потокового завантаження
const storage = multer.memoryStorage();  // Використовуємо memoryStorage, щоб файли були в пам'яті

const upload = multer({ storage });

export default upload;