import express from 'express';
import authRoutes from './routes/authRoutes.js';
import authorRoutes from './routes/authorRoutes.js';
import cors from 'cors';
const app = express();
app.use(cors());
app.use(express.json());
app.use('/', authRoutes);
app.use('/', authorRoutes);

const port = process.env.PORT || 8081;
app.listen(port, () => console.log(`Listening on port ${port}`));
export default app;