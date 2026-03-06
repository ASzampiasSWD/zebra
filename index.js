const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const http = require('http');
const https = require('https');
const multer = require('multer');
const app = express();
var pg = require('pg');
const db = require('./db');
const warranty = require('./warranty');
//const credentials = require('./credentials');
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
app.use(favicon(path.join(__dirname, 'public', 'styles', 'favicon.ico')));

// Built-in middleware to parse URL-encoded bodies (form data)
app.use(express.urlencoded({ extended: true }));

// Configure Multer for basic file destination
const upload = multer({ dest: 'uploads/' });

function getFormattedDate(date) {
  let year = date.getFullYear();
  // getMonth() returns 0-11, so add 1 for actual month number (1-12)
  let month = (date.getMonth() + 1).toString().padStart(2, '0');
  let day = date.getDate().toString().padStart(2, '0');

  // Combine the parts in MM-DD-YYYY format
  return `${month}-${day}-${year}`;
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Specify the destination folder
  },
  filename: function (req, file, cb) {
    let today = new Date();
    let arFileName = file.originalname.split('.'); // get extension.
    cb(null, req.body.productName + '_' + getFormattedDate(today) + '.' + arFileName[1]);
  }
});

const uploadCustom = multer({ storage: storage });

app.get('/', async (req, res) => {
	try {
		let printerTypes = await db.query('SELECT printer_type_id, printer_type_name, price FROM printer_types INNER JOIN product_prices ON printer_types.product_price_id=product_prices.product_price_id');
		let activeUsers = await db.query('SELECT user_id FROM users WHERE is_active = TRUE');
		let printerParts = await db.query('SELECT printer_parts_used_for_printer_type.printer_part_id, printer_parts_used_for_printer_type.printer_type_id, printer_part_name, price, popularity_score FROM printer_parts_used_for_printer_type INNER JOIN printer_parts ON printer_parts_used_for_printer_type.printer_part_id=printer_parts.printer_part_id INNER JOIN product_prices ON printer_parts.product_price_id=product_prices.product_price_id ORDER BY popularity_score');
		let issues = await db.query('SELECT * FROM issues ORDER BY popularity_score');
		res.render('index', {
			printer_types: JSON.stringify(printerTypes.rows),
			active_users: JSON.stringify(activeUsers.rows),
			printer_parts: JSON.stringify(printerParts.rows),
			issues: JSON.stringify(issues.rows)
		});
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
		strMessage = 'User ' + passedVariable + ' already exists';
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

	res.render('error', {
		title: 'Save the Zebras',
		errMessage: strMessage,
		url: url
	});
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

async function getOrgByOrgId(orgId) {
	try {
		const queryOrgByOrgId = 'select * FROM organizations WHERE org_id = $1';
		const queryOrgByOrgIdValues = [orgId];
		const { rows } = await db.query(queryOrgByOrgId, queryOrgByOrgIdValues);
		return rows;
	} catch (err) {
		console.error(err);
		return err;
	}
}

async function getProductNames() {
	try {
		const queryProductNames = 'SELECT CAST(printer_type_name AS character varying(255)) AS common_name, CAST(printer_type_id AS character varying(255)) AS title_id FROM printer_types UNION ALL select printer_part_name, printer_part_id  FROM printer_parts';
		const { rows } = await db.query(queryProductNames);
		return rows;
	} catch (err) {
		console.error(err);
		return err;
	}
}

async function getPrinterPartNames() {
	try {
		const queryPrinterPartNames = 'SELECT printer_part_id, printer_part_name, product_prices.price, product_prices.product_price_id, product_prices.start_date, product_prices.end_date FROM printer_parts INNER JOIN product_prices ON printer_parts.product_price_id=product_prices.product_price_id';
		const { rows } = await db.query(queryPrinterPartNames);
		return rows;
	} catch (err) {
		console.error(err);
		return err;
	}
}

async function getPrinterTypes() {
	try {
		const queryPrinterTypes = 'SELECT printer_type_name, printer_type_id, price, printer_types.product_price_id, start_date, end_date FROM printer_types INNER JOIN product_prices ON product_prices.product_price_id=printer_types.product_price_id';
		const { rows } = await db.query(queryPrinterTypes);
		return rows;
	} catch (err) {
		console.error(err);
		return err;
	}
}

async function getUserByUserId(userId) {
	try {
		const queryUserByUserId = 'SELECT * FROM users WHERE user_id=$1';
		const queryUserByUserIdValues = [userId];
		const { rows } = await db.query(queryUserByUserId, queryUserByUserIdValues);
		return rows[0];
	} catch (err) {
		console.error(err);
		return err;
	}
}

async function insertOrganizationByUser(orgId) {
	const upperOrg = orgId.toUpperCase();
	const insertOrgByUser = 'INSERT INTO organizations VALUES ($1, $2, $3, $4, $5, $6) RETURNING *';
	const insertOrgByUserValues = [upperOrg, 'TODO', 'TODO', 'NA', 'N/A', 'N/A'];

	try {
		let dbAnswer = await db.query(insertOrgByUser, insertOrgByUserValues);
		return dbAnswer;
	} catch (err) {
		console.log(err);
		return err;
	}
}

async function getOrgByOrgId(orgId) {
	try {
		const queryOrganizationsByOrgId = 'SELECT * FROM organizations WHERE org_id=$1';
		const queryOrganizationsByOrgIdValues = [orgId];
		const { rows } = await db.query(queryOrganizationsByOrgId, queryOrganizationsByOrgIdValues);
		return rows[0];
	} catch (err) {
		console.error(err);
		return err;
	}
}

async function getUsersByOrgId(orgId) {
	try {
		const queryUserByOrgId = 'SELECT * FROM users WHERE org_id = $1';
		const queryUserByOrgIdValues = [orgId];
		const { rows } = await db.query(queryUserByOrgId, queryUserByOrgIdValues);
		return rows;
	} catch (err) {
		console.error(err);
		return err;
	}
}

async function getTotalRepairsByAllOrgs() {
	try {
		const queryTotalRepairsByOrgs = 'SELECT users.org_id, COUNT(users.org_id), SUM(repair_cost) AS repair_cost, SUM(money_saved) AS money_saved FROM repairs INNER JOIN printers ON repairs.serial_number_id = printers.serial_number_id INNER JOIN printer_types ON printers.printer_type_id = printer_types.printer_type_id INNER JOIN users ON repairs.user_id=users.user_id GROUP BY users.org_id ORDER BY count DESC';
		const { rows } = await db.query(queryTotalRepairsByOrgs);
		return rows;
	} catch (err) {
		console.error(err);
		return err;
	}
}

async function getBestUsersFromAllOrgs() {
	try {
		const queryBestUsersFromAllOrgs = 'SELECT repairs.user_id, COUNT(repair_id) as "total_repairs", SUM(repair_cost) AS repair_cost, SUM(money_saved) AS money_saved, users.org_id FROM repairs INNER JOIN printers ON repairs.serial_number_id = printers.serial_number_id INNER JOIN printer_types ON printers.printer_type_id = printer_types.printer_type_id INNER JOIN users ON repairs.user_id=users.user_id GROUP BY repairs.user_id, users.org_id ORDER BY "total_repairs" DESC';
		const { rows } = await db.query(queryBestUsersFromAllOrgs);
		return rows;
	} catch (err) {
		console.error(err);
		return err;
	}
}

async function getPartNamesBySerialNumber(serialNumberId) {
	try {
		const queryPartNamesBySerialNumberId = 'SELECT repairs.repair_id, printer_parts.printer_part_id, printer_parts.printer_part_name, price FROM printer_parts_used_for_repair INNER JOIN repairs ON repairs.repair_id=printer_parts_used_for_repair.repair_id INNER JOIN printer_parts ON printer_parts.printer_part_id=printer_parts_used_for_repair.printer_part_id INNER JOIN product_prices ON printer_parts.product_price_id = product_prices.product_price_id WHERE repairs.serial_number_id=$1';
		const queryPartNamesBySerialNumberIdValues = [serialNumberId];
		const { rows } = await db.query(queryPartNamesBySerialNumberId, queryPartNamesBySerialNumberIdValues);
		return rows;
	} catch (err) {
		console.error(err);
		return err;
	}
}

/*app.get('/admin', async (req, res) => {
    let productNameRows = await getProductNames();
    let printerPartNames = await getPrinterPartNames();
    let printerTypes = await getPrinterTypes();
    res.render('admin', { productNames : JSON.stringify(productNameRows),
                          printerPartNames : JSON.stringify(printerPartNames),
                          printerTypes : JSON.stringify(printerTypes) });

});*/

app.get('/guide', async (req, res) => {
    try {
        res.render('guide', { });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.get('/user', async (req, res) => {
	let passedVariable = req.query.username;
	let assistNumber = await getAssistNumbers(passedVariable);
	let user = await getUserByUserId(passedVariable);
	try {
		const queryPrintersByUserId = 'SELECT repair_id, repairs.serial_number_id, printer_types.printer_type_name, user_id, printer_location, station_number, repair_cost, money_saved, date_time_fixed FROM repairs INNER JOIN printers ON repairs.serial_number_id = printers.serial_number_id INNER JOIN printer_types ON printers.printer_type_id = printer_types.printer_type_id WHERE user_id = $1 ORDER BY repair_id DESC';
		const queryPrintersByUserIdValues = [passedVariable];
		const { rows } = await db.query(queryPrintersByUserId, queryPrintersByUserIdValues);
		if (user == undefined) {
			res.redirect('/error?username=DNE');
		}
		res.render('user', { rows: JSON.stringify(rows), 
                            userId: passedVariable, 
                            assistNumber: assistNumber, 
                            firstName: user.first_name, 
                            lastName: user.last_name, 
                            orgId: user.org_id,
							created_at : getFormattedDate(user.created_at) });
	} catch (err) {
		console.error(err);
		res.status(500).send('Server Error');
	}
})

app.get('/printer', async (req, res) => {
	let serial = req.query.serial;
	const queryRepairsBySerialNumberId = 'SELECT repair_id, repairs.serial_number_id, printer_types.printer_type_name, user_id, printer_location, station_number, repair_cost, money_saved, comments, date_time_fixed, printers.warranty_start_date, printers.warranty_end_date, printers.is_active FROM repairs INNER JOIN printers ON repairs.serial_number_id = printers.serial_number_id INNER JOIN printer_types ON printers.printer_type_id = printer_types.printer_type_id WHERE repairs.serial_number_id = $1 ORDER BY repair_id';
	const queryRepairsBySerialNumberIdValues = [serial];
	try {
		const { rows } = await db.query(queryRepairsBySerialNumberId, queryRepairsBySerialNumberIdValues);
		let issueRows = await getIssuesBySerialNumber(serial);
		let partNameRows = await getPartNamesBySerialNumber(serial);

		if (rows.length == 0) {
			res.redirect('/error?printer=DNE');
		}
		res.render('printer', {
			rows: JSON.stringify(rows),
			issueRows: JSON.stringify(issueRows),
			partNameRows: JSON.stringify(partNameRows),
			serial: serial
		});
	} catch (err) {
		console.error(err);
		res.status(500).send('Server Error');
	}
})

app.get('/org', async (req, res) => {
	let orgId = req.query.orgid;
	const queryRepairsByOrgId = 'select repair_id, repairs.serial_number_id, printer_types.printer_type_name, users.user_id, users.org_id, repairs.printer_location, repairs.station_number, repair_cost, money_saved, date_time_fixed FROM repairs INNER JOIN users on users.user_id=repairs.user_id INNER JOIN organizations ON organizations.org_id=users.org_id INNER JOIN printers ON printers.serial_number_id = repairs.serial_number_id INNER JOIN printer_types ON printer_types.printer_type_id=printers.printer_type_id WHERE organizations.org_id = $1 ORDER BY date_time_fixed DESC;';
	const queryRepairsByOrgIdValues = [orgId];
	try {
		const { rows } = await db.query(queryRepairsByOrgId, queryRepairsByOrgIdValues);
        let userRows = await getUsersByOrgId(orgId);
        let orgRow = await getOrgByOrgId(orgId);
        let repairRow = await getTotalRepairsByAllOrgs();

		if (rows.length == 0) {
			res.redirect('/error?org=DNE');
		}
		res.render('org', {
			rows: JSON.stringify(rows),
            userRows : JSON.stringify(userRows),
            orgRow : orgRow,
            repairRow : JSON.stringify(repairRow),
            orgId: orgId.toString()
		});
	} catch (err) {
		console.error(err);
		res.status(500).send('Server Error');
	}
})

app.get('/list', async (req, res) => {
	try {
		const { rows } = await db.query('SELECT repair_id, repairs.serial_number_id, printer_types.printer_type_name, repairs.user_id, users.org_id, printer_location, station_number, repair_cost, money_saved, date_time_fixed FROM repairs INNER JOIN printers ON repairs.serial_number_id = printers.serial_number_id INNER JOIN printer_types ON printers.printer_type_id = printer_types.printer_type_id INNER JOIN users ON repairs.user_id=users.user_id ORDER BY repair_id DESC');
		res.render('list', { rows: JSON.stringify(rows) });
	} catch (err) {
		console.error(err);
		res.status(500).send('Server Error');
	}
});

app.get('/leaderboard', async (req, res) => {
	try {
		let repairRows = await getTotalRepairsByAllOrgs();
        let userRows = await getBestUsersFromAllOrgs();
        res.render('leaderboard', { repairRows: JSON.stringify(repairRows),
                                    userRows : JSON.stringify(userRows) });
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

app.post('/submit-price', uploadCustom.single('file'), async (req, res) => {
    let { productName, price, referer, screenshot  } = req.body;
    console.log(req.file);
    console.log(req.body);
    console.log(productName);
    console.log(price);
    console.log(referer);
    console.log(screenshot);
    res.status(200).send('OK');

});

app.post('/submit-repair', async (req, res) => {
	let { serialNumberId, userId, printerType, partNameNeeded, printerLocation, stationNumber, issue, assistBy, timeSpentOnTask, comments, repair_cost, money_saved } = req.body;

	if (assistBy == "") {
		assistBy = null;
	}
	if (stationNumber == "") {
		stationNumber = null;
	}
    if (timeSpentOnTask == "") {
        timeSpentOnTask = 15;
    }
	if (partNameNeeded == "") {
		partNameNeeded = null;
	} else {
        partNameNeeded = partNameNeeded.split(",");
    }
    if (issue == "") {
        issue = null;
    } else {
        issue = issue.split(",");
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
			await db.query(insertIntoPrinters, insertIntoPrintersValues);
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
		const resInsertIntoRepairs = await db.query(insertIntoRepairs, insertIntoRepairsValues);
		repair_id = resInsertIntoRepairs.rows[0].repair_id;
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
			await db.query(insertIntoIssuesResolved, insertIntoIssuesResolvedValues);
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
		let insertIntoPrinterPartsUsed = 'INSERT INTO printer_parts_used_for_repair(repair_id, printer_part_id) VALUES($1, $2) RETURNING *';
		let insertIntoPrinterPartsUsedValues = [repair_id, arPartNameNeeded[d]];
		try {
			await db.query(insertIntoPrinterPartsUsed, insertIntoPrinterPartsUsedValues);
		} catch (err) {
			console.log(err);
			res.send(err);
		}
	}
	res.redirect('/list');
});

app.post('/submit-new-user', async (req, res) => {
	const { orgId, userId, firstName, lastName } = req.body;
	const lowerCaseUserId = userId.toLowerCase();
	let upperOrg = orgId.toUpperCase();
	let currentOrg = await getOrgByOrgId(upperOrg);

	if (currentOrg == undefined) {
		let dbAnswer = await insertOrganizationByUser(upperOrg);
	}

	const insertUser = 'INSERT INTO users(user_id, org_Id, first_name, last_name) VALUES($1, $2, $3, $4) RETURNING *';
	const insertUserValues = [lowerCaseUserId, upperOrg, firstName, lastName];

	try {
		await db.query(insertUser, insertUserValues);
		res.redirect('/success');
	} catch (err) {
		if (err.detail.includes('already exists.')) {
			let linky = '/error?username=' + userId;
			res.redirect(linky);
		}
	}
})

/*
// FOR TEST WITHOUT CERTS
app.listen(3000, () => {
  console.log(`Example app listening on port 3000!`);
});
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
});*/

const server = http.createServer(app);
server.listen(3000, () => {
	console.log('Server is running on port 3000');
});