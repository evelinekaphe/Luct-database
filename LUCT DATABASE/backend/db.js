// db.js - Simple MySQL connection
const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'luct_database'
});

connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL Database!');
});

module.exports = connection;