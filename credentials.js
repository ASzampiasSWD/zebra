const fs = require('fs');

let credentials = {};

// Certificate
try {
const privateKey = fs.readFileSync('/etc/letsencrypt/live/savethezebras.work/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/savethezebras.work/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/savethezebras.work/chain.pem', 'utf8');
credentials = {
	key: privateKey,
	cert: certificate,
	ca: ca
};
} catch (err) {
  console.log(err);
}

module.exports = {
	credentials
}