const mysql = require("mysql2/promise");
const config = require("../../config.js");
// 1件のデータ削除処理

deleteTask = async function(id){
    let connection = null;
    try {
        connection = await mysql.createConnection(config.dbSetting);
        // SQL記述
        const data = [id];
        const sql = "DELETE FROM t_task WHERE id=?";
        const [rows, fields] = await connection.query(sql, data);
        return rows;
    } catch (error) {
        console.log(error);
    } finally {
        connection.end();
    }
};

exports.deleteTask = deleteTask;