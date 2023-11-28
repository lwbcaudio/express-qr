const express = require('express');
const app = express();

app.use(express.json()); // for parsing application/json

app.post('/webhook', (req, res) => {
  // This is where you'll handle the incoming webhook data
  console.log(req.body);
  res.status(200).end(); // Responding is important
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server is running on port ${port}`));
