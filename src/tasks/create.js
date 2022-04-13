const mysql = require("mysql2/promise");
const config = require("../../config.js");

// 新規登録処理
createNewTask = async function(reqBody){
    let connection = null;
    try {
        connection = await mysql.createConnection(config.dbSetting);
        // SQL記述
        const sql = "INSERT INTO t_task (task_name,category_id,deadline) VALUES (?,?,?)";
        const data = [reqBody.task_name,reqBody.category_id,reqBody.deadline];
        const [rows, fields] = await connection.query(sql, data);
        return rows;
    } catch (error) {
        console.log(error);
    } finally {
        connection.end();
    }
    console.log(1);
};

exports.createNewTask = createNewTask;