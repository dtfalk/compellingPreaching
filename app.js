const express = require('express'); // express
const fs = require('fs');
const path = require('path');
const https = require('https');
const app = express();
const userRoutes = require('./routes/userRoutes');
const port = 3000; 

//paths for https certificate and private key
// const options = {
//     key: fs.readFileSync(path.join(__dirname, 'httpsInfo', 'private.key')), // Path to your private key
//     cert: fs.readFileSync(path.join(__dirname, 'httpsInfo', 'certificate.crt')) // Path to your certificate
//   };

app.use(express.static('public'));
app.use('/api', userRoutes);
app.use(express.json());

// creating https server
// https.createServer(options, app).listen(port, () => {
//     console.log(`Server running on https://compellingPreaching.ssd.uchicago.edu:${port}`);
//   });

// for local host purposes (comment this out when you run this on the actual server)
 app.listen(port, () => console.log(`Server running on http://localhost:${port}`));

