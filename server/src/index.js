import express from 'express';
import http from 'http';
import cors from 'cors';
import path from 'path';
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

// Serve Google Play compliance legal documents
app.use('/legal', express.static(path.join(__dirname, '../../legal')));

// Routes
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
