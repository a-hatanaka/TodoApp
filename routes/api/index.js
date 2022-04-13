var express = require("express");
const items = require("../../src/items");
const create = require("../../src/tasks/create.js");
const del = require("../../src/tasks/delete.js");

var router = express.Router();

/* 商品一覧を取得するルーティング */
router.get("/items", async function (req, res, next) {
  const itemsList = await items.getListItem();
  res.send(itemsList);
});


/*１件の商品情報を取得するルーティング */
router.get("/items/:id", function (req, res, next) {
  const item = items.getItem(req.params.id);
  res.send(item);
});

// 新規タスク登録
router.post("/tasks", function(req,res,next){
  console.log(req.body);
  const createTask = create.createNewTask(req.body);
  res.send(createTask);
});

// タスク削除
router.delete("/tasks/:id", function(req, res, next){
  console.log(req.body);
  const deleteTask = del.deleteTask(req.params.id);
  res.send(deleteTask);
  console.log(1);
});

module.exports = router;
