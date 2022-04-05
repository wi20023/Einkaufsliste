'use strict';

const express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');

// Database
const mysql = require('mysql');

// Database1 connection info for EinkaufslisteDB - used from environment variables
var dbInfo = {
    connectionLimit : 50,
    host: process.env.MYSQL_HOSTNAME,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
};

//Database2 connection info for LoginDB
var dbInfo2 = {
    connectionLimit : 50,
    host: process.env.MYSQL_HOSTNAME2,
    user: process.env.MYSQL_USER2,
    password: process.env.MYSQL_PASSWORD2,
    database: process.env.MYSQL_DATABASE2
};

var connection = mysql.createPool(dbInfo);
console.log("Conecting to EinkaufslisteDB...");
// connection.connect(); <- connect not required in connection pool

var connection2 = mysql.createPool(dbInfo2);
console.log("Conecting to LoginDB...");

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


// Constants
const PORT = process.env.PORT || 8080;
const HOST = '0.0.0.0';

// App
var app = express();

// Features for JSON Body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Entrypoint - call it with: http://localhost:8080/ -> redirect you to http://localhost:8080/static
app.get('/', (req, res) => {
    console.log("Got a request and redirect it to the static page");
    // redirect will send the client to another path / route. In this case to the static route.
    res.redirect('/static/mainPage.html');
});

// Login GET Path - call it with: http://localhost:8080/login.html
// Wird der Pfad benötigt?
// app.get('/login.html', (req, res) => {
//     res.redirect('/login.html');
// });

// Register GET Path - call it with: http://localhost:8080/register.html
// Wird der Pfad benötigt?
// app.get('/register.html', (req, res) => {
//     res.redirect('/register.html');
// });


//Login - Error: Cannot find module 'express-session'
app.use(session({
	secret: '12345',
	resave: true,
	saveUninitialized: true
}));

app.get('/', function(request, response) {
	response.sendFile(path.join('/login.html'));
});

app.post('/login', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
	if (username && password) {
		connection2.query('SELECT * FROM user WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
				response.redirect('/mainPage.html');
			} else {
				response.send('Benutzername oder Passwort nicht korrekt!');
			}			
			response.end();
		});
	} else {
		response.send('Bitte Benutzername und Passwort eingeben!');
		response.end();
	}
});

app.get('/mainPage', function(request, response) {
	if (request.session.loggedin) {
		response.send('Willkommen zurück, ' + request.session.username + '!');
	} else {
		response.send('Bitte melde dich zuerst an!');
	}
	response.end();
});

// ###################### LoginDB (user) ######################

// GET path for database
// app.get('/login', (req, res) => {
//     // Prepare the get query
//     // connection.query("SELECT * FROM `user` ;", function (error, results, fields) {
//         // if (typeof req.body !== "undefined" && typeof req.body.username !== "undefined" && typeof req.body.password !== "undefined") {
//         var username = req.body.username;
//         var password = req.body.password;
//         connection2.query('SELECT * FROM user WHERE username = ? AND password = ?', [username, password], function(err, rows, fields) {
//         if (error) {
//             // we got an errror - inform the client
//             console.error(error); // <- log error in server
//             res.status(500).json(error); // <- send to client
//         } else {
//             // we got no error - send it to the client
//             console.log('Success answer from DB: ', results); // <- log results in console
//             // INFO: Here could be some code to modify the result
//             res.status(200).json(results); // <- send it to client
//         }
//     });
// });


// POST path for database - Register
app.post('/register', (req, res) => {
    // This will add a new row. So we're getting a JSON from the webbrowser which needs to be checked for correctness and later
    // it will be added to the database with a query.
    if (typeof req.body !== "undefined" && typeof req.body.username !== "undefined" && typeof req.body.password !== "undefined") {
        // The content looks good, so move on
        // Get the content to local variables:
        var username = req.body.username;
        var password = req.body.password;
        console.log("Client send database insert request with `username`: " + username + " ; password: " + password ); // <- log to server
    
        connection2.query("INSERT INTO `user` (`id`, `username`, `password`, `created_at`) VALUES (NULL, '" + username + "', '" + password + "', current_date());", function (error, results, fields) {
        // SQL-Injection vermeiden:  
        // connection.query("INSERT INTO 'user' (`id`, `user`, `password`, `created_at`) VALUES (NULL, '" + ? + "', '" + ? + "', current_date());") , [
        // req.body.user,
        // req.body.password
        //], function (error, results, fields) {       
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
    }
    else {
        console.error("Client send no correct data!")
        // Set HTTP Status -> 400 is client error -> and send message
        res.status(400).json({ message: 'This function requries a body with "username" and "password"' });
    }
});
// ###################### DATABASE PART END (user) ######################


// ###################### DATABASE PART (mainList) ######################
// GET path for database
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

// DELETE path for database
app.delete('/mainList/:id', (req, res) => {
    let id = req.params.id; // <- load the ID from the path
    console.log("Request to delete Item: " + id); // <- log for debugging

    // Actual executing the query to delete it from the server
    // Prevent SQL-Injection:  
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
            // INFO: Here can be some checks of modification of the result
            res.status(200).json(results); // <- send it to client
        }
    });
});

// POST path for database insert
app.post('/mainList', (req, res) => {
    if (typeof req.body !== "undefined" && typeof req.body.title !== "undefined" && typeof req.body.quantity !== "undefined" && typeof req.body.unit !== "undefined") {

        // Get the content to local variables:
        var title = req.body.title;
        var quantity = req.body.quantity;
        var unit = req.body.unit;
        console.log("Client send database insert request with `title`: " + req.body.title + " ; quantity: " + req.body.quantity + " ; unit: " + req.body.unit ); // <- log to server
    
        // Actual executing the query. Please keep in mind that this is for learning and education.
        // In real production environment, this has to be secure for SQL injection!
        connection.query("INSERT INTO `mainList` (`id`, `title`, `quantity`, `unit`, `created_at`) VALUES (NULL, '" + title + "', '" + quantity + "', '" + unit + "', current_date());", function (error, results, fields) {
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
            

            // Prevent SQL-Injection:
    //         connection.query("INSERT INTO 'mainList' (`id`, `title`, `quantity`, `unit`, `created_at`) VALUES (NULL, '?', '?', '?', current_date());") , [
    //         req.body.title,
    //         req.body.quantity,
    //         req.body.unit
    //         ], function (error, results, fields) {       
    //             if (error) {
    //                 // we got an errror - inform the client
    //                 console.error(error); // <- log error in server
    //                 res.status(500).json(error); // <- send to client
    //             } else {
    //                 // Everything is fine with the query
    //                 console.log('Success answer: ', results); // <- log results in console
    //                 // INFO: Here can be some checks of modification of the result
    //                 res.status(200).json(results); // <- send it to client
    //             }
    //         };
    //     } else {
    //         // There is nobody with a title nor description
    //         console.error("Client send no correct data!")
    //         // Set HTTP Status -> 400 is client error -> and send message
    //         res.status(400).json({ message: 'This function requries a body with "title", "quantity" and "unit"' });
    //     }
    // });

// ###################### DATABASE PART END (mainList) ######################


// ###################### DATABASE PART (list2) ######################
// GET path for database
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
            // INFO: Here could be some code to modify the result
            res.status(200).json(results); // <- send it to client
        }
    });
});

// DELETE path for database
app.delete('/list2/:id', (req, res) => {
    let id = req.params.id; // <- load the ID from the path
    console.log("Request to delete Item: " + id); // <- log for debugging

    // Actual executing the query to delete it from the server
    // Prevent SQL-Injection: 
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

// POST path for database
app.post('/list2', (req, res) => {
    // This will add a new row. So we're getting a JSON from the webbrowser which needs to be checked for correctness and later
    // it will be added to the database with a query.
    if (typeof req.body !== "undefined" && typeof req.body.title !== "undefined" && typeof req.body.quantity !== "undefined" && typeof req.body.unit !== "undefined") {
        // The content looks good, so move on
        // Get the content to local variables:
        var title = req.body.title;
        var quantity = req.body.quantity;
        var unit = req.body.unit;
        console.log("Client send database insert request with `title`: " + title + " ; quantity: " + quantity + " ; unit: " + unit ); // <- log to server

        connection.query("INSERT INTO `list2` (`id`, `title`, `quantity`, `unit`, `created_at`) VALUES (NULL, '" + title + "', '" + quantity + "', '" + unit + "', current_date());", function (error, results, fields) {     
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

// DELETE path for database
app.delete('/list3/:id', (req, res) => {
    let id = req.params.id; // <- load the ID from the path
    console.log("Request to delete Item: " + id); // <- log for debugging

    // Actual executing the query to delete it from the server
    // Prevent SQL-Injection: 
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

// POST path for database
app.post('/list3', (req, res) => {
    // This will add a new row. So we're getting a JSON from the webbrowser which needs to be checked for correctness and later
    // it will be added to the database with a query.
    if (typeof req.body !== "undefined" && typeof req.body.title !== "undefined" && typeof req.body.quantity !== "undefined" && typeof req.body.unit !== "undefined") {
        // The content looks good, so move on
        // Get the content to local variables:
        var title = req.body.title;
        var quantity = req.body.quantity;
        var unit = req.body.unit;
        console.log("Client send database insert request with `title`: " + title + " ; quantity: " + quantity + " ; unit: " + unit ); // <- log to server
    
        connection.query("INSERT INTO `list3` (`id`, `title`, `quantity`, `unit`, `created_at`) VALUES (NULL, '" + title + "', '" + quantity + "', '" + unit + "', current_date());", function (error, results, fields) {
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
