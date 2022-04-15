const mysql = require("mysql2/promise");
const config = require("../../config.js");


// 更新処理
updateTask = async function(id, reqBody){
let connection = null;
console.log(id);
  try {
    connection = await mysql.createConnection(config.dbSetting);
    // SQL記述
    const sql = "UPDATE t_task SET task_name=?,deadline=?,task_status=?,category_id=?,updated_at=? WHERE id=?";
    const now = new Date();
    let data = [reqBody.task_name, reqBody.deadline, reqBody.task_status, reqBody.category_id, now, id];
    const [rows, fields] = await connection.query(sql, data);
    return rows;
  } catch (error) {
    console.log(error);
  } finally {
    connection.end();
  }
}

exports.updateTask = updateTask;