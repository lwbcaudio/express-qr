const express = require('express');
const qrcode = require('qrcode');

const app = express();
app.use(express.json());

app.post('/webhook', (req, res) => {
  // This is where you'll handle the incoming webhook data
  console.log(req.body);

  // Encode the JSON string to hexadecimal
  const jsonString = JSON.stringify(req.body);
  const hexString = Buffer.from(jsonString).toString('hex');

  // Create the new JSON object
  const newJson = {
    phone: req.body.phone,
    qrdata: hexString
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
//app.post('/qr-gen', (req, res) => {
app.post('/qr-gen', (req, res) => {
  const hexString = 'https://web-hook-qr.onrender.com/qr?qrdata=' + req.params.qrdata;

  // Generate QR code from hexadecimal string
  qrcode.toDataURL(hexString, (err, url) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error generating QR code');
    } else {
      res.send(url);
    }
  });
});
app.post('/qr:qrdata', (req, res) => {
  const hexString = req.params.qrdata;

  // Decode the hex string to JSON
  const jsonString = Buffer.from(hexString, 'hex').toString('utf8');
  const jsonData = JSON.parse(jsonString);

  // Get the phone and promohook data
  const phone = jsonData.phone;
  const inboundWebhookUrl = jsonData.promohook;

  // Create the new JSON object
  const newJson = {
    phone: phone
  };

  // Send the new JSON object back as a webhook to the inboundwebhookurl
  fetch(inboundWebhookUrl, {
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
