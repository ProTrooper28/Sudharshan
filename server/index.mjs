import 'dotenv/config';
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { createStudentApi } from './student-api.mjs';

const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;
const app = express();
app.disable('x-powered-by');

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  app.get('/api/health', (_request, response) => response.json({ data: { configured: false } }));
  app.use('/api', (_request, response) => response.status(503).json({
    error: {
      code: 'SUPABASE_NOT_CONFIGURED',
      message: 'Configure SUPABASE_URL and SUPABASE_ANON_KEY to enable candidate data.',
    },
  }));
} else {
  const allowedOrigin = process.env.APP_ORIGIN ?? 'http://localhost:3000';
  app.use(createStudentApi({
    supabaseUrl: SUPABASE_URL,
    supabaseAnonKey: SUPABASE_ANON_KEY,
    createClient,
    allowedOrigin,
    secureCookies: process.env.NODE_ENV !== 'development',
  }));
}

const port = Number(process.env.API_PORT ?? 4000);
const host = process.env.API_HOST ?? '0.0.0.0';
app.listen(port, host, () => {
  console.log(`Candidate API listening on ${host}:${port}`);
});
