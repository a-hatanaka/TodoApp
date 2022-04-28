const mysql = require("mysql2/promise");
const config = require("../config.js");

getUsers = async function () {
  let connection = null;
  try {
    connection = await mysql.createConnection(config.dbSetting);
    // SQL記述
    const sql = "SELECT * FROM users";
    let data = [];
    const [rows, fields] = await connection.query(sql, data);
    return rows;
  } catch (error) {
    console.log(error);
  } finally {
    connection.end();
  }
};

createUser = async function (reqBody) {
  let connection = null;
  try {
    connection = await mysql.createConnection(config.dbSetting);
    // SQL記述
    const sql =
      "INSERT INTO users (userId,name,email,password) values(?,?,?,?)";
    let data = [null, reqBody.userName, reqBody.email, reqBody.password];
    const [rows, fields] = await connection.query(sql, data);
    return rows;
  } catch (error) {
    console.log(error);
  } finally {
    connection.end();
  }
};

loginUser = async function (reqBody) {
  let connection = null;
  try {
    connection = await mysql.createConnection(config.dbSetting);
    // SQL記述
    console.log(reqBody);
    const sql = "SELECT * FROM users";
    let data = [reqBody.email];
    const [rows, fields] = await connection.query(sql, data);
    if (rows.length === 0) {
      return ["存在しないemailです"];
    }
    if (rows[0].password == reqBody.password) {
      console.log();
      return { loginId: rows[0].userId, loginName: rows[0].name };
    } else {
      return [`Login failed`];
    }
  } catch (error) {
    console.log(error);
  } finally {
    connection.end();
  }
};

exports.getUsers = getUsers;
exports.createUser = createUser;
exports.loginUser = loginUser;
