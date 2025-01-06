import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import aiRoutes from '../src/IA-Service/routes/aiRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

app.use('/api', aiRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});