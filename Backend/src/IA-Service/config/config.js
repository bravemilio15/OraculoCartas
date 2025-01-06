import dotenv from 'dotenv';

dotenv.config();

export default {
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
};

console.log('Contenido de src/config/config.js');