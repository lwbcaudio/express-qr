const express = require('express');
const qrcode = require('qrcode');
const ftp = require('basic-ftp');
const fs = require('fs');
const sBase64 = require('url-safe-base64');
require('dotenv').config(); 

const app = express();
app.use(express.json());

app.post('/qr-gen', async (req, res) => {

  try {

    // Get data   
    //const phone = req.body.phone; 
    //const qrpromohook = req.body.promohook;
    const qrname = req.body.id;
    const qrfile = qrname + '.png';

    const qrdata = {
      phone: req.body.phone,
      promohook: req.body.promohook
    };
    const json = JSON.stringify(qrdata);
    
    const bs64 = Buffer.from(json, 'utf-8').toString("base64");
    
    const hexString = 'https://web-hook-qr.onrender.com/qr?qrdata=' + sBase64.encode(bs64);

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
    res.send("http://hooktesting.elementfx.com/qr/" + qrfile);

  } catch(err) {

    console.log(err);
    res.status(500).send('Error uploading image');
  
  }

});
app.get('/qr', (req, res) => {
  const bs64 = sBase64.decode(req.query.qrdata);
  const hexString = Buffer.from(bs64, 'base64').toString("utf-8");

  // Decode the hex string to JSON
  //const jsonString = hexString;
  const jsonData = JSON.parse(hexString);
  console.log(jsonData);
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
