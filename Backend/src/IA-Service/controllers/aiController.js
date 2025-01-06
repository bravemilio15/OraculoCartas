import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../config/config.js';

const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);

export const generateResponse = async (req, res) => {
  try {
    const { prompt } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    res.json({ response: text });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
};

console.log('Contenido de src/controllers/aiController.js');