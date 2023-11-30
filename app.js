const express = require('express');
const qrcode = require('qrcode');
const ftp = require('basic-ftp');
const fs = require('fs');
require('dotenv').config() 

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
app.get('/qr-gen', (req, res) => {
  const hexString = 'https://web-hook-qr.onrender.com/qr?qrdata=' + req.query.qrdata;
  const hexS =req.query.qrdata;
  console.log(hexS);
  const jsonString = Buffer.from(hexS, 'hex').toString('utf8');
  console.log(jsonString);
  const jsonData = JSON.parse(jsonString);
  const qrname = jsonData.id;
  const qrfile = qrname + '.png';
   qrcode.toFile(qrfile, hexString, (err) => {
    if(err) {
      console.log(err);
      return res.status(500).send('Error generating QR code');
    }
    // Upload image
    const client = new ftp.Client();
    const ftpPassword = process.env.ftppassword;
    client.access({
      host: "ftp.livingwordnew.com",
      user: "qr@livingwordnew.com",
      password: ftpPassword 
    });
    client.cd("public_html/qr");
    client.uploadFrom(fs.createReadStream(qrfile), qrfile, (err) => {
      if (err) {
        console.log(err);
        return res.status(500).send('Error uploading image');  
      } 
      console.log("Uploaded QR code");
      client.close();
      // Return URL to image
      res.send("https://livingwordnew.com/qr/" + qrfile); 
    });
  });
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
