var express = require("express");
const items = require("../../src/items");
const create = require("../../src/tasks/create.js");
const del = require("../../src/tasks/delete.js");
const update = require("../../src/tasks/update.js");

var router = express.Router();

/* 商品一覧を取得するルーティング */
router.get("/items", async function (req, res, next) {
  const itemsList = await items.getListItem();
  res.send(itemsList);
});

/*１件の商品情報を取得するルーティング */
router.get("/items/:id", async function (req, res, next) {
  const item = await items.getItem(req.params.id);
  res.send(item);
});

// 今日の日付
router.get("/today", async function(res,res,next){
  console.log(987);
  const todayTasks = await items.getTodayTask();
  res.send(todayTasks);
});

// filtering by category_id
router.get("/category/:category_id", async function(req,res,next){
  const filteredItem = await items.categoryFilter(req.params.category_id);
  res.send(filteredItem);
});

// Sort tasks
router.get("/sort/:sortby", async function(req,res,next){
  const sortedItem = await items.sortTasks(req.params.sortby);
  res.send(sortedItem);
});

// search
router.get("/search/:keyword", async function(req,res,next){
  const searchedItem = await items.searchItem(req.params.keyword);
  res.send(searchedItem);
});

// カレンダー表示用タスク
router.get("/calendar", async function(req,res,next){
  const monthlyTasks = await items.getMonthlyTasks();
  console.log(monthlyTasks);
  res.send(monthlyTasks);
});

// 新規タスク登録
router.post("/tasks", async function(req,res,next){
  const createTask = await create.createNewTask(req.body);
  res.send(createTask);
});


// タスク削除
router.delete("/tasks/:id", async function(req, res, next){
  const deleteTask = await del.deleteTask(req.params.id);
  res.send(deleteTask);
});

// status-completeのタスクを全て削除
router.delete("/deleteAll/completed", async function(req,res,next){
  const deleteCompleted = await del.deleteCompleted();
  res.send(deleteCompleted);
});

// 期限切れのタスクを全て削除
router.delete("/deleteAll/timeout", async function(req,res,next){
  const timeoutTasks = await del.deleteTimeout();
  res.send(timeoutTasks);
});

// タスク情報更新
router.patch("/tasks/:id", async function(req, res, next){
  const updateTask = await update.updateTask(req.params.id, req.body);
  res.send(updateTask);
});

// タスク状態を「完了」にする
router.patch("/status/:id", async function(req,res,next){
  const statusComplete = await update.updateStatus(req.params.id);
  res.send(statusComplete);
});

module.exports = router;
