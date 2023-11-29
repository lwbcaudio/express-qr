const express = require('express');
const qrcode = require('qrcode');

const app = express();
app.use(express.json());

app.post('/webhook', (req, res) => {
  // This is where you'll handle the incoming webhook data
  console.log(req.body);

  // Encode the JSON string to base64
  const jsonString = JSON.stringify(req.body);
  const base64String = Buffer.from(jsonString).toString('base64');

  // Create the new JSON object
  const newJson = {
    phone: req.body.phone,
    basicwebhook: req.body.basicwebhook,
    qrdata: base64String
  };

  // Send the new JSON object back as a webhook
  // You'll need to replace 'your-webhook-url' with the actual URL of your webhook
  fetch(req.body.basicwebhook, {
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

app.post('/qr-gen', (req, res) => {
  const base64String = req.body.base64;

  // Generate QR code from base64 string
  qrcode.toDataURL(base64String, (err, url) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error generating QR code');
    } else {
      res.send(url);
    }
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server is running on port ${port}`));
