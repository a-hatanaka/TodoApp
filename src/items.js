const mysql = require("mysql2/promise");
const config = require("../config.js");

/**
 * getList
 * 商品一覧を返却する処理
 *
 * @returns レスポンス JSON
 */
getListItem = async function () {
  let connection = null;
  try {
    connection = await mysql.createConnection(config.dbSetting);
    // SQL記述
    const sql = "SELECT * FROM t_task";
    let data = [];
    const [rows, fields] = await connection.query(sql, data);
    return rows;
  } catch (error) {
    console.log(error);
  } finally {
    connection.end();
  }
};

/**
 * getItem
 * 商品情報を１件返却する処理
 *
 * @returns レスポンス JSON
 */
getItem = async function (id) {
  let connection = null;
  try {
    connection = await mysql.createConnection(config.dbSetting);
    // SQL記述
    const sql = "SELECT * FROM t_task WHERE id=?";
    let data = [id];
    const [rows, fields] = await connection.query(sql, data);
    return rows;
  } catch (error) {
    console.log(error);
  } finally {
    connection.end();
  }
};


// タスク検索
searchItem = async function(keyword){
  let connection = null;
  try {
    connection = await mysql.createConnection(config.dbSetting);
    // SQL記述
    const sql = 'SELECT * FROM t_task WHERE task_name LIKE ?';
    keyword = "%" + keyword + "%";
    let data = [keyword];
    const [rows, fields] = await connection.query(sql, data);
    return rows;

  } catch (error) {
    console.log(error);
  } finally {
    connection.end();
  }

}

exports.getListItem = getListItem;
exports.getItem = getItem;
exports.searchItem = searchItem;