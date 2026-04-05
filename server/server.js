const express = require('express');
const cors    = require('cors');
const uploadRoutes = require('./routes/upload');
const dataRoutes   = require('./routes/data');
const { requestLogger } = require('./middlewares/logger');

const app  = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  }
}));
app.use(express.json());
app.use(requestLogger);

app.use('/', uploadRoutes);
app.use('/', dataRoutes);

app.listen(PORT, () => {
  console.log(`[server] running on port ${PORT}`);
});
