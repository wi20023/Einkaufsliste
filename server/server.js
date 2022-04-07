'use strict';

const express = require('express');
//required for Login
var session = require('express-session');
var path = require('path');
// middleware
var bodyParser = require('body-parser');
// Hash passwords
const bcrypt = require('bcryptjs');


// ###################### Database part ######################
const mysql = require('mysql');

// Database1 connection info for EinkaufslisteDB - used from environment variables
var dbInfo = {
    connectionLimit : 50,
    host: process.env.MYSQL_HOSTNAME,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
};

var connection = mysql.createPool(dbInfo);
console.log("Conecting to EinkaufslisteDB...");

// Check the connection
connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
    if (error) throw error; // <- this will throw the error and exit normally
    // check the solution - should be 2
    if (results[0].solution == 2) {
        // everything is fine with the database
        console.log("Database EinkaufslisteDB connected and works");
    } else {
        // connection is not fine - please check
        console.error("There is something wrong with your database connection! Please check");
        process.exit(5); // <- exit application with error code e.g. 5
    }
});

//Database2 connection info for LoginDB
var dbInfo2 = {
    connectionLimit : 50,
    host: process.env.MYSQL_HOSTNAME2,
    user: process.env.MYSQL_USER2,
    password: process.env.MYSQL_PASSWORD2,
    database: process.env.MYSQL_DATABASE2
};

var connection2 = mysql.createPool(dbInfo2);
console.log("Conecting to LoginDB...");

// Check the connection
connection2.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
    if (error) throw error; // <- this will throw the error and exit normally
    // check the solution - should be 2
    if (results[0].solution == 2) {
        // everything is fine with the database
        console.log("Database LoginDB connected and works");
    } else {
        // connection is not fine - please check
        console.error("There is something wrong with your database connection! Please check");
        process.exit(5); // <- exit application with error code e.g. 5
    }
});

// ###################### Database part end ######################

// Constants
const PORT = process.env.PORT || 8080;
const HOST = '0.0.0.0';

// App
var app = express();

// Features for JSON Body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Entrypoint - call it with: http://localhost:8080/ -> redirect you to http://localhost:8080/static/mainPage.html
app.get('/', (req, res) => {
    console.log("Got a request and redirect it to the static page");
    res.redirect('/static/mainPage.html');
});

//###################### Login (LoginDB/database2, user) ######################
app.use(session({
	secret: '12345',
	resave: true,
	saveUninitialized: true
}));

// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());

// Login GET Path - call it with: http://localhost:8080/static/login.html
// Wird der Pfad benötigt?
// app.get('/login.html', (req, res) => {
//     res.redirect('/login.html');
// });

// app.get('/', function(req, res) {
// 	response.sendFile(path.join(__dirname + '/login.html'));
// });

// ###################### Login (LoginDB/database2, user)  ######################
app.post('/login', function(req, res) {
    //Data from Login-Form
	var username = req.body.username;
	var password = req.body.password;
    
	if (username && password) {
        // // Prepare the select query and prevent SQL-Injection: 
		connection2.query('SELECT * FROM user WHERE username = ?', [
            username
            ], function(error, results, fields) {
			console.log(results);
            // if there is no entry in database
            if (results.length == 0) {
                // we got an errror - inform the client
                // console.error(error); // <- log error in server
                // res.status(500).json(error); // <- send to client
                // If username does not exist redirect to login form
                res.redirect('/static/login.html');
                res.send('Der eingegebene Benutzername ist nicht korrekt!');
            } else {
            // get password for result
            var checkpass = results[0].password;
            //Compare send password and hashed password
            const doesPasswordMatch = bcrypt.compareSync(password, checkpass);
            
                // Check if user sent the correct password for the username      
                if(doesPasswordMatch == true && results.length > 0) {
                    req.session.loggedin = true;
                    req.session.username = username;
                    res.redirect('/static/index.html');
			// } else {
            //     // we got an errror - inform the client
            //     console.error(error); // <- log error in server
            //     res.status(500).json(error); // <- send to client
            //     // If username does not exist or password is wrong, redirect to login form
            //     res.redirect('/static/login.html');
			// 	// res.send('Das eingegebene Passwort ist nicht korrekt!');
			}
        }						
		});
        }
	// } else {
    //     console.error("Client send no correct data!")
    //     // Set HTTP Status -> 400 is client error -> and send message
    //     res.status(400).json({ message: 'This function requries a body with "username" and "password"' });
	// }
});


// app.get('/static/index.html', function(req, res) {
// 	if (req.session.loggedin) {
// 		res.send('Willkommen zurück, ' + req.session.username + '!');
// 	} else {
// 		res.send('Bitte melde dich zuerst an!');
// 	}
// 	res.end();
// });

// ###################### Login end (LoginDB/database2, user)  ######################

// ###################### Register (LoginDB/database2, user)  ######################

// POST path for database2 - Register
app.post('/register', (req, res) => {
    if (typeof req.body !== "undefined" && typeof req.body.username !== "undefined" && typeof req.body.password !== "undefined") {
        var username = req.body.username;
        var password = req.body.password;
        // Hash password
        const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync());
        console.log("Client send database insert request with `username`: " + username + " ; password: " + hashedPassword ); // <- log to server

        // Prepare the insert Request and prevent SQL-Injection 
        connection2.query("INSERT INTO `user` (`uuid`, `username`, `password`, `created_at`) VALUES (UUID(), ?, ?, current_date());", [
            username, hashedPassword
            ], function (error, results, fields) {   
            if (error) {
                // we got an errror - inform the client
                console.error(error); // <- log error in server
                res.status(500).json(error); // <- send to client
            } else {
                // Everything is fine with the query
                console.log('Success answer: ', results); // <- log results in console
                res.status(200).json(results); // <- send it to client
            }
        });
    }
    else {
        console.error("Client send no correct data!")
        // Set HTTP Status -> 400 is client error -> and send message
        res.status(400).json({ message: 'This function requries a body with "username" and "password"' });
    }
});
// ###################### Register (LoginDB/database2, user) ######################


// ###################### DATABASE PART (mainList) ######################
// GET path for database mainList
app.get('/mainList', (req, res) => {
    console.log("Request to load all entries from mainList");
    // Prepare the get query
    connection.query("SELECT * FROM `mainList`;", function (error, results, fields) {
        if (error) {
            // we got an errror - inform the client
            console.error(error); // <- log error in server
            res.status(500).json(error); // <- send to client
        } else {
            // we got no error - send it to the client
            console.log('Success answer from DB: ', results); // <- log results in console
            // INFO: Here could be some code to modify the result
            res.status(200).json(results); // <- send it to client
        }
    });
});

// DELETE path for database mainList
app.delete('/mainList/:id', (req, res) => {
    let id = req.params.id; // <- load the ID from the path
    console.log("Request to delete Item: " + id); // <- log for debugging

    // Actual executing the query to delete it from the server
    // Prepare the delete query and prevent SQL-Injection:  
     connection.query("DELETE FROM `mainList` WHERE `mainList`.`id` = ?", [
     req.params.id
    ], function (error, results, fields) {  
        if (error) {
            // we got an errror - inform the client
            console.error(error); // <- log error in server
            res.status(500).json(error); // <- send to client
        } else {
            // Everything is fine with the query
            console.log('Success answer: ', results); // <- log results in console
            res.status(200).json(results); // <- send it to client
        }
    });
});

// POST path for database insert into mainList
app.post('/mainList', (req, res) => {
    if (typeof req.body !== "undefined" && typeof req.body.title !== "undefined" && typeof req.body.quantity !== "undefined" && typeof req.body.unit !== "undefined") {

        // Get the content to local variables:
        var title = req.body.title;
        var quantity = req.body.quantity;
        var unit = req.body.unit;
        console.log("Client send database insert request with `title`: " + req.body.title + " ; quantity: " + req.body.quantity + " ; unit: " + req.body.unit ); // <- log to server

        // Prepare the insert query and prevent SQL-Injection: 
        connection.query("INSERT INTO `mainList` (`id`, `title`, `quantity`, `unit`, `created_at`) VALUES (NULL, ?, ?, ?, current_date());",[
            title, quantity, unit
            ], function (error, results, fields) {
            if (error) {
                // we got an errror - inform the client
                console.error(error); // <- log error in server
                res.status(500).json(error); // <- send to client
            } else {
                // Everything is fine with the query
                console.log('Success answer: ', results); // <- log results in console
                res.status(200).json(results); // <- send it to client
            }
            });
        } else {
        // There is nobody with a title nor description
        console.error("Client send no correct data!")
        // Set HTTP Status -> 400 is client error -> and send message
        res.status(400).json({ message: 'This function requries a body with "title", "quantity" and "unit"' });
    }
});  
// ###################### DATABASE PART END (mainList) ######################


// ###################### DATABASE PART (list2) ######################
// GET path for database list2
app.get('/list2', (req, res) => {
    console.log("Request to load all entries from mainList");
    // Prepare the get query
    connection.query("SELECT * FROM `list2`;", function (error, results, fields) {
        if (error) {
            // we got an errror - inform the client
            console.error(error); // <- log error in server
            res.status(500).json(error); // <- send to client
        } else {
            // we got no error - send it to the client
            console.log('Success answer from DB: ', results); // <- log results in console
            res.status(200).json(results); // <- send it to client
        }
    });
});

// DELETE path for database list2
app.delete('/list2/:id', (req, res) => {
    let id = req.params.id; // <- load the ID from the path
    console.log("Request to delete Item: " + id); // <- log for debugging

    // Actual executing the query to delete it from the server
    // Prepare the delete query and prevent SQL-Injection: 
    connection.query("DELETE FROM `list2` WHERE `id` = ?", [
    req.params.id
    ], function (error, results, fields) {  
        if (error) {
            // we got an errror - inform the client
            console.error(error); // <- log error in server
            res.status(500).json(error); // <- send to client
        } else {
            // Everything is fine with the query
            console.log('Success answer: ', results); // <- log results in console
            // INFO: Here can be some checks of modification of the result
            res.status(200).json(results); // <- send it to client
        }
    });
});

// POST path for database list2
app.post('/list2', (req, res) => {
    if (typeof req.body !== "undefined" && typeof req.body.title !== "undefined" && typeof req.body.quantity !== "undefined" && typeof req.body.unit !== "undefined") {
       
        // Get the content to local variables:
        var title = req.body.title;
        var quantity = req.body.quantity;
        var unit = req.body.unit;
        console.log("Client send database insert request with `title`: " + title + " ; quantity: " + quantity + " ; unit: " + unit ); // <- log to server

        // Prepare the insert query and prevent SQL-Injection: 
        connection.query("INSERT INTO `list2` (`id`, `title`, `quantity`, `unit`, `created_at`) VALUES (NULL, ?, ?, ?, current_date());",[
            title, quantity, unit
            ], function (error, results, fields) {
            if (error) {
                // we got an errror - inform the client
                console.error(error); // <- log error in server
                res.status(500).json(error); // <- send to client
            } else {
                // Everything is fine with the query
                console.log('Success answer: ', results); // <- log results in console
                // INFO: Here can be some checks of modification of the result
                res.status(200).json(results); // <- send it to client
            }
        });
    } else {
        // There is nobody with a title nor description
        console.error("Client send no correct data!")
        // Set HTTP Status -> 400 is client error -> and send message
        res.status(400).json({ message: 'This function requries a body with "title", "quantity" and "unit"' });
    }
});
// ###################### DATABASE PART END (list2) ######################

// ###################### DATABASE PART (list3) ######################
// GET path for database
app.get('/list3', (req, res) => {
    console.log("Request to load all entries from mainList");
    // Prepare the get query
    connection.query("SELECT * FROM `list3`;", function (error, results, fields) {
        if (error) {
            // we got an errror - inform the client
            console.error(error); // <- log error in server
            res.status(500).json(error); // <- send to client
        } else {
            // we got no error - send it to the client
            console.log('Success answer from DB: ', results); // <- log results in console
            // INFO: Here could be some code to modify the result
            res.status(200).json(results); // <- send it to client
        }
    });
});

// DELETE path for database list3
app.delete('/list3/:id', (req, res) => {
    let id = req.params.id; // <- load the ID from the path
    console.log("Request to delete Item: " + id); // <- log for debugging

    // Prepare the delete query and prevent SQL-Injection:  
    connection.query("DELETE FROM `list3` WHERE `id` = ?", [
        req.params.id
        ], function (error, results, fields) {  
        if (error) {
            // we got an errror - inform the client
            console.error(error); // <- log error in server
            res.status(500).json(error); // <- send to client
        } else {
            // Everything is fine with the query
            console.log('Success answer: ', results); // <- log results in console
            // INFO: Here can be some checks of modification of the result
            res.status(200).json(results); // <- send it to client
        }
    });
});

// POST path for database lis3
app.post('/list3', (req, res) => {
    if (typeof req.body !== "undefined" && typeof req.body.title !== "undefined" && typeof req.body.quantity !== "undefined" && typeof req.body.unit !== "undefined") {
        
        // Get the content to local variables:
        var title = req.body.title;
        var quantity = req.body.quantity;
        var unit = req.body.unit;
        console.log("Client send database insert request with `title`: " + title + " ; quantity: " + quantity + " ; unit: " + unit ); // <- log to server
    
        // Prepare the insert query and prevent SQL-Injection: 
        connection.query("INSERT INTO `list3` (`id`, `title`, `quantity`, `unit`, `created_at`) VALUES (NULL, ?, ?, ?, current_date());",[
            title, quantity, unit
            ], function (error, results, fields) {
            if (error) {
                // we got an errror - inform the client
                console.error(error); // <- log error in server
                res.status(500).json(error); // <- send to client
            } else {
                // Everything is fine with the query
                console.log('Success answer: ', results); // <- log results in console
                res.status(200).json(results); // <- send it to client
            }
        });
    }
    else {
        // There is nobody with a title nor description
        console.error("Client send no correct data!")
        // Set HTTP Status -> 400 is client error -> and send message
        res.status(400).json({ message: 'This function requries a body with "title", "quantity" and "unit"' });
    }
});
// ###################### DATABASE PART END (list3) ######################


// All requests to /static/... will be redirected to static files in the folder "public"
// call it with: http://localhost:8080/static
app.use('/static', express.static('public'))

// Start the actual server
app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);

// Start database connection
const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}
