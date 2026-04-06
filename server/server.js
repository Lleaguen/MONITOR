const express = require('express');
const cors    = require('cors');
const uploadRoutes = require('./routes/upload');
const dataRoutes   = require('./routes/data');
const { requestLogger } = require('./middlewares/logger');

const app  = express();
const PORT = process.env.PORT || 3001;

// ✅ CONFIGURACIÓN CORS BIEN HECHA
const corsOptions = {
  origin: ['https://lleaguen.github.io'], // tu frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));

// 🔥 IMPORTANTE: manejar preflight
app.options('*', cors(corsOptions));

app.use(express.json());
app.use(requestLogger);

app.use('/', uploadRoutes);
app.use('/', dataRoutes);

app.listen(PORT, () => {
  console.log(`[server] running on port ${PORT}`);
});
