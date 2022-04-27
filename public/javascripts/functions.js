function escapeHTML(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

$(function () {
  $(".datepicker").datepicker();
  $(".datepicker").attr("autocomplete", "off");
  $(".datepicker").datepicker("option", "dateFormat", "yy/mm/dd");
});

// タスク一覧取得API
$(async function () {
  $("");
  const data = await httpGet("//" + window.location.host + "/api/items");
  $("#todo-list").empty();
  console.log(data);
  $("#todo-list").append(getList(data));
});

// Get today's tasks
$("#today-tasks").click(async function () {
  click = false;
  const data = await httpGet("//" + window.location.host + "/api/today");
  $("#todo-list").empty();
  $("#todo-list").append("今日が期限のタスクはありません。");
  console.log(data);
  $("#todo-list").append(getList(data));
});

// Get Task Detail
$(document).on("click", ".todo-detail", async function () {
  click = false;
  let detail_id = $(this).data("detail_id");
  let data = await httpGet(
    "//" + window.location.host + "/api/items/" + detail_id
  );
  $("#detail-name").text(`タスク名: ${data[0].task_name}`);
  let dateString;
  if (!data[0].task_deadline) {
    dateString = "なし";
  } else {
    let deadline = new Date(data[0].deadline);
    let year = deadline.getFullYear() + 1;
    let month = deadline.getMonth();
    let date = deadline.getDate();
    dateString = year + "年" + month + "月" + date + "日";
  }
  $("#detail-deadline").text(`期限: ${dateString}`);

  let category_id = data[0].category_id;
  let category;
  switch (category_id) {
    case "1":
      category = "生活";
      break;
    case "2":
      category = "勉強";
      break;
    case "3":
      category = "仕事";
      break;
    case "4":
      category = "趣味";
      break;
    default:
      category = "該当なし";
      break;
  }
  $("#detail-category").text(`カテゴリー: ${category}`);
  let task_status = data[0].task_status;
  switch (task_status) {
    case 1:
      task_status = "完了";
      break;
    case 2:
      task_status = "実施中";
      break;
    case 3:
      task_status = "未実施";
      break;
    default:
      task_status = "不明";
      break;
  }
  $("#detail-status").text(`実施状況: ${task_status}`);
});

// Create New Task
$("#create-task").click(async function () {
  if ($("[name=task_name]").val() === "") {
    alert("タスク名は入力必須です");
    return false;
  }
  const task_name = $("[name=task_name]").val();

  // 日付の値が、「○○○○年○月○日」の場合、ここで「○○○○-○-○」などに置き換え処理
  let deadline = $("[name=deadline]").val();
  deadline = deadline.replace(/(\d+)年(\d+)月(\d+)日/g, "$1-$2-$3");
  deadline = deadline.replace(/(\d+)\/(\d+)\/(\d+)/g, "$1-$2-$3");
  let month = Number(deadline.split("-")[1]);
  if (deadline !== "") {
    deadline += "  23:59:59";
  }
  console.log(deadline);
  // 期限の値に'-','/'が2個登場する場合は、とりあえずは有効な値としてキャッチする。
  // match() は一致する文字が0個の場合、nullを返すが、nullは扱いに困る。よって、空配列[]を入れて、それをカウントさせている。
  if (
    (deadline.match(new RegExp("-", "g")) || []).length === 2 ||
    (deadline.match(new RegExp("/", "g")) || []).length === 2
  ) {
    console.log("It includes 2 '-' or '/'");
    let targetDate = new Date(deadline);
    let now = new Date();
    if (targetDate < now) {
      alert("今日以降の日付を指定してください。");
      inputError("#create-error", "今日以降の日付を指定してください。");
      return false;
    } else if (Number.isNaN(targetDate.getDate())) {
      alert("Its invalid date");
      inputError(
        "#create-error",
        "日付が正しいフォーマットで入力されていません。"
      );
      return false;
    } else if (targetDate.getFullYear() === 1970) {
      inputError("#create-error", "存在しない日付のようです。");
      return false;
    }
  } else if (deadline === "" || deadline === "期限設定なし") {
    deadline = null;
  } else {
    alert("Its invalid date");
    inputError(
      "#create-error",
      "日付が正しいフォーマットで入力されていません。"
    );
    return false;
  }
  const cate_id = $("[name=category_id]").val();
  const data = {
    task_name: task_name,
    deadline: deadline,
    category_id: cate_id,
  };
  const response = await httpPost(
    "//" + window.location.host + "/api/tasks",
    data
  );
  alert("追加完了しました。");
  console.log(response);
  window.location.reload();
});

// カレンダーからタスク追加
$(document).on("click", ".calendar-plus", async function () {
  let year = $(this).data("year");
  let month = $(this).data("month");
  let date = $(this).data("date");
  $("#create-deadline-by-calendar").val(`${year}年${month}月${date}日`);
  return;
});
// カレンダーからの追加を完了させる。
$("#create-task-by-calendar").click(async function () {
  if ($("[name=create-name-by-calendar]").val() === "") {
    alert("タスク名は入力必須です");
    return false;
  }
  const task_name = $("[name=create-name-by-calendar]").val();

  // 日付の値が、「○○○○年○月○日」の場合、ここで「○○○○-○-○」などに置き換え処理
  let deadline = $("[name=create-deadline-by-calendar]").val();
  deadline = deadline.replace(/(\d+)年(\d+)月(\d+)日/g, "$1-$2-$3");
  deadline = deadline.replace(/(\d+)\/(\d+)\/(\d+)/g, "$1-$2-$3");
  let month = Number(deadline.split("-")[1]);
  console.log(month);
  console.log(deadline);
  if (deadline !== "") {
    deadline += "  23:59:59";
  }
  console.log(deadline);
  // 期限の値に'-','/'が2個登場する場合は、とりあえずは有効な値としてキャッチする。
  // match() は一致する文字が0個の場合、nullを返すが、nullは扱いに困る。よって、空配列[]を入れて、それをカウントさせている。
  if (
    (deadline.match(new RegExp("-", "g")) || []).length === 2 ||
    (deadline.match(new RegExp("/", "g")) || []).length === 2
  ) {
    console.log("It includes 2 '-' or '/'");
    let targetDate = new Date(deadline);
    let now = new Date();
    if (targetDate < now) {
      alert("今日以降の日付を指定してください。");
      inputError(
        "#create-error-by-calendar",
        "今日以降の日付を指定してください。"
      );
      return false;
    } else if (Number.isNaN(targetDate.getDate())) {
      alert("Its invalid date");
      inputError(
        "#create-error-by-calendar",
        "日付が正しいフォーマットで入力されていません。"
      );
      return false;
    } else if (
      targetDate.getFullYear() === 1970 ||
      targetDate.getMonth() + 1 !== month
    ) {
      console.log(deadline);
      console.log(month);
      inputError("#create-error-by-calendar", "存在しない日付のようです。");
      return false;
    }
  } else if (deadline === "" || deadline === "期限設定なし") {
    deadline = null;
  } else {
    alert("Its invalid date");
    inputError(
      "#create-error-by-calendar",
      "日付が正しいフォーマットで入力されていません。"
    );
    return false;
  }
  const cate_id = $("[name=create-cate-by-calendar]").val();
  const data = {
    task_name: task_name,
    deadline: deadline,
    category_id: cate_id,
  };
  console.log(data);
  const response = await httpPost(
    "//" + window.location.host + "/api/tasks",
    data
  );
  alert("追加完了しました。");
  console.log(response);
  window.location.reload();
});

// カレンダーからupdate
$(document).on("click", ".calendar-update", async function () {
  let id = $(this).data("id");
  let task = await httpGet("//" + window.location.host + `/api/items/${id}`);
  task = task[0];
  let year, month, date;
  [year, month, date] = task.deadline.split("-");
  date = date.substr(0, 2);
  console.log(date);
  $("[name=update-id-by-calendar]").val(task.id);
  $("[name=update-name-by-calendar]").val(task.task_name);
  $("[name=update-deadline-by-calendar]").val(`${year}年${month}月${date}日`);
  $("[name=update-cate-by-calendar]").val(task.category_id);
  $("[name=update-status-by-calendar]").val(task.task_status);
  $("#delete-by-calendar").data("id", id);
});
// カレンダーからのupdateを完了させる。
$("#update-complete-by-calendar").click(async function () {
  let id = $("[name=update-id-by-calendar]").val();
  let name = $("[name=update-name-by-calendar]").val();
  if (name === "") {
    alert("タスク名は空にできません。");
    $("#exampleModal2").modal("hide");
    return false;
  }
  let deadline = $("[name=update-deadline-by-calendar]").val();
  deadline = deadline.replace(/(\d+)年(\d+)月(\d+)日/g, "$1-$2-$3");
  deadline = deadline.replace(/(\d+)\/(\d+)\/(\d+)/g, "$1-$2-$3");
  let month = Number(deadline.split("-")[1]);
  if (deadline !== "") {
    deadline += "  23:59:59";
  }
  // 期限の値に'-','/'が2個登場する場合は、とりあえずは有効な値としてキャッチする。
  // match() は一致する文字が0個の場合、nullを返すが、nullは扱いに困る。よって、空配列[]を入れて、それをカウントさせている。
  if (
    (deadline.match(new RegExp("-", "g")) || []).length === 2 ||
    (deadline.match(new RegExp("/", "g")) || []).length === 2
  ) {
    console.log("It includes 2 '-' or '/'");
    let targetDate = new Date(deadline);
    let now = new Date();

    if (Number.isNaN(targetDate.getDate())) {
      alert("Its invalid date");
      inputError(
        "#update-error-by-calendar",
        "日付が正しいフォーマットで入力されていません。"
      );
      return false;
    } else if (
      targetDate.getFullYear() === 1970 ||
      targetDate.getMonth() + 1 !== month
    ) {
      inputError("#update-error-by-calendar", "存在しない日付のようです。");
      return false;
    }
  } else if (deadline === "" || deadline === "期限設定なし") {
    deadline = null;
    console.log("ここまできた");
    return false;
  } else {
    alert("Its invalid date");
    inputError(
      "#update-error-by-calendar",
      "日付が正しいフォーマットで入力されていません。"
    );
    return false;
  }
  let cate_id = $("[name=update-cate-by-calendar]").val();
  let status = $("[name=update-status-by-calendar]").val();
  const data = {
    task_name: name,
    category_id: cate_id,
    deadline: deadline,
    task_status: status,
  };

  const response = await httpUpdate(
    "//" + window.location.host + "/api/tasks/" + id,
    data
  );
  alert("更新完了しました。");
  console.log(response);
  window.location.reload();
});

// status change using toggleSwitch
$(document).on("click", ".status-toggle", async function () {
  let doing = false;
  const id = $(this).data("id");
  const status = $(this).data("task_status");
  let response;
  let parentObj = $(this).parent().parent();

  if (doing === false) {
    doing = true;
    // checkedクラスがないとき = 元のstatusが2か3の時
    if (!$(this).hasClass("checked")) {
      console.log("to-comp");
      $(this).addClass("checked");
      $(this).parent().addClass("stripe");
      parentObj.find("i").removeClass("task-uncomplete");
      parentObj.find("i").addClass("task-complete");
      $(this).data("task-status", "1");
      // ${id}- の後ろの数字は、現在のステータスを示す
      response = await httpUpdate(
        "//" + window.location.host + `/api/status/${id}-2`
      );
      console.log(response);
      alert("Good job!");
    } else {
      //checkedクラスがあるとき = 元のstatusが1の時
      console.log("to uncomp");
      $(this).removeClass("checked");
      $(this).parent().removeClass("stripe");
      parentObj.find("i").addClass("task-uncomplete");
      parentObj.find("i").removeClass("task-complete");
      $(this).data("task-status", "2");
      response = await httpUpdate(
        "//" + window.location.host + `/api/status/${id}-1`
      );
      console.log(response);
      alert("Let's do task again!");
    }
    doing = false;
  }
});

// Update
$(document).on("click", ".todo-update", function () {
  click = false;
  $("[name=update_id]").val($(this).data("task_id"));
  $("[name=update_name]").val($(this).data("task_name"));
  $("[name=update_deadline]").val($(this).data("deadline"));
  $("[name=update_cate]").val(
    $(this).data("cate_id") ? $(this).data("cate_id") : "0"
  );
  $("[name=update_status]").val($(this).data("task_status"));
  $("[name=update_id]").val($(this).data("task_id"));
});

// update complete
$("#update-complete").click(async function () {
  let id = $("[name=update_id]").val();
  let name = $("[name=update_name]").val();
  if (name === "") {
    alert("タスク名は空にできません。");
    $("#exampleModal2").modal("hide");
    return false;
  }
  let deadline = $("[name=update_deadline]").val();
  deadline = deadline.replace(/(\d+)年(\d+)月(\d+)日/g, "$1-$2-$3");
  deadline = deadline.replace(/(\d+)\/(\d+)\/(\d+)/g, "$1-$2-$3");
  let month = Number(deadline.split("-")[1]);
  if (deadline !== "") {
    deadline += "  23:59:59";
  }
  // 期限の値に'-','/'が2個登場する場合は、とりあえずは有効な値としてキャッチする。
  // match() は一致する文字が0個の場合、nullを返すが、nullは扱いに困る。よって、空配列[]を入れて、それをカウントさせている。
  if (
    (deadline.match(new RegExp("-", "g")) || []).length === 2 ||
    (deadline.match(new RegExp("/", "g")) || []).length === 2
  ) {
    console.log("It includes 2 '-' or '/'");
    let targetDate = new Date(deadline);
    if (Number.isNaN(targetDate.getDate())) {
      alert("Its invalid date");
      inputError(
        "#update-error",
        "日付が正しいフォーマットで入力されていません。"
      );
      return false;
    } else if (
      targetDate.getFullYear() === 1970 ||
      targetDate.getMonth() + 1 !== month
    ) {
      console.log(targetDate.getMonth() + 1);
      console.log(month);
      inputError("#update-error", "存在しない日付のようです。");
      return false;
    }
    console.log(targetDate);
    console.log(targetDate.getFullYear());
  } else if (deadline === "" || deadline === "期限設定なし") {
    deadline = null;
    console.log("ここまできた");
    return false;
  } else {
    alert("Its invalid date");
    inputError(
      "#update-error",
      "日付が正しいフォーマットで入力されていません。"
    );
    return false;
  }

  // To hide updateModal, use this code.
  // $("#exampleModal2").modal("hide");

  let cate_id = $("[name=update_cate]").val();
  let status = $("[name=update_status]").val();
  const data = {
    task_name: name,
    category_id: cate_id,
    deadline: deadline,
    task_status: status,
  };
  console.log(data);
  const response = await httpUpdate(
    "//" + window.location.host + "/api/tasks/" + id,
    data
  );
  alert("更新完了しました。");
  console.log(response);
  window.location.reload();
});

// Delete Task
$(document).on("click", ".todo-delete", function () {
  let id = $(this).data("id");
  let taskName = $(this).data("task_name");
  $("#will_delete").text(taskName);
});
// Deleteを完了させる。
$("#delete-complete").click(async function () {
  const response = await httpDelete(
    "//" + window.location.host + "/api/tasks/" + id
  );
  console.log(response);
  alert("Delete Complete!");
  window.location.reload();
});

// Delete all time-out-tasks
$(document).on("click", "#delete-timeoutTask", async function () {
  let confirmation = window.confirm("本当に消すんですね？");
  if (confirmation) {
    const response = await httpDelete(
      "//" + window.location.host + "/api/deleteAll/timeout"
    );
    console.log(response);
    alert("Delete Complete!");
    window.location.reload();
  } else {
    return false;
  }
});

// Delete all completed-tasks
$(document).on("click", "#delete-compTask", async function () {
  let confirmation = window.confirm("本当に消すんですね？");
  if (confirmation) {
    const response = await httpDelete(
      "//" + window.location.host + "/api/deleteAll/completed"
    );
    console.log(response);
    alert("Delete Complete!");
    window.location.reload();
  } else {
    return false;
  }
});

// search task by keyword
$("#search-icon").click(async function () {
  click = false;
  $("[name=category_filter]").val(0);
  let keyword = $("[name=task-search]").val();
  const data = await httpGet(
    "//" + window.location.host + "/api/search/" + keyword
  );
  $("#todo-list").empty();
  console.log(data);
  let resultString;
  if (data.length === 0) {
    resultString = `キーワード「${keyword}」に一致するタスクはありませんでした。\n
                    <button onclick="reloadPage()">戻る</button>`;
    $("#todo-list").append(resultString);
  } else {
    resultString = `キーワード「${keyword}」に一致する${data.length}件のタスクが見つかりました。\n
                    <button onclick="reloadPage()">戻る</button>`;
    $("#todo-list").append(resultString);
  }
  $("#todo-list").append(getList(data));
});

// filtering by category
$("[name=category_filter]").on("change", async function () {
  $("[name=task-search]").val("");
  const categoryId = $("[name=category_filter]").val();
  let data;
  if (categoryId === "0") {
    data = await httpGet("//" + window.location.host + "/api/items");
    $("#todo-list").empty();
    console.log(data);
  } else {
    data = await httpGet(
      "//" + window.location.host + "/api/category/" + categoryId
    );
    $("#todo-list").empty();
    console.log(data);
    if (data.length === 0) {
      alert("カテゴリーに一致するタスクはありません。");
    }
  }
  console.log(data);
  $("#todo-list").append(getList(data));
});

// sort tasks
$("[name=sort-by]").on("change", async function () {
  const sortBy = $("[name=sort-by]").val();
  const data = await httpGet(
    "//" + window.location.host + `/api/sort/${sortBy}`
  );
  $("#todo-list").empty();
  console.log(data);
  if (sortBy == 0) {
    $("#todo-list").append(getSimpleList(data));
  } else {
    $("#todo-list").append(getList(data));
  }
});

// Hide completed task.
$("#completed-hide").on("click", function () {
  click = false;
  if (!$(this).hasClass("active")) {
    $(this).addClass("active");
    $(".completed_task").toggle("hide");
    $(this).text("戻す").css("width", "130px");
  } else {
    $(this).removeClass("active");
    $(".completed_task").toggle("hide");
    $(this).text("完了タスクを隠す");
  }
});

// データの大量削除を伴う危険な処理
$("#show-icon").click(function () {
  if ($(this).hasClass("showing")) {
    $(this).removeClass("showing bi-x-circle");
    $(this).addClass("bi-exclamation-triangle");
    $(this).css("top", "0px");
    $("#top-hidden").css("top", "-150px");
    $("#top-hidden").css("z-index", "0");
  } else {
    $(this).removeClass("bi-exclamation-triangle");
    $(this).addClass("showing bi-x-circle");
    $(this).css("top", "150px");
    $("#top-hidden").css("top", "0px");
    $("#top-hidden").css("z-index", "1000");
  }
});
$(document).click(function (event) {
  if ($("#show-icon").hasClass("showing")) {
    if (!$(event.target).closest("#top-hidden").length) {
      $("#show-icon").removeClass("showing bi-x-circle");
      $("#show-icon").addClass("bi-exclamation-triangle");
      $("#show-icon").css("top", "0px");
      $("#top-hidden").css("top", "-150px");
      $("#top-hidden").css("z-index", "1000");
    }
  }
});

// 日付のフォーマットに関する検証に利用
function inputError(where, message) {
  $(where).text(message).css("color", "red");
  console.log("Error output works!");
}

// タスクリスト取得 一覧表示、サーチ、カテゴリー分類、ソートなどで使用
function getList(data) {
  let tasks = [];
  let alertedTasks = [];
  let unlimitedTasks = [];
  data.map((item) => {
    let checkIcon = "";
    let uncompleteIcon = `<i class='task-uncomplete bi bi-check-circle' data-id='${item.id}'></i>`;
    let dateString = "";
    let timeOut = "";
    let deadlineAlert = "";
    let alertString = "";
    let toggleChecked = "";
    if (item.deadline !== null) {
      let deadline = new Date(item.deadline);
      let today = new Date();
      if (deadline < today) {
        timeOut = "time-out";
        uncompleteIcon = "";
      } else if ((deadline.getTime() - today.getTime()) / 1000 < 86400) {
        deadlineAlert = "deadline-alert";
        alertString = "期限間近!!";
      }
      let year = deadline.getFullYear();
      let month = deadline.getMonth() + 1;
      let day = deadline.getDate();
      dateString = year + "年" + month + "月" + day + "日";
    } else {
      dateString = "期限設定なし";
    }
    let stripe = "";
    let backGray = "";
    let tag = "";
    let completed_task = "";
    if (item.task_status === 1) {
      checkIcon = "<i class='task-complete bi bi-check-circle'></i>";
      uncompleteIcon = "";
      stripe = "stripe";
      backGray = "backGray";
      tag = "grayTag";
      toggleChecked = "checked";
      completed_task = "completed_task";
    } else if (item.task_status === 2) {
      tag = "blueTag";
    } else {
      tag = "redTag";
    }

    if (deadlineAlert !== "") {
      alertedTasks.push(
        `<li class="justify-content-md-center ${completed_task} ${timeOut} ${deadlineAlert}">
        ${checkIcon}${uncompleteIcon}
        <span class="${tag}"></span>
        <div class="list-content col col-9 ${backGray}">
          <span class="todo-text ${stripe}">${item.task_name}</span>
          <span class="alert-message">${timeOut}${alertString}</span>
          <span class="created-date ${stripe}">${dateString}</span>
          <div class="status-toggle ${toggleChecked}" data-id="${item.id}" data-task_status="${item.task_status}">
            <input type="checkbox" ${toggleChecked} name="check" />
          </div>
        </div>
        <button
          class="todo-detail btn btn-success col col-1"
          data-detail_id="${item.id}"
          data-target="#detailModal"
          data-toggle="modal"
        >
          詳細
        </button>
        <button
          type="button"
          class="btn btn-primary todo-update col col-1"
          data-toggle="modal"
          data-target="#exampleModal2"
          data-task_id="${item.id}"
          data-task_name="${item.task_name}"
          data-deadline="${dateString}"
          data-task_status="${item.task_status}"
          data-cate_id="${item.category_id}"
        >
          更新
        </button>
        <button
          type="button"
          class="btn btn-danger todo-delete col col-1"
          data-toggle="modal"
          data-target="#exampleModalCenter"
          data-id="${item.id}"
          data-task_name="${item.task_name}"
        >
          削除
        </button>
        </li>`
      );
    } else if (item.deadline === null) {
      unlimitedTasks.push(
        `<li class="justify-content-md-center ${completed_task} ${timeOut} ${deadlineAlert}">
        ${checkIcon}${uncompleteIcon}
        <span class="${tag}"></span>
        <div class="list-content col col-9 ${backGray}">
          <span class="todo-text ${stripe}">${item.task_name}</span>
          <span>${timeOut}</span>
          <span class="created-date ${stripe}">${dateString}</span>
          <div class="status-toggle ${toggleChecked}" data-id="${item.id}" data-task_status="${item.task_status}">
            <input type="checkbox" ${toggleChecked} name="check" />
          </div>
        </div>
        <button
          class="todo-detail btn btn-success col col-1"
          data-detail_id="${item.id}"
          data-target="#detailModal"
          data-toggle="modal"
        >
          詳細
        </button>
        <button
          type="button"
          class="btn btn-primary todo-update col col-1"
          data-toggle="modal"
          data-target="#exampleModal2"
          data-task_id="${item.id}"
          data-task_name="${item.task_name}"
          data-deadline="${dateString}"
          data-task_status="${item.task_status}"
          data-cate_id="${item.category_id}"
        >
          更新
        </button>
        <button
          type="button"
          class="btn btn-danger todo-delete col col-1"
          data-toggle="modal"
          data-target="#exampleModalCenter"
          data-id="${item.id}"
          data-task_name="${item.task_name}"
        >
          削除
        </button>
        </li>`
      );
    } else {
      tasks.push(
        `<li class="justify-content-md-center ${completed_task} ${timeOut} ${deadlineAlert}">
        ${checkIcon}${uncompleteIcon}
        <span class="${tag}"></span>
        <div class="list-content col col-9 ${backGray}">
          <span class="todo-text ${stripe}">${item.task_name}</span>
          <span>${timeOut}</span>
          <span class="created-date ${stripe}">${dateString}</span>
          <div class="status-toggle ${toggleChecked}" data-id="${item.id}" data-task_status="${item.task_status}">
            <input type="checkbox" name="check" />
          </div>
        </div>
        <button
          class="todo-detail btn btn-success col col-1"
          data-detail_id="${item.id}"
          data-target="#detailModal"
          data-toggle="modal"
        >
          詳細
        </button>
        <button
          type="button"
          class="btn btn-primary todo-update col col-1"
          data-toggle="modal"
          data-target="#exampleModal2"
          data-task_id="${item.id}"
          data-task_name="${item.task_name}"
          data-deadline="${dateString}"
          data-task_status="${item.task_status}"
          data-cate_id="${item.category_id}"
        >
          更新
        </button>
        <button
          type="button"
          class="btn btn-danger todo-delete col col-1"
          data-toggle="modal"
          data-target="#exampleModalCenter"
          data-id="${item.id}"
          data-task_name="${item.task_name}"
        >
          削除
        </button>
        </li>`
      );
    }
    return;
  });
  return [...alertedTasks, ...tasks, ...unlimitedTasks].join("");
}

// 追加順にソートする場合に使用
function getSimpleList(data) {
  let listString = "";
  data.map((item) => {
    let checkIcon = "";
    let uncompleteIcon = `<i class='task-uncomplete bi bi-check-circle' data-id='${item.id}'></i>`;
    let dateString = "";
    let timeOut = "";
    let deadlineAlert = "";
    let alertString = "";
    let toggleChecked = "";
    if (item.deadline !== null) {
      let deadline = new Date(item.deadline);
      let today = new Date();
      if (deadline < today) {
        timeOut = "time-out";
        uncompleteIcon = "";
      } else if ((deadline.getTime() - today.getTime()) / 1000 < 86400) {
        deadlineAlert = "deadline-alert";
        alertString = "期限間近!!";
      }
      let year = deadline.getFullYear();
      let month = deadline.getMonth() + 1;
      let day = deadline.getDate();
      dateString = year + "年" + month + "月" + day + "日";
    } else {
      dateString = "期限設定なし";
    }
    let stripe = "";
    let backGray = "";
    let tag = "";
    let completed_task = "";
    if (item.task_status === 1) {
      checkIcon = "<i class='task-complete bi bi-check-circle'></i>";
      uncompleteIcon = "";
      stripe = "stripe";
      backGray = "backGray";
      tag = "grayTag";
      toggleChecked = "checked";
      completed_task = "completed_task";
    } else if (item.task_status === 2) {
      tag = "blueTag";
    } else {
      tag = "redTag";
    }
    listString += `<li class="justify-content-md-center ${completed_task} ${timeOut} ${deadlineAlert}">
    ${checkIcon}${uncompleteIcon}
    <span class="${tag}"></span>
    <div class="list-content col col-9 ${backGray}">
      <span class="todo-text ${stripe}">${item.task_name}</span>
      <span class="alert-message">${timeOut}${alertString}</span>
      <span class="created-date ${stripe}">${dateString}</span>
      <div class="status-toggle ${toggleChecked}" data-id="${item.id}" data-task_status="${item.task_status}">
        <input type="checkbox" ${toggleChecked} name="check" />
      </div>
    </div>
    <button
      class="todo-detail btn btn-success col col-1"
      data-detail_id="${item.id}"
      data-target="#detailModal"
      data-toggle="modal"
    >
      詳細
    </button>
    <button
      type="button"
      class="btn btn-primary todo-update col col-1"
      data-toggle="modal"
      data-target="#exampleModal2"
      data-task_id="${item.id}"
      data-task_name="${item.task_name}"
      data-deadline="${dateString}"
      data-task_status="${item.task_status}"
      data-cate_id="${item.category_id}"
    >
      更新
    </button>
    <button
      type="button"
      class="btn btn-danger todo-delete col col-1"
      data-toggle="modal"
      data-target="#exampleModalCenter"
      data-id="${item.id}"
      data-task_name="${item.task_name}"
    >
      削除
    </button>
    </li>`;
  });
  return listString;
}

// get calendar
$("#open-calendar").click(async function () {
  if ($("#calendar tr").length > 1) {
    $("#calendar").empty();
  }
  let today = new Date();
  let thisYear = today.getFullYear();
  let thisMonth = today.getMonth() + 1;
  today.setDate(1);
  let thisDate = today.getDate();
  let weekOfFirst = today.getDay();
  let lastDayOfMonth = getLastDay();
  let skipWeek = 0;
  switch (weekOfFirst) {
    case 1:
      skipWeek = 1;
      break;
    case 2:
      skipWeek = 2;
      break;
    case 3:
      skipWeek = 3;
      break;
    case 4:
      skipWeek = 4;
      break;
    case 5:
      skipWeek = 5;
      break;
    case 6:
      skipWeek = 6;
      break;
    default:
      break;
  }

  let monthlyTasks = await httpGet(
    "//" + window.location.host + "/api/calendar/"
  );
  let taskArray = [];
  let date;
  monthlyTasks.map(function (item) {
    console.log(item);
    // 日付のみ取得したいが、deadlineのバリューは、2022-04-19 11:21:11などの
    // 不要な要素が多い。よって、splitで"-"で区切り配列に、その[2]の要素を文文字列分割で、２文字だけ取り出したのが、日付。
    date = Number(item.deadline.split("-")[2].substr(0, 2));
    if (date > lastDayOfMonth) {
      date = 1;
    } else {
      date = date + 1;
    }
    if (taskArray[date] === undefined) {
      taskArray[date] = [];
    }
    taskArray[date].push(item);
  });
  let current = 1;
  let tables = "";
  let days = 1;
  let tasksString = "";
  let task_status;
  let stripe;
  let maxCurrent = (lastDayOfMonth + skipWeek) / 7;
  for (let i = 1; i <= maxCurrent; i++) {
    tables += "<tr>";
    for (let j = 1; j <= 7; j++) {
      tasksString = "";
      if (current === 1 && j <= skipWeek) {
        tables += "<td class='backGray'> </td>";
      } else if (days > lastDayOfMonth) {
        tables += "<td class='backGray'> </td>";
      } else {
        if (taskArray[days] !== undefined) {
          taskArray[days].forEach((task) => {
            stripe = "";
            if (task.task_status === 1) {
              task_status = "完了";
              stripe = "stripe";
            } else if (task.task_status === 2) {
              task_status = "実施中";
            } else {
              task_status = "未実施";
            }
            tasksString += `<a class="calendar-update ${stripe}" data-target="#update-by-calendar" data-toggle="modal" data-id="${task.id}">・${task.task_name}(${task_status})</a><br>`;
          });
        }
        if (days >= thisDate) {
          tables += `<td><p><strong>${days}</strong></p><p>${tasksString}</p><i class="bi bi-calendar-plus calendar-plus" data-toggle="modal" data-target="#create-by-calendar" data-date="${days}" data-month="${thisMonth}" data-year="${thisYear}"></i></td>`;
        } else {
          tables += `<td><p><strong>${days}</strong></p><p>${tasksString}</p></td>`;
        }
        ++days;
      }
    }
    tables += "</tr>aaaaaaaaaaaa<br>";
    ++current;
    console.log(taskArray);
  }
  $("#year-month").text(`締切カレンダー(${thisYear}年${thisMonth}月）`);
  $("#calendar").append(tables);
});

function getLastDay() {
  let date = new Date();
  date.setMonth(date.getMonth() + 1);
  date.setDate(0);
  return date.getDate();
}
