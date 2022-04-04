'use strict';

const express = require('express');


//Mail-Versand
// var nodemailer = require('nodemailer');
// var connection = 'smtps://user%40gmail.com:pass@smtp.gmail.com';
// var transporter = nodemailer.createTransport(connection);

// var mailOptions = {
//     from: '"Jana" <janakopsch@gmail.com>',
//     to: 'wi20023@lehre.dhbw-stuttgart.de',
//     subject: 'Einkaufsliste',
//     text: 'Unsere Einkaufsliste',
//     attachments: [{
//         filename: 'einkaufsliste.pdf',
//         content: fs.createReadStream('../attachments/einkaufsliste.pdf')
//       }]
//     };
     
//     transporter.sendMail(mailOptions, function(err, info){
//       if (err) throw err;
//       console.log('Message sent: ' + info.response);
//     });

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
const app = express();

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
// Wird der benötigt?
app.get('/login.html', (req, res) => {
    res.redirect('/login.html');
});

// Register GET Path - call it with: http://localhost:8080/register.html
// Wird der benötigt?
app.get('/register.html', (req, res) => {
    res.redirect('/register.html');
});

// POST Path - call it with: POST http://localhost:8080/client_post
// app.post('/client_post', (req, res) => {
//     if (typeof req.body !== "undefined" && typeof req.body.post_content !== "undefined") {
//         var post_content = req.body.post_content;
//         console.log("Client send 'post_content' with content:", post_content)
//         // Set HTTP Status -> 200 is okay -> and send message
//         res.status(200).json({ message: 'I got your message: ' + post_content });
//     }
//     else {
//         // There is no body and post_contend
//         console.error("Client send no 'post_content'")
//         // Set HTTP Status -> 400 is client error -> and send message
//         res.status(400).json({ message: 'This function requries a body with "post_content"' });
//     }
// });

// ###################### LoginDB (user) ######################



// GET path for database
// app.get('/database_user/user', (req, res) => {
app.get('/login', (req, res) => {
    // Prepare the get query
    // connection.query("SELECT * FROM `user` ;", function (error, results, fields) {
        // if (typeof req.body !== "undefined" && typeof req.body.username !== "undefined" && typeof req.body.password !== "undefined") {
        var username = req.body.username;
        var password = req.body.password;
        connection.query('SELECT * FROM user WHERE username = ? AND password = ?', [username, password], function(err, rows, fields) {
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


// POST path for database - Register
app.post('/database_user/user', (req, res) => {
    // This will add a new row. So we're getting a JSON from the webbrowser which needs to be checked for correctness and later
    // it will be added to the database with a query.
    if (typeof req.body !== "undefined" && typeof req.body.username !== "undefined" && typeof req.body.password !== "undefined") {
        // The content looks good, so move on
        // Get the content to local variables:
        var username = req.body.username;
        var password = req.body.password;
        console.log("Client send database insert request with `username`: " + username + " ; password: " + password ); // <- log to server
    
        // Actual executing the query. Please keep in mind that this is for learning and education.
        // In real production environment, this has to be secure for SQL injection!
        connection.query("INSERT INTO `user` (`id`, `username`, `password`, `created_at`) VALUES (NULL, '" + username + "', '" + password + "', current_date());", function (error, results, fields) {
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
app.get('/database/mainList', (req, res) => {
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
app.delete('/database/mainList/:id', (req, res) => {
    // This path will delete an entry. For example the path would look like DELETE '/database/5' -> This will delete number 5
    let id = req.params.id; // <- load the ID from the path
    console.log("Request to delete Item: " + id); // <- log for debugging

    // Actual executing the query to delete it from the server
    // Please keep in mind to secure this for SQL injection!
    connection.query("DELETE FROM `mainList` WHERE `mainList`.`id` = " + id + ";", function (error, results, fields) {
    // SQL-Injection vermeiden:  
    //  connection.query("DELETE FROM `mainList` WHERE `mainList`.`id` = ?", [
    //  req.body.id
    // ], function (error, results, fields) {  
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
app.post('/database/mainList', (req, res) => {
    // This will add a new row. So we're getting a JSON from the webbrowser which needs to be checked for correctness and later
    // it will be added to the database with a query.
    if (typeof req.body !== "undefined" && typeof req.body.title !== "undefined" && typeof req.body.quantity !== "undefined" && typeof req.body.unit !== "undefined") {
        // The content looks good, so move on
        // Get the content to local variables:
        var title = req.body.title;
        var quantity = req.body.quantity;
        var unit = req.body.unit;
        console.log("Client send database insert request with `title`: " + title + " ; quantity: " + quantity + " ; unit: " + unit ); // <- log to server
    
        // Actual executing the query. Please keep in mind that this is for learning and education.
        // In real production environment, this has to be secure for SQL injection!
        connection.query("INSERT INTO `mainList` (`id`, `title`, `quantity`, `unit`, `created_at`) VALUES (NULL, '" + title + "', '" + quantity + "', '" + unit + "', current_date());", function (error, results, fields) {
        // SQL-Injection vermeiden:  
        // connection.query("INSERT INTO 'mainList' (`id`, `title`, `quantity`, `unit`, `created_at`) VALUES (NULL, '" + ? + "', '" + ? + "', '" + ? + "', current_date());") , [
        // req.body.title,
        // req.body.quantity,
        // req.body.unit
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
        // There is nobody with a title nor description
        console.error("Client send no correct data!")
        // Set HTTP Status -> 400 is client error -> and send message
        res.status(400).json({ message: 'This function requries a body with "title", "quantity" and "unit"' });
    }
});
// ###################### DATABASE PART END (mainList) ######################


// ###################### DATABASE PART (list2) ######################
// GET path for database
app.get('/database/list2', (req, res) => {
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
app.delete('/database/list2/:id', (req, res) => {
    // This path will delete an entry. For example the path would look like DELETE '/database/5' -> This will delete number 5
    let id = req.params.id; // <- load the ID from the path
    console.log("Request to delete Item: " + id); // <- log for debugging

    // Actual executing the query to delete it from the server
    // Please keep in mind to secure this for SQL injection!
    connection.query("DELETE FROM `list2` WHERE `list2`.`id` = " + id + ";", function (error, results, fields) {
    // SQL-Injection vermeiden:  
    // connection.query("DELETE FROM `list2` WHERE `id` = ?", [
    // req.body.id
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
});

// POST path for database
app.post('/database/list2', (req, res) => {
    // This will add a new row. So we're getting a JSON from the webbrowser which needs to be checked for correctness and later
    // it will be added to the database with a query.
    if (typeof req.body !== "undefined" && typeof req.body.title !== "undefined" && typeof req.body.quantity !== "undefined" && typeof req.body.unit !== "undefined") {
        // The content looks good, so move on
        // Get the content to local variables:
        var title = req.body.title;
        var quantity = req.body.quantity;
        var unit = req.body.unit;
        console.log("Client send database insert request with `title`: " + title + " ; quantity: " + quantity + " ; unit: " + unit ); // <- log to server
    
        // Actual executing the query. Please keep in mind that this is for learning and education.
        // In real production environment, this has to be secure for SQL injection!
        connection.query("INSERT INTO `list2` (`id`, `title`, `quantity`, `unit`, `created_at`) VALUES (NULL, '" + title + "', '" + quantity + "', '" + unit + "', current_date());", function (error, results, fields) {
        // SQL-Injection vermeiden:  
        // connection.query("INSERT INTO 'list2' (`id`, `title`, `quantity`, `unit`, `created_at`) VALUES (NULL, '" + ? + "', '" + ? + "', '" + ? + "', current_date());") , [
        // req.body.title,
        // req.body.quantity,
        // req.body.unit
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
        // There is nobody with a title nor description
        console.error("Client send no correct data!")
        // Set HTTP Status -> 400 is client error -> and send message
        res.status(400).json({ message: 'This function requries a body with "title", "quantity" and "unit"' });
    }
});
// ###################### DATABASE PART END (list2) ######################

// ###################### DATABASE PART (list3) ######################
// GET path for database
app.get('/database/list3', (req, res) => {
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
app.delete('/database/list3/:id', (req, res) => {
    // This path will delete an entry. For example the path would look like DELETE '/database/5' -> This will delete number 5
    let id = req.params.id; // <- load the ID from the path
    console.log("Request to delete Item: " + id); // <- log for debugging

    // Actual executing the query to delete it from the server
    // Please keep in mind to secure this for SQL injection!
    connection.query("DELETE FROM `list3` WHERE `list3`.`id` = " + id + ";", function (error, results, fields) {
    // SQL-Injection vermeiden:  
    // connection.query("DELETE FROM `list3` WHERE `id` = ?", [
    // req.body.id
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
});

// POST path for database
app.post('/database/list3', (req, res) => {
    // This will add a new row. So we're getting a JSON from the webbrowser which needs to be checked for correctness and later
    // it will be added to the database with a query.
    if (typeof req.body !== "undefined" && typeof req.body.title !== "undefined" && typeof req.body.quantity !== "undefined" && typeof req.body.unit !== "undefined") {
        // The content looks good, so move on
        // Get the content to local variables:
        var title = req.body.title;
        var quantity = req.body.quantity;
        var unit = req.body.unit;
        console.log("Client send database insert request with `title`: " + title + " ; quantity: " + quantity + " ; unit: " + unit ); // <- log to server
    
        // Actual executing the query. Please keep in mind that this is for learning and education.
        // In real production environment, this has to be secure for SQL injection!
        connection.query("INSERT INTO `list3` (`id`, `title`, `quantity`, `unit`, `created_at`) VALUES (NULL, '" + title + "', '" + quantity + "', '" + unit + "', current_date());", function (error, results, fields) {
        // SQL-Injection vermeiden:  
        // connection.query("INSERT INTO 'list3' (`id`, `title`, `quantity`, `unit`, `created_at`) VALUES (NULL, '" + ? + "', '" + ? + "', '" + ? + "', current_date());") , [
        // req.body.title,
        // req.body.quantity,
        // req.body.unit
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
        // There is nobody with a title nor description
        console.error("Client send no correct data!")
        // Set HTTP Status -> 400 is client error -> and send message
        res.status(400).json({ message: 'This function requries a body with "title", "quantity" and "unit"' });
    }
});
// ###################### DATABASE PART END (list3) ######################


// ###################### DATABASE PART (user) ######################
// GET path for database
// app.get('/database/user', (req, res) => {
//     console.log("Request to load all entries from user");
//     // Prepare the get query
//     connection.query("SELECT * FROM `user`;", function (error, results, fields) {
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

// // POST path for database
// app.post('/database/user', (req, res) => {
//     // This will add a new row. So we're getting a JSON from the webbrowser which needs to be checked for correctness and later
//     // it will be added to the database with a query.
//     if (typeof req.body !== "undefined" && typeof req.body.username !== "undefined" && typeof req.body.password !== "undefined") {
//         // The content looks good, so move on
//         // Get the content to local variables:
//         var username = req.body.username;
//         var password = req.body.password;
//         console.log("Client send database insert request with `username`: " + username + " ; password: " + password); // <- log to server
    
//         // Actual executing the query. Please keep in mind that this is for learning and education.
//         // In real production environment, this has to be secure for SQL injection!
//         connection.query("INSERT INTO `user` (`id`, `username`, `password`) VALUES (NULL, '" + username + "', '" + password + "');", function (error, results, fields) {
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
//         });
//     }
//     else {
//         // There is nobody with a title nor description
//         console.error("Client send no correct data!")
//         // Set HTTP Status -> 400 is client error -> and send message
//         res.status(400).json({ message: 'This function requries a body with "title", "quantity" and "unit"' });
//     }
// });
// ###################### DATABASE PART END (user) ######################


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









