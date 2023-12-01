const express = require('express');
const qrcode = require('qrcode');
const ftp = require('basic-ftp');
const fs = require('fs');
require('dotenv').config(); 

import {
  encode, decode, trim,
  isBase64, isUrlSafeBase64
} from 'url-safe-base64';

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
app.post('/promo', (req, res) => {
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
  fetch(req.body.promohook, {
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
app.get('/qr-gen1', (req, res) => {
  const hexString = 'https://web-hook-qr.onrender.com/qr?qrdata=' + req.query.qrdata;

  // Generate QR code from hexadecimal string
  qrcode.toBuffer(hexString, (err, buffer) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error generating QR code');
    } else {
      res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': buffer.length
      });

      res.end(buffer);
    }
  });
});
app.post('/qr-gen', async (req, res) => {

  try {

    // Get data   
    const phone = req.body.phone; 
    const qrpromohook = req.body.promohook;
    const qrname = req.body.id;
    const qrfile = qrname + '.png';
    const hexString = 'bob alksfj;alksdjf;alksfdj;alkdjf'; //'https://web-hook-qr.onrender.com/qr?qrdata=' + req.body.qrdata;

    // Generate QR code
    await qrcode.toFile(qrfile, hexString);

    // Connect to FTP
    const client = new ftp.Client();
    await client.access({  
      host: "ftp.hooktesting.elementfx.com",
      user: "qr@hooktesting.elementfx.com",
      password: process.env.ftppassword 
    });
    console.log("FTP connected");
    // Upload file
    //await client.cd("/public_html/qr"); 
    await client.uploadFrom(fs.createReadStream(qrfile), qrfile);
    
    console.log("Uploaded");

    // Send response
    res.send("https://livingwordnew.com/" + qrfile);

  } catch(err) {

    console.log(err);
    res.status(500).send('Error uploading image');
  
  }

});
app.get('/qr', (req, res) => {
  const hexString = req.query.qrdata;

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
  .then(data => {
    console.log(data);
    res.send(`<p>QR Code scanned successfully!</p>`); // Display success message
  })
  .catch((error) => {
    console.error('Error:', error);
    res.send(`<p>Error: ${error}</p>`); // Display error message
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server is running on port ${port}`));
