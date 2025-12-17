// server.js
//const { Client } = require('pg');
const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const app = express();
const port = 3000;
var pg = require('pg');
const db = require('./db'); // Import the database module
var favicon = require('serve-favicon');
// Set up Handlebars view engine

app.engine('.hbs', exphbs.engine({ // Note the .engine here
  defaultLayout: 'main', // Assumes a 'main.hbs' in your layouts folder
  extname: '.hbs', // Specifies the file extension
  // Add other configurations like partialsDir or helpers here
}))

app.set('view engine', '.hbs');
app.set('views', path.join(process.cwd(), 'views'));
app.use(express.static('public')); 
app.use(favicon(path.join(__dirname,'public','styles','favicon.ico')));

// Built-in middleware to parse URL-encoded bodies (form data)
app.use(express.urlencoded({ extended: true }));

// Define a route to render a view
app.get('/', async (req, res) => {
  // Renders the 'home.handlebars' file found in the 'views' folder
  /*res.render('index', { 
    title: 'Save the Zebras', 
    message: 'This is a dynamic message.' 
  });*/
   try {
    let printerTypes = await db.query('SELECT printer_type_id FROM printer_types');
	let activeUsers = await db.query('SELECT user_id FROM users WHERE is_active = TRUE');
	let printerParts = await db.query('SELECT * FROM printer_parts');
	res.render('index', { title: 'Save the Zebras', 
						  printer_types: JSON.stringify(printerTypes.rows),
						  active_users: JSON.stringify(activeUsers.rows),
						  printer_parts: JSON.stringify(printerParts.rows) });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
})

app.get('/about', (req, res) => {
  res.render('about', { title: 'Save the Zebras'});
})

app.get('/contact', (req, res) => {
  res.render('contact', { title: 'Save the Zebras'});
})

app.get('/news', (req, res) => {
  res.render('news', { title: 'Save the Zebras'});
});

app.get('/list', async (req, res) => {
  //res.render('list', {});
    try {
    const { rows } = await db.query('SELECT * FROM repairs');
	console.log(JSON.stringify(rows));
	res.render('list', { title: 'Save the Zebras', rows: JSON.stringify(rows) });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

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
});

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

// Define the POST route to handle form submission
app.post('/submit-repair', async (req, res) => {
  let { serialNumberId, userId, printerType, partNameNeeded, printerLocation, stationNumber, issue, assistBy } = req.body;

  console.log('serialNumberId:', serialNumberId);
  console.log('userId:', userId);
  console.log('printerType:', printerType);
  console.log('printerLocation:', printerLocation);
  console.log('stationNumber:', stationNumber);
  console.log('issue', issue);
  
  if (assistBy == "") {
	assistBy = null;
  }
  if (stationNumber == "") {
	stationNumber = null;
  }
  if (partNameNeeded == "") {
	partNameNeeded = null;
  }
  
  
  const text1 = 'SELECT * FROM printers WHERE serial_number_id = $1'; // Parameterized query
  const values = [serialNumberId]; // Array of values to substitute
  let printerExists = true;
    try {
    const response = await db.query(text1, values);
	if (response.rows.length == 0) {
		printerExists = false;
	}

  } catch (err) {	
	console.log(err)	
    //res.status(500).json({ error: 'Internal Server Error' });
  }
  
  if (printerExists == false) {
		//res.send('Go on');
		const text3 = 'INSERT INTO printers(serial_number_id, printer_type, times_worked_on) VALUES($1, $2, $3) RETURNING *'; // Parameterized query
		const values2 = [serialNumberId, printerType, 1]; // Array of values to substitute
		try {
		const response3 = await db.query(text3, values2);
		console.log(response3);
		res.send(response3);
		} catch (err) {
			console.log(err);
			res.send(err);
		}
  }
  
	const text4 = 'INSERT INTO repairs(serial_number_id, printer_type, user_id, assist_id, printer_part_id, printer_location, station_number, time_worked_on, issue) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *'; // Parameterized query
	const values4 = [serialNumberId, printerType, userId, assistBy, partNameNeeded, printerLocation, stationNumber, 45, issue]; // Array of values to substitute
	try {
	const response4 = await db.query(text4, values4);
	console.log(response4);
	res.send(response4);
	} catch (err) {
		console.log(err);
		res.send(err);
	}
});

app.post('/submit-new-user', async (req, res) => {
  const { selectOrgId, userId, firstName, lastName } = req.body;
  console.log('orgId:', selectOrgId);
  console.log('firstName:', firstName);
  console.log('lastName:', lastName);
  const lowerCaseUserId = userId.toLowerCase();
  const text = 'INSERT INTO users(user_id, org_Id, first_name, last_name) VALUES($1, $2, $3, $4) RETURNING *'; // Parameterized query
  const values = [lowerCaseUserId, selectOrgId, firstName, lastName]; // Array of values to substitute

  try {
    const response = await db.query(text, values);
	res.redirect('/');
  } catch (err) {	
	if (err.detail.includes('already exists.')) {
		res.status(500).send(`Error: ${userId} already exists.`);
	}	
    res.status(500).json({ error: 'Internal Server Error' });
  }
	//res.send(`Form submitted successfully for user: ${userId}`);
})



app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});