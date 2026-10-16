import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();
const app = express();
app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'PlacementOS tutor API' }));

app.post('/api/tutor', async (req, res) => {
  const { question, progress } = req.body ?? {};
  if (typeof question !== 'string' || !question.trim()) {
    return res.status(400).json({ error: 'Please enter a question.' });
  }
  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({ error: 'OPENAI_API_KEY is missing. Add it to server/.env and restart the server.' });
  }
  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.responses.create({
      model: 'gpt-4.1-mini',
      instructions: `You are PlacementOS, a patient tutor helping an Indian BTech CSE student prepare for fresher software/IT placements targeting around ₹6 LPA. Teach from beginner level, prioritize Java for DSA, SQL/DBMS, aptitude, CS fundamentals, project explanations, and mock interviews. Give clear step-by-step explanations, small practice tasks, and honest feedback. Do not guarantee employment or invent placement facts. Keep the answer practical.`,
      input: `Student progress snapshot:\n${JSON.stringify(progress ?? {}, null, 2)}\n\nStudent question:\n${question.trim()}`
    });
    res.json({ answer: response.output_text || 'I could not produce an answer. Please try again.' });
  } catch (err) {
    console.error('Tutor API error:', err?.message || err);
    res.status(500).json({ error: 'AI tutor request failed. Check the API key, model access, and server logs.' });
  }
});

const port = Number(process.env.PORT || 8787);
app.listen(port, () => console.log(`PlacementOS API running on http://localhost:${port}`));
