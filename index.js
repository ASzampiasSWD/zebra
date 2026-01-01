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
   try {
    let printerTypes = await db.query('SELECT printer_type_id, printer_type_name, current_cost FROM printer_types');
	let activeUsers = await db.query('SELECT user_id FROM users WHERE is_active = TRUE');
	let printerParts = await db.query('SELECT * FROM printer_parts ORDER BY popularity_score');
	let issues = await db.query('SELECT * FROM issues ORDER BY popularity_score');
	res.render('index', { title: 'Save the Zebras', 
						  printer_types: JSON.stringify(printerTypes.rows),
						  active_users: JSON.stringify(activeUsers.rows),
						  printer_parts: JSON.stringify(printerParts.rows),
						  issues: JSON.stringify(issues.rows)});
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
})

app.get('/about', (req, res) => {
  res.render('about', { title: 'Save the Zebras'});
})

app.get('/tester', async (req, res) => {
 // res.render('tester', { title: 'Save the Zebras'});
   // Renders the 'home.handlebars' file found in the 'views' folder
  /*res.render('index', { 
    title: 'Save the Zebras', 
    message: 'This is a dynamic message.' 
  });*/
   try {
    let printerTypes = await db.query('SELECT printer_type_id FROM printer_types');
	let activeUsers = await db.query('SELECT user_id FROM users WHERE is_active = TRUE');
	let printerParts = await db.query('SELECT * FROM printer_parts');
	res.render('tester', { title: 'Save the Zebras', 
						  printer_types: JSON.stringify(printerTypes.rows),
						  active_users: JSON.stringify(activeUsers.rows),
						  printer_parts: JSON.stringify(printerParts.rows) });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
})

app.get('/contact', (req, res) => {
  res.render('contact', { title: 'Save the Zebras'});
})

app.get('/success', (req, res) => {
  res.render('success', { title: 'Save the Zebras'});
})

app.get('/error', (req, res) => {
  let passedVariable = req.query.username;
  let strMessage = 'User ' +  passedVariable + ' already exists';
  res.render('error', { title: 'Save the Zebras',
						errMessage: strMessage});
})

app.get('/printer', (req, res) => {
  let passedVariable = req.query.id;
  res.render('printer', { title: 'Save the Zebras',
						serial_number_id: req.query.id});
})

app.get('/news', (req, res) => {
  res.render('news', { title: 'Save the Zebras'});
});

app.get('/list', async (req, res) => {
    try {
    const { rows } = await db.query('SELECT repair_id, repairs.serial_number_id, printer_types.printer_type_name, user_id, printer_location, station_number, money_saved, date_time_fixed FROM repairs INNER JOIN printers ON repairs.serial_number_id = printers.serial_number_id INNER JOIN printer_types ON printers.printer_type_id = printer_types.printer_type_id ORDER BY repair_id');
	console.log(JSON.stringify(rows));
	res.render('list', { title: 'Save the Zebras', rows: JSON.stringify(rows) });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.get('/join', async (req, res) => {
    try {
    const { rows } = await db.query('SELECT org_id FROM organizations');
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
  let { serialNumberId, userId, printerType, partNameNeeded, printerLocation, stationNumber, issue, assistBy, timeSpentOnTask, comments, money_saved } = req.body;

  if (assistBy == "") {
	assistBy = null;
  }
  if (stationNumber == "") {
	stationNumber = null;
  }
  if (partNameNeeded == "") {
	partNameNeeded = null;
  }
    
  const queryPrinterBySerialNumberId = 'SELECT * FROM printers WHERE serial_number_id = $1';
  const queryPrinterBySerialNumberIdValues = [serialNumberId];
  let printerExists = true;
  try {
    const response = await db.query(queryPrinterBySerialNumberId, queryPrinterBySerialNumberIdValues);
	if (response.rows.length == 0) {
		printerExists = false;
	}
  } catch (err) {
	console.log(err)
  }
  let repair_id = null;
  if (printerExists == false) {
		const insertIntoPrinters = 'INSERT INTO printers(serial_number_id, printer_type_id) VALUES($1, $2) RETURNING *';
		const insertIntoPrintersValues = [serialNumberId, printerType];
		try {
			const response3 = await db.query(insertIntoPrinters, insertIntoPrintersValues);
		} catch (err) {
			console.log(err);
			res.send(err);
		}
  }
  
	const insertIntoRepairs = 'INSERT INTO repairs(serial_number_id, user_id, assist_id, printer_location, station_number, time_worked_on, comments, money_saved) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *';
	const insertIntoRepairsValues = [serialNumberId, userId, assistBy, printerLocation, stationNumber, timeSpentOnTask, comments, money_saved];

	try {
	const response4 = await db.query(insertIntoRepairs, insertIntoRepairsValues);
	repair_id = response4.rows[0].repair_id;
	} catch (err) {
		console.log(err);
		res.send(err);
	}
	
	let arIssues = [];
	if (Array.isArray(issue)) {
		arIssues = issue;
	} else {
		arIssues.push(issue);
	}
	

	for (let i = 0; i < arIssues.length; i++) {
		const insertIntoIssuesResolved = 'INSERT INTO issues_resolved_on_repair(repair_id, issue_id) VALUES($1, $2) RETURNING *';
		const insertIntoIssuesResolvedValues = [repair_id, arIssues[i]];
		try {
		const response5 = await db.query(insertIntoIssuesResolved, insertIntoIssuesResolvedValues );
		} catch (err) {
			console.log(err);
			res.send(err);
		}
	}
	
	let arPartNameNeeded = [];	
	if (partNameNeeded != undefined) {
		if (Array.isArray(partNameNeeded)) {
			arPartNameNeeded = partNameNeeded;
		} else {
			arPartNameNeeded.push(partNameNeeded);
		}
	}
	
	for (let d = 0; d < arPartNameNeeded.length; d++) {
		let insertIntoPrinterPartsUsed = 'INSERT INTO printer_parts_used_for_repair(repair_id, printer_part_id) VALUES($1, $2) RETURNING *'; // Parameterized query
		let insertIntoPrinterPartsUsedValues = [repair_id, arPartNameNeeded[d]];
		try {
			let response6 = await db.query(insertIntoPrinterPartsUsed, insertIntoPrinterPartsUsedValues);
		} catch (err) {
			console.log(err);
			res.send(err);
		}
	}
	res.redirect('/list');	
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
	console.log('we in here?');
	res.redirect('/success');
  } catch (err) {	
	if (err.detail.includes('already exists.')) {
		//res.status(500).send(`Error: ${userId} already exists.`);
		console.log('errror Katy');
		let linky = '/error?username=' + userId;
		console.log(linky);
		res.redirect(linky);
	}	
    //res.status(500).json({ error: 'Internal Server Error' });
  }
})



app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});