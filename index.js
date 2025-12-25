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
  res.render('error', { title: 'Save the Zebras'});
})

app.get('/news', (req, res) => {
  res.render('news', { title: 'Save the Zebras'});
});

app.get('/list', async (req, res) => {
  //res.render('list', {});
    try {
    const { rows } = await db.query('SELECT repair_id, repairs.serial_number_id, printer_types.printer_type_name, user_id, printer_location, station_number, money_saved, date_time_fixed FROM repairs INNER JOIN printers ON repairs.serial_number_id = printers.serial_number_id INNER JOIN printer_types ON printers.printer_type_id = printer_types.printer_type_id');
	//await db.query('SELECT * FROM repairs');
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
  let { serialNumberId, userId, printerType, partNameNeeded, printerLocation, stationNumber, issue, assistBy, timeSpentOnTask, comments, money_saved } = req.body;

  console.log('serialNumberId:', serialNumberId);
  console.log('userId:', userId);
  console.log('printerType:', printerType);
  console.log('printerLocation:', printerLocation);
  console.log('stationNumber:', stationNumber);
  console.log('issue', issue);
  console.log('timeSpentOnTask', timeSpentOnTask);
  console.log('comments', comments);
   console.log('moneySaved', money_saved);
  
  if (assistBy == "") {
	assistBy = null;
  }
  if (stationNumber == "") {
	stationNumber = null;
  }
  if (partNameNeeded == "") {
	partNameNeeded = null;
  }
  
  
  const text1 = 'SELECT * FROM printers WHERE serial_number_id = $1';
  const values = [serialNumberId];
  let printerExists = true;
    try {
    const response = await db.query(text1, values);
	if (response.rows.length == 0) {
		printerExists = false;
	}
  } catch (err) {
	console.log(err)
  }
  let repair_id = null;
  if (printerExists == false) {
		const text3 = 'INSERT INTO printers(serial_number_id, printer_type_id, times_worked_on) VALUES($1, $2, $3) RETURNING *';
		const values2 = [serialNumberId, printerType, 1]; // Array of values to substitute
		try {
			const response3 = await db.query(text3, values2);
		} catch (err) {
			console.log(err);
			res.send(err);
		}
  }
  

	const text4 = 'INSERT INTO repairs(serial_number_id, user_id, assist_id, printer_location, station_number, time_worked_on, comments, money_saved) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *'; // Parameterized query
	const values4 = [serialNumberId, userId, assistBy, printerLocation, stationNumber, timeSpentOnTask, comments, money_saved]; // Array of values to substitute
	//printer_part_id needed
	//issue needed
	try {
	const response4 = await db.query(text4, values4);
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
		const text5 = 'INSERT INTO issues_resolved_on_repair(repair_id, issue_id) VALUES($1, $2) RETURNING *'; // Parameterized query
		const values5 = [repair_id, arIssues[i]]; // Array of values to substitute
		//printer_part_id needed
		//issue needed
		try {
		const response5 = await db.query(text5, values5);
		//console.log(response5);
		//res.send(response5);
		} catch (err) {
			console.log(err);
			res.send(err);
		}
	}
	console.log('gatooor');
	console.log('gator18: ' + partNameNeeded);
	let arPartNameNeeded = [];
	
	if (partNameNeeded != undefined) {
		if (Array.isArray(partNameNeeded)) {
			arPartNameNeeded = partNameNeeded;
		} else {
			arPartNameNeeded.push(partNameNeeded);
		}
	}
	

	for (let d = 0; d < arPartNameNeeded.length; d++) {
		let text6 = 'INSERT INTO printer_parts_used_for_repair(repair_id, printer_part_id) VALUES($1, $2) RETURNING *'; // Parameterized query
		let values6 = [repair_id, arPartNameNeeded[d]];
		try {
			let response6 = await db.query(text6, values6);
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
	res.redirect('/success');
  } catch (err) {	
	if (err.detail.includes('already exists.')) {
		//res.status(500).send(`Error: ${userId} already exists.`);
		res.redirect('/error');
	}	
    res.status(500).json({ error: 'Internal Server Error' });
  }
})



app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});