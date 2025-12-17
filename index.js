// server.js
//const { Client } = require('pg');
const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const app = express();
const port = 3000;
var pg = require('pg');
const db = require('./db'); // Import the database module

// Set up Handlebars view engine

app.engine('.hbs', exphbs.engine({ // Note the .engine here
  defaultLayout: 'main', // Assumes a 'main.hbs' in your layouts folder
  extname: '.hbs', // Specifies the file extension
  // Add other configurations like partialsDir or helpers here
}))

app.set('view engine', '.hbs');
app.set('views', path.join(process.cwd(), 'views')); // Set the views directory
//app.set('views', './views');

// Serve static files from the 'public' directory
app.use(express.static('public')); 

// Built-in middleware to parse URL-encoded bodies (form data)
app.use(express.urlencoded({ extended: true }));

// Serve the static HTML file
/*app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});*/

// Define a route to render a view
app.get('/', (req, res) => {
  // Renders the 'home.handlebars' file found in the 'views' folder
  res.render('index', { 
    title: 'Save the Zebras', 
    message: 'This is a dynamic message.' 
  });
})

app.get('/about', (req, res) => {
  res.render('about', { title: 'Save the Zebras'});
})

app.get('/contact', (req, res) => {
  res.render('contact', { title: 'Save the Zebras'});
})

app.get('/news', (req, res) => {
  res.render('news', { title: 'Save the Zebras'});
})

app.get('/list', async (req, res) => {
  //res.render('list', {});
    try {
    const { rows } = await db.query('SELECT * FROM repairs');
    //res.status(200).json(rows);
	console.log(JSON.stringify(rows));
	res.render('list', { title: 'Save the Zebras', rows: JSON.stringify(rows) });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
})

app.get('/join', async (req, res) => {
  //res.render('list', {});
    try {
    const { rows } = await db.query('SELECT org_id FROM organizations');
    //res.status(200).json(rows);
	console.log(JSON.stringify(rows));
	res.render('join', { title: 'Save the Zebras', rows: JSON.stringify(rows) });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
})

// Example route to get all users
app.get('/users', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM organizations ORDER BY org_id ASC');
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

/*
app.get('/about.html', (req, res) => {
  res.sendFile(__dirname + '/about.html');
});

app.get('/contact.html', (req, res) => {
  res.sendFile(__dirname + '/contact.html');
});

app.get('/news.html', (req, res) => {
  res.sendFile(__dirname + '/news.html');
});

app.get('/list.html', (req, res) => {
  res.sendFile(__dirname + '/list.html');
});

app.get('/join.html', (req, res) => {
  res.sendFile(__dirname + '/join.html');
});*/

// Define the POST route to handle form submission
app.post('/submit-repair', (req, res) => {
  const serialNumberId = req.body.serialNumberId;
  const userId = req.body.userId;
  const printerType = req.body.printerType;
  const partNameNeeded = req.body.partNameNeeded;
  const printerLocation = req.body.printerLocation;
  const stationNumber = req.body.stationNumber;
  const issue = req.body.issue;

  console.log('serialNumberId:', serialNumberId);
  console.log('userId:', userId);
  console.log('printerType:', printerType);
  console.log('printerLocation:', printerLocation);
  console.log('stationNumber:', stationNumber);
  console.log('issue', issue);

  res.send(`Form submitted successfully for user: ${userId}`);
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});