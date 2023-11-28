const express = require('express');
const app = express();

app.use(express.json()); // for parsing application/json

app.post('/webhook', (req, res) => {
  // This is where you'll handle the incoming webhook data
  console.log(req.body);

  // Encode the JSON string to base64
  const jsonString = JSON.stringify(req.body);
  const base64String = Buffer.from(jsonString).toString('base64');

  // Create the new JSON object
  const newJson = {
    cid: req.body.cid,
    qrdata: base64String
  };

  // Send the new JSON object back as a webhook
  // You'll need to replace 'your-webhook-url' with the actual URL of your webhook
  fetch('your-webhook-url', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(newJson)
  })
  .then(response => response.json())
  .then(data => console.log(data))
  .catch((error) => {
    console.error('Error:', error);
  });

  res.status(200).end(); // Responding is important
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server is running on port ${port}`));
