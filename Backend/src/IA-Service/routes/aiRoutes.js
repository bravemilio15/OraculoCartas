import express from 'express';
import { generateResponse } from '../controllers/aiController.js';
const router = express.Router();

router.post('/generate', generateResponse);

export default router;

console.log('Contenido de src/routes/aiRoutes.js');