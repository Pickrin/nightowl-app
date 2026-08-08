import express from 'express';
import http from 'http';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { setupWebSocket } from './socket.js';
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profiles.js';
import billingRoutes from './routes/billing.js';
import moderationRoutes from './routes/moderation.js';
import adminRoutes from './routes/admin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// Middlewares
app.use(cors());
app.use(express.json({ limit: '15mb' }));

// Static Legal Documents directories
app.use('/legal', express.static(path.join(__dirname, '../legal')));
app.use('/legal', express.static(path.join(__dirname, '../../legal')));

// Direct fallback legal routes to guarantee instant 200 OK delivery
app.get('/legal/csae_standards.html', (req, res) => {
  const p1 = path.join(__dirname, '../legal/csae_standards.html');
  const p2 = path.join(__dirname, '../../legal/csae_standards.html');
  if (fs.existsSync(p1)) return res.sendFile(p1);
  if (fs.existsSync(p2)) return res.sendFile(p2);
  res.send('<h1>CSAE Standards</h1><p>Zero tolerance policy against CSAM/CSAE for adults 18+.</p>');
});

app.get('/legal/privacy_policy.html', (req, res) => {
  const p1 = path.join(__dirname, '../legal/privacy_policy.html');
  const p2 = path.join(__dirname, '../../legal/privacy_policy.html');
  if (fs.existsSync(p1)) return res.sendFile(p1);
  if (fs.existsSync(p2)) return res.sendFile(p2);
  res.send('<h1>Privacy Policy</h1><p>NightOwl Privacy Policy.</p>');
});

app.get('/legal/terms_of_service.html', (req, res) => {
  const p1 = path.join(__dirname, '../legal/terms_of_service.html');
  const p2 = path.join(__dirname, '../../legal/terms_of_service.html');
  if (fs.existsSync(p1)) return res.sendFile(p1);
  if (fs.existsSync(p2)) return res.sendFile(p2);
  res.send('<h1>Terms of Service</h1><p>NightOwl Terms of Service.</p>');
});

app.get('/legal/community_guidelines.html', (req, res) => {
  const p1 = path.join(__dirname, '../legal/community_guidelines.html');
  const p2 = path.join(__dirname, '../../legal/community_guidelines.html');
  if (fs.existsSync(p1)) return res.sendFile(p1);
  if (fs.existsSync(p2)) return res.sendFile(p2);
  res.send('<h1>Community Guidelines</h1><p>NightOwl Community Guidelines.</p>');
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/moderation', moderationRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'NightOwl: AfterHours Anonymous Dating API',
    version: '1.2.0',
    timestamp: new Date().toISOString()
  });
});

// Setup WebSocket server
setupWebSocket(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🦉 NightOwl API & Admin Server running at http://localhost:${PORT}`);
});
