require("dotenv").config();
const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: process.env.db_host,
  user: process.env.db_user,
  password: process.env.db_password,
  database: process.env.db_name,
});

connection.connect((err) => {
  if (err) {
    console.log("Connection to Database Failed");
    return;
  }
  console.log("Connection to Database Successful");
});

module.exports = connection;