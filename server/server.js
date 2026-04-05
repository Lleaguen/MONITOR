const express = require('express');
const cors    = require('cors');
const uploadRoutes = require('./routes/upload');
const dataRoutes   = require('./routes/data');
const { requestLogger } = require('./middlewares/logger');

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.use('/', uploadRoutes);
app.use('/', dataRoutes);

app.listen(PORT, () => {
  console.log(`[server] running on port ${PORT}`);
});
