const express = require('express');

const app = express();
const PORT = process.env.PORT || 4000;
const SERVICE_NAME = process.env.SERVICE_NAME || 'express-api';

app.get('/', (_req, res) => {
  res.json({ message: `Hello world from ${SERVICE_NAME}` });
});

app.listen(PORT, () => {
  console.log(`Express API ${SERVICE_NAME} listening on port ${PORT}`);
});
