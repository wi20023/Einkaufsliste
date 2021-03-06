'use strict';

const express = require('express');
//required for Login
var session = require('express-session');
var path = require('path');
// middleware
var bodyParser = require('body-parser');
// Hash passwords when new user will register
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

// Check the connection for EinkauslisteDB
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

// Check the connection for LoginDB
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

//Entrypoint - call it with: http://localhost:8080/
app.get('/', (req, res) => {
    console.log("Got a request and redirect it to the static page");
    res.redirect('/static/mainPage.html');
});

//###################### Login (LoginDB; user) ######################
app.use(session({
	secret: '12345',
	resave: false,
	saveUninitialized: true,
    Cookie: {
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Poth path for database2 LoginDB, SELECT FROM user
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
                req.session.loggedin = false;
                // we got an errror - inform the client
                console.error(error); // <- log error in server
                // If username does not exist redirect to login form
                res.redirect('/static/login.html');
            } else if (results.length > 0) {
            // get password for result
            var checkpass = results[0].password;
            //Compare send password and hashed password
            const doesPasswordMatch = bcrypt.compareSync(password, checkpass);
                // Check if user sent the correct password for the username      
                if(doesPasswordMatch == true && results.length > 0) {
                    // store or access session data,
                    req.session.loggedin = true;
                    req.session.username = username;

                    function SetName() {
                        var name = req.session.username;
                        '<%Session["name"] = "' + name + '"; %>';
                        alert('<%=Session["name"] %>');
                    }

                    // If username and password does match, redirect to index.html
                    res.redirect('/static/index.html');
			} else {
                req.session.loggedin = false;
                // we got an errror - inform the client
                console.error(error); // <- log error in server
                // If username does not exist or password is wrong, redirect to login form
                res.redirect('/static/login.html');
			}
        }						
		});
        }
});
// ###################### Login end (LoginDB; user)  ######################

// ###################### Register (LoginDB; user)  ######################
// POST path for database2 LoginDB, INSERT INTO user
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
// ###################### Register (LoginDB; user) ######################

// ###################### DATABASE PART (EinkaufslisteDB; mainList) ######################
// GET path for database EinkaufslisteDB, SELECT FROM mainList
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

// Path for database EinkaufslisteDB, DELETE FROM mainList
app.delete('/mainList/:id', (req, res) => {
    let id = req.params.id; // <- load the ID from the path
    console.log("Request to delete Item: " + id); // <- log for debugging

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

// POST path for database EinkaufslisteDB, INSERT INTO mainList
app.post('/mainList', (req, res) => {
    if (typeof req.body !== "undefined" && typeof req.body.title !== "undefined" && typeof req.body.quantity !== "undefined" && typeof req.body.unit !== "undefined" && typeof req.body.note !== "undefined") {

        // Get the content to local variables:
        var title = req.body.title;
        var quantity = req.body.quantity;
        var unit = req.body.unit;
        var note = req.body.note;
        console.log("Client send database insert request with `title`: " + req.body.title + " ; quantity: " + req.body.quantity + " ; unit: " + req.body.unit + " ; note: " + req.body.note); // <- log to server

        // Prepare the insert query and prevent SQL-Injection: 
        connection.query("INSERT INTO `mainList` (`id`, `title`, `quantity`, `unit`, `note`, `created_at`) VALUES (NULL, ?, ?, ?, ?, current_date());",[
            title, quantity, unit, note
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

// POST path for database update
app.put('/update/', (req, res) => {
    if (typeof req.body !== "undefined" && typeof req.body.quantity !== "undefined" && typeof req.body.unit !== "undefined" && typeof req.body.note !== "undefined") {

        // Get the content to local variables:
        var id = req.body.id;
        var quantity = req.body.quantity;
        var unit = req.body.unit;
        var note = req.body.note;
        console.log("Client send database update request with quantity: " + req.body.quantity + " ; unit: " + req.body.unit + " ; note: " + req.body.note); // <- log to server

        connection.query("UPDATE `mainList` SET `quantity` = ?, `unit` = ?, `note` = ?, `created_at` = current_date() WHERE `mainList`.`id` = ?", [
            quantity, 
            unit, 
            note, 
            id
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
        // There value of data is wrong
        console.error("Client send no correct data!")
        // Set HTTP Status -> 400 is client error -> and send message
        res.status(400).json({ message: 'This function requries a body with "title", "quantity" and "unit"' });
    }
}); 
// ###################### DATABASE PART END (EinkaufslisteDB; mainList) ######################


// ###################### DATABASE PART (EinkaufslisteDB; Drogerieprodukte) ######################
// GET path for database EinkaufslisteDB, SELECT * FROM Drogerieprodukte
app.get('/Drogerieprodukte', (req, res) => {
    console.log("Request to load all entries from mainList");
    // Prepare the get query
    connection.query("SELECT * FROM `Drogerieprodukte`;", function (error, results, fields) {
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

// Path for database EinkaufslisteDB DELETE FROM Drogerieprodukte
app.delete('/Drogerieprodukte/:id', (req, res) => {
    let id = req.params.id; // <- load the ID from the path
    console.log("Request to delete Item: " + id); // <- log for debugging

    // Actual executing the query to delete it from the server
    // Prepare the delete query and prevent SQL-Injection: 
    connection.query("DELETE FROM `Drogerieprodukte` WHERE `id` = ?", [
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

// POST path for database EinkaufslisteDB, INSERT INTO Drogerieprodukte
app.post('/Drogerieprodukte', (req, res) => {
    if (typeof req.body !== "undefined" && typeof req.body.title !== "undefined" && typeof req.body.quantity !== "undefined" && typeof req.body.unit !== "undefined" && typeof req.body.note !== "undefined") {

        // Get the content to local variables:
        var title = req.body.title;
        var quantity = req.body.quantity;
        var unit = req.body.unit;
        var note = req.body.note;
        console.log("Client send database insert request with `title`: " + req.body.title + " ; quantity: " + req.body.quantity + " ; unit: " + req.body.unit + " ; note: " + req.body.note); // <- log to server

        // Prepare the insert query and prevent SQL-Injection: 
        connection.query("INSERT INTO `Drogerieprodukte` (`id`, `title`, `quantity`, `unit`, `note`, `created_at`) VALUES (NULL, ?, ?, ?, ?, current_date());",[
            title, quantity, unit, note
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
// PUT path for database update
app.put('/update_Drogerieprodukte/', (req, res) => {
    if (typeof req.body !== "undefined" && typeof req.body.quantity !== "undefined" && typeof req.body.unit !== "undefined" && typeof req.body.note !== "undefined") {

        // Get the content to local variables:
        var id = req.body.id;
        var quantity = req.body.quantity;
        var unit = req.body.unit;
        var note = req.body.note;
        console.log("Client send database update request with quantity: " + req.body.quantity + " ; unit: " + req.body.unit + " ; note: " + req.body.note); // <- log to server

        connection.query("UPDATE `Drogerieprodukte` SET `quantity` = ?, `unit` = ?, `note` = ?, `created_at` = current_date() WHERE `Drogerieprodukte`.`id` = ?", [
            quantity, 
            unit, 
            note, 
            id
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
        // There value of data is wrong
        console.error("Client send no correct data!")
        // Set HTTP Status -> 400 is client error -> and send message
        res.status(400).json({ message: 'This function requries a body with "title", "quantity" and "unit"' });
    }
}); 
// ###################### DATABASE PART END (EinkaufslisteDB; Drogerieprodukte) ######################

// ###################### DATABASE PART (EinkaufslisteDB; Haustierbedarf) ######################
// GET path for database EinkaufslisteDB; SELECT from Haustierbedarf
app.get('/Haustierbedarf', (req, res) => {
    console.log("Request to load all entries from mainList");
    // Prepare the get query
    connection.query("SELECT * FROM `Haustierbedarf`;", function (error, results, fields) {
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

// Path for database EinkaufslisteDB, DELETE FROM Haustierbedarf
app.delete('/Haustierbedarf/:id', (req, res) => {
    let id = req.params.id; // <- load the ID from the path
    console.log("Request to delete Item: " + id); // <- log for debugging

    // Prepare the delete query and prevent SQL-Injection:  
    connection.query("DELETE FROM `Haustierbedarf` WHERE `id` = ?", [
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

// POST path for database EunkaufslisteDB, INSERT INTO Haustierbedarf
app.post('/Haustierbedarf', (req, res) => {
    if (typeof req.body !== "undefined" && typeof req.body.title !== "undefined" && typeof req.body.quantity !== "undefined" && typeof req.body.unit !== "undefined" && typeof req.body.note !== "undefined") {

        // Get the content to local variables:
        var title = req.body.title;
        var quantity = req.body.quantity;
        var unit = req.body.unit;
        var note = req.body.note;
        console.log("Client send database insert request with `title`: " + req.body.title + " ; quantity: " + req.body.quantity + " ; unit: " + req.body.unit + " ; note: " + req.body.note); // <- log to server

        // Prepare the insert query and prevent SQL-Injection: 
        connection.query("INSERT INTO `Haustierbedarf` (`id`, `title`, `quantity`, `unit`, `note`, `created_at`) VALUES (NULL, ?, ?, ?, ?, current_date());",[
            title, quantity, unit, note
            ], function (error, results, fields) {
            if (error) {
                // we got an error - inform the client
                console.error(error); // <- log error in server
                res.status(500).json(error); // <- send to client
            } else {
                // Everything is fine with the query
                console.log('Success answer: ', results); // <- log results in console
                res.status(200).json(results); // <- send it to client
            }
            });
        } else {
        // The value of send data is wrong
        console.error("Client send no correct data!")
        // Set HTTP Status -> 400 is client error -> and send message
        res.status(400).json({ message: 'This function requries a body with "title", "quantity" and "unit"' });
    }
}); 

// PUT path for database update
app.put('/update_Haustierbedarf/', (req, res) => {
    if (typeof req.body !== "undefined" && typeof req.body.quantity !== "undefined" && typeof req.body.unit !== "undefined" && typeof req.body.note !== "undefined") {

        // Get the content to local variables:
        var id = req.body.id;
        var quantity = req.body.quantity;
        var unit = req.body.unit;
        var note = req.body.note;
        console.log("Client send database update request with quantity: " + req.body.quantity + " ; unit: " + req.body.unit + " ; note: " + req.body.note); // <- log to server

        connection.query("UPDATE `Haustierbedarf` SET `quantity` = ?, `unit` = ?, `note` = ?, `created_at` = current_date() WHERE `Haustierbedarf`.`id` = ?", [
            quantity, 
            unit, 
            note, 
            id
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
        // There value of data is wrong
        console.error("Client send no correct data!")
        // Set HTTP Status -> 400 is client error -> and send message
        res.status(400).json({ message: 'This function requries a body with "title", "quantity" and "unit"' });
    }
}); 
// ###################### DATABASE PART END (EinkaufslisteDB; Haustierbedarf) ######################


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
