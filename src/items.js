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

// カテゴリーによるフィルタリング
categoryFilter = async function(category_id){
  let connection = null;
  try {
    connection = await mysql.createConnection(config.dbSetting);
    // SQL記述
    const sql = 'SELECT * FROM t_task WHERE category_id = ?';
    let data = [category_id];
    const [rows, fields] = await connection.query(sql, data);
    return rows;

  } catch (error) {
    console.log(error);
  } finally {
    connection.end();
  }
}

// sort
sortTasks = async function(sortBy){
  let connection = null;
  try {
    connection = await mysql.createConnection(config.dbSetting);
    // SQL記述
    let sql = '';
    switch (sortBy) {
      case '1':
        sql = 'SELECT * FROM t_task ORDER BY deadline ASC';
        break;
      case '2':
        sql = 'SELECT * FROM t_task ORDER BY deadline DESC';
        break;
      default:
        sql = 'SELECT * FROM t_task ORDER BY id';
        break;
    }
    const [rows, fields] = await connection.query(sql);
    console.log(rows);
    return rows;
  } catch (error) {
    console.log(error);
  } finally {
    connection.end();
    console.log('end');
  }
}


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
exports.categoryFilter = categoryFilter;
exports.searchItem = searchItem;
exports.sortTasks = sortTasks;