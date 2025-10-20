const express = require('express');
const app = express();
const PORT = 8080;

app.use(express.json());

app.get('/api/test', (req, res) => {
  res.status(200).json({ status: 'test' });
});

app.listen(PORT, () => {
  console.log(`server listening on http://localhost:${PORT}`);
});
