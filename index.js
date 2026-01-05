const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const http = require('http');
const https = require('https');
const app = express();
const port = 3000;
var pg = require('pg');
const db = require('./db');
const warranty = require('./warranty');
const credentials = require('./credentials');
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
	let printerParts = await db.query('SELECT printer_parts_used_for_printer_type.printer_part_id, printer_parts_used_for_printer_type.printer_type_id, printer_part_name, current_cost, popularity_score FROM printer_parts_used_for_printer_type INNER JOIN printer_parts ON printer_parts_used_for_printer_type.printer_part_id=printer_parts.printer_part_id ORDER BY popularity_score');
	let issues = await db.query('SELECT * FROM issues ORDER BY popularity_score');
	res.render('index', { printer_types: JSON.stringify(printerTypes.rows),
						  active_users: JSON.stringify(activeUsers.rows),
						  printer_parts: JSON.stringify(printerParts.rows),
						  issues: JSON.stringify(issues.rows)});
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
})

app.get('/success', (req, res) => {
  res.render('success');
})

app.get('/error', (req, res) => {
  let passedVariable = req.query.username;
  let printerVariable = req.query.printer;
  let strMessage = '';
  let url = '/list';
  
  if (passedVariable != undefined) {
	strMessage = 'User ' +  passedVariable + ' already exists';
	url = '/join';
  }
  if (passedVariable == 'DNE') {
	strMessage = 'User Does Not Exist';
	url = '/join';
  }
  if (printerVariable != undefined) {
	strMessage = 'Printer Does Not Exist';
	url = '/list';
  }
 
  res.render('error', { title: 'Save the Zebras',
						errMessage: strMessage,
						url : url});
})

async function getAssistNumbers(userId) {
   try {
	const queryAssistsByUserId = 'SELECT COUNT(serial_number_id) FROM repairs WHERE assist_id = $1';
	const queryAssistsByUserIdValues = [userId];
    const { rows } = await db.query(queryAssistsByUserId, queryAssistsByUserIdValues);
	return rows[0].count;
  } catch (err) {
    console.error(err);
    return err;
  }
}

async function getIssuesBySerialNumber(serialNumberId) {
	try {
		const queryIssuesBySerialNumberId = 'SELECT repairs.repair_id, issues.issue_id, issues.issue_description, repairs.user_id, repairs.serial_number_id FROM issues_resolved_on_repair INNER JOIN repairs ON issues_resolved_on_repair.repair_id=repairs.repair_id INNER JOIN issues ON issues_resolved_on_repair.issue_id=issues.issue_id WHERE repairs.serial_number_id=$1';
		const queryIssuesBySerialNumberIdValues = [serialNumberId];
		const { rows } = await db.query(queryIssuesBySerialNumberId, queryIssuesBySerialNumberIdValues);
		return rows;
	} catch (err) {
    console.error(err);
    return err;
  }	
}

async function getUserByUserId(userId) {
	try {
		const queryUserByUserId= 'SELECT first_name, last_name, org_id FROM users WHERE user_id=$1';
		const queryUserByUserIdValues = [userId];
		const { rows } = await db.query(queryUserByUserId, queryUserByUserIdValues);
		return rows[0];
	} catch (err) {
    console.error(err);
    return err;
  }	
}

async function getPartNamesBySerialNumber(serialNumberId) {
	try {
		const queryPartNamesBySerialNumberId = 'SELECT repairs.repair_id, printer_parts.printer_part_id, printer_parts.printer_part_name, printer_parts.current_cost FROM printer_parts_used_for_repair INNER JOIN repairs ON repairs.repair_id=printer_parts_used_for_repair.repair_id INNER JOIN printer_parts ON printer_parts.printer_part_id=printer_parts_used_for_repair.printer_part_id WHERE repairs.serial_number_id=$1';
		const queryPartNamesBySerialNumberIdValues = [serialNumberId];
		const { rows } = await db.query(queryPartNamesBySerialNumberId, queryPartNamesBySerialNumberIdValues);
		return rows;
	} catch (err) {
    console.error(err);
    return err;
  }	
}

app.get('/user', async (req, res) => {
  let passedVariable = req.query.username;
  let assistNumber = await getAssistNumbers(passedVariable);
  let user = await getUserByUserId(passedVariable);
  try {
	const queryPrintersByUserId = 'SELECT repair_id, repairs.serial_number_id, printer_types.printer_type_name, user_id, printer_location, station_number, repair_cost, money_saved, date_time_fixed FROM repairs INNER JOIN printers ON repairs.serial_number_id = printers.serial_number_id INNER JOIN printer_types ON printers.printer_type_id = printer_types.printer_type_id WHERE user_id = $1 ORDER BY repair_id';
	const queryPrintersByUserIdValues = [passedVariable];
    const { rows } = await db.query(queryPrintersByUserId, queryPrintersByUserIdValues);
	console.log(JSON.stringify(rows));
	if (rows.length == 0) {
		res.redirect('/error?username=DNE');
	}
	res.render('user', { rows: JSON.stringify(rows), userId: passedVariable, assistNumber: assistNumber, firstName : user.first_name, lastName : user.last_name, orgId : user.org_id });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
})

app.get('/printer', async (req, res) => {
  let passedVariable = req.query.serial;
  const queryRepairsBySerialNumberId = 'SELECT repair_id, repairs.serial_number_id, printer_types.printer_type_name, user_id, printer_location, station_number, repair_cost, money_saved, comments, date_time_fixed, printers.warranty_start_date, printers.warranty_end_date, printers.is_active FROM repairs INNER JOIN printers ON repairs.serial_number_id = printers.serial_number_id INNER JOIN printer_types ON printers.printer_type_id = printer_types.printer_type_id WHERE repairs.serial_number_id = $1 ORDER BY repair_id';
  const queryRepairsBySerialNumberIdValues = [passedVariable];
  try {
  const { rows } = await db.query(queryRepairsBySerialNumberId, queryRepairsBySerialNumberIdValues);
  let issueRows = await getIssuesBySerialNumber(passedVariable);
  let partNameRows = await getPartNamesBySerialNumber(passedVariable);
  console.log(issueRows);
	if (rows.length == 0) {
		console.log('say something');
		res.redirect('/error?printer=DNE');
	}
  res.render('printer', { rows: JSON.stringify(rows),
						  issueRows : JSON.stringify(issueRows),
						  partNameRows : JSON.stringify(partNameRows),
                          serial : passedVariable });
  } catch (err) {
	  console.error(err);
	  res.status(500).send('Server Error');
	  
  }
})

app.get('/list', async (req, res) => {
    try {
    const { rows } = await db.query('SELECT repair_id, repairs.serial_number_id, printer_types.printer_type_name, user_id, printer_location, station_number, repair_cost, money_saved, date_time_fixed FROM repairs INNER JOIN printers ON repairs.serial_number_id = printers.serial_number_id INNER JOIN printer_types ON printers.printer_type_id = printer_types.printer_type_id ORDER BY repair_id');
	console.log(JSON.stringify(rows));
	res.render('list', { rows: JSON.stringify(rows) });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.get('/join', async (req, res) => {
    try {
    const { rows } = await db.query('SELECT org_id FROM organizations');
	res.render('join', { rows: JSON.stringify(rows) });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.post('/submit-repair', async (req, res) => {
  let { serialNumberId, userId, printerType, partNameNeeded, printerLocation, stationNumber, issue, assistBy, timeSpentOnTask, comments, repair_cost, money_saved } = req.body;

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
  	// Update Printer with warranty. 
	warranty.setWarrantyOnPrinter(serialNumberId);
  
	const insertIntoRepairs = 'INSERT INTO repairs(serial_number_id, user_id, assist_id, printer_location, station_number, time_worked_on, comments, repair_cost, money_saved) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *';
	const insertIntoRepairsValues = [serialNumberId, userId, assistBy, printerLocation, stationNumber, timeSpentOnTask, comments, repair_cost, money_saved];

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
	res.redirect('/success');
  } catch (err) {	
	if (err.detail.includes('already exists.')) {
		//res.status(500).send(`Error: ${userId} already exists.`);
		console.log('errror Katy');
		let linky = '/error?username=' + userId;
		console.log(linky);
		res.redirect(linky);
	}	
  }
})

// FOR TEST WITHOUT CERTS
/*app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});*/

//FOR PRODUCTION
http.createServer((req, res) => {
    // Redirect to the HTTPS version of the same URL
    res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
    res.end();
}).listen(80, () => {
    console.log('HTTP Server listening on port 80 for redirects');
});

const httpsServer = https.createServer(credentials.credentials, app);
httpsServer.listen(443, () => {
 console.log('HTTPS Server running on port 443');
});