// NightOwl Production Cloud API & WebSocket Configuration
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

export const API_BASE_URL = isLocal
  ? 'https://nightowl-server.onrender.com' // Connected directly to live cloud backend
  : 'https://nightowl-server.onrender.com';

export const WS_BASE_URL = isLocal
  ? 'wss://nightowl-server.onrender.com/ws'
  : 'wss://nightowl-server.onrender.com/ws';
