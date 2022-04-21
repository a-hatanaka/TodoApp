const mysql = require("mysql2/promise");
const config = require("../../config.js");


/**
 * updateTask
 * 商品情報を更新する処理
 *
 * @returns レスポンス JSON
 */
updateTask = async function(id, reqBody){
<<<<<<< HEAD
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
=======
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
>>>>>>> bf023cdcebe176a299151969f91c59929f1a173c
}

updateStatus = async function(id){
  let connection = null;
  let [task_id,currentStatus] = id.split("-");
  try {
    connection = await mysql.createConnection(config.dbSetting);
    // SQL記述
    let sql;
    let data;
    if(currentStatus==='2' || currentStatus ==='3'){
      sql = "UPDATE t_task SET task_status=1, updated_at= CURRENT_TIMESTAMP  WHERE id=?";
      data = [task_id];
    }else{
      sql = "UPDATE t_task SET task_status=2, updated_at= CURRENT_TIMESTAMP  WHERE id=?";
      data = [task_id];
    }
    const [rows, fields] = await connection.query(sql, data);
    return rows;
  } catch (error) {
    console.log(error);
  } finally {
    connection.end();
  }
};

exports.updateTask = updateTask;
exports.updateStatus = updateStatus;