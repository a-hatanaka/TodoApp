function escapeHTML(s) {
    return s.replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;" )
    .replace(/'/g, "&#39;" );
}

$(function() {
  $(".datepicker").datepicker();
  $(".datepicker").datepicker("option", "dateFormat", 'yy/mm/dd' );
});

// タスク一覧取得API
$(async function () {
  const data = await httpGet("//" + window.location.host + "/api/items");
  $("#todo-list").empty();
  console.log(data);
  $("#todo-list").append(getList(data));
});

// Get today's tasks
$("#today-tasks").click( async function(){
  click=false;
  const data = await httpGet("//" + window.location.host + "/api/today");
  $("#todo-list").empty();
  console.log(data);
  $("#todo-list").append(getList(data));
});

// Get Task Detail
$(document).on('click',".todo-detail", async function(){
  click=false;
  let detail_id = $(this).data("detail_id");
  let data = await httpGet("//" + window.location.host + "/api/items/" + detail_id);
  $("#detail-name").text(`タスク名: ${data[0].task_name}`);
  let dateString;
  if(!data[0].task_deadline){
    dateString = 'なし';
  }else{
    let deadline = new Date(data[0].deadline);
    let year = deadline.getFullYear() + 1;
    let month = deadline.getMonth();
    let date = deadline.getDate();
    dateString = year+"年"+month+"月"+date+"日";
  }
  $("#detail-deadline").text(`期限: ${dateString}`);

  let category_id = data[0].category_id;
  let category;
  switch (category_id) {
    case '1':
      category = '生活';
      break;
    case '2':
      category = '勉強';
      break;
    case '3':
      category = '仕事';
      break;
    case '4':
      category = '趣味';
      break;
    default:
      category = '該当なし';
      break;
  }
  $("#detail-category").text(`カテゴリー: ${category}`);
  let task_status = data[0].task_status;
  switch (task_status) {
    case 1:
      task_status = '完了';
      break;
    case 2:
      task_status = '実施中';
      break;
    case 3:
      task_status = '未実施';
      break;
    default:
      task_status = '不明';
      break;
  }
  $("#detail-status").text(`実施状況: ${task_status}`);
});

// Create New Task
$("#create-task").click( async function(){
  click=false;
  if($("[name=task_name]").val()===''){
    alert("タスク名は入力必須です");
    return false;
  }
  const task_name = $("[name=task_name]").val();

  // 日付の値が、「○○○○年○月○日」の場合、ここで「○○○○-○-○」などに置き換え処理
  let deadline = $("[name=deadline]").val();
  deadline = deadline.replace( /(\d+)年(\d+)月(\d+)日/g , "$1-$2-$3" )
  deadline += "  23:59:59";
  console.log(deadline);
  // 期限の値に'-','/'が2個登場する場合は、とりあえずは有効な値としてキャッチする。
  // match() は一致する文字が0個の場合、nullを返すが、nullは扱いに困る。よって、空配列[]を入れて、それをカウントさせている。
  if((deadline.match( new RegExp( "-", "g" ))||[]).length===2 || (deadline.match( new RegExp( "/", "g"))||[]).length===2){
    console.log("It includes 2 '-' or '/'");
  }else if(deadline==="" || deadline==="期限設定なし"){
    deadline = null;
  } else {
    let targetDate = new Date(deadline);
    let now = new Date();
    // deadlineに「2022--65」など -/ が2本入っているが、-- や // という形で入っており、不正な場合trueを返す
    if(Number.isNaN(targetDate.getDate())){
      alert("Its invalid date");
      inputError("#create-error","日付が正しいフォーマットで入力されていません。");
      return false;
    }else if(targetDate < now){
      alert("今日以降の日付を指定してください。");
      inputError("#create-error","今日以降の日付を指定してください。");
      return false;
    }
    alert("Invalid update");
    inputError("#create-error","日付が正しいフォーマットで入力されていません。");
    return false;
  }

  const cate_id = $("[name=category_id]").val();
  const data = {
    task_name: task_name,
    deadline: deadline,
    category_id: cate_id
  };
  const response = await httpPost(
    "//" + window.location.host + "/api/tasks",
    data
  );
  alert("追加完了しました。");
  console.log(response);
  window.location.reload();
});

// status change using toggleSwitch
$(document).on("click",".status-toggle", function() {
  const id = $(this).data("id");
  const status = $(this).data("task_status");
  let response;
  let parentObj;
  $(this).toggleClass("checked");
  if(!$('input[name="check"]').prop("checked")) {
    $(".status-toggle input").prop("checked", true);
    response = httpUpdate("//" + window.location.host + `/api/status/${id}-${status}`);
    console.log(response);
    parentObj = $(this).parent().parent();
    parentObj.find("i").removeClass("task-uncomplete");
    parentObj.find("i").addClass("task-complete");
    $(this).parent().next().next().data("task_status","1");
    $(this).parent().addClass("stripe");
    alert("Good job!");
  } else {
    $(".status-toggle input").prop("checked", false);
    response = httpUpdate("//" + window.location.host + `/api/status/${id}-${status}`);
    console.log(response);
    parentObj = $(this).parent().parent();
    parentObj.find("i").addClass("task-uncomplete");
    parentObj.find("i").removeClass("task-complete");
    $(this).parent().next().next().data("task_status","2");
    $(this).parent().removeClass("stripe");
    alert("Let's do task again!");
  }
});

// Update
$(document).on("click", ".todo-update", function(){
  click=false;
  $("[name=update_id]").val($(this).data('task_id'));
  $("[name=update_name]").val($(this).data('task_name'));
  $("[name=update_deadline]").val($(this).data('deadline'));
  $("[name=update_cate]").val($(this).data('cate_id'));
  $("[name=update_status]").val($(this).data('task_status'));
  $("[name=update_id]").val($(this).data('task_id'));
  $("#update-complete").click( async function(){
    let id = $("[name=update_id]").val();
    let name = $("[name=update_name]").val();
    if(name===""){
      alert("タスク名は空にできません。");
      $("#exampleModal2").modal("hide");
      return false;
    }
    let deadline = $("[name=update_deadline]").val();

    deadline = deadline.replace( /(\d+)年(\d+)月(\d+)日/g , "$1-$2-$3" );
    // 期限の値に'-','/'が2個登場する場合は、とりあえずは有効な値としてキャッチする。
    // match() は一致する文字が0個の場合、nullを返すが、nullは扱いに困る。よって、空配列[]を入れて、それをカウントさせている。
    if((deadline.match( new RegExp( "-", "g" ))||[]).length===2 || (deadline.match( new RegExp( "/", "g"))||[]).length===2){
      console.log("It includes 2 '-' or '/'");
    }else if(deadline==="" || deadline==="期限設定なし"){
      deadline = null;
    } else{
      let targetDate = new Date(deadline);
      let now = new Date();
      // deadlineに「2022--65」など -/ が2本入っているが、-- や // という形で入っており、不正な場合trueを返す
      if(Number.isNaN(targetDate.getDate())){
        alert("Its invalid date");
        inputError("#update-error", "日付が正しいフォーマットで入力されていません。");
        return false;
      }else if(targetDate < now){
        alert("今日以降の日付を指定してください。");
        inputError("#update-error", "今日以降の日付を指定してください。");
        return false;
      }
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
    console.log(data)
    const response = await httpUpdate(
      "//" + window.location.host + "/api/tasks/" + id,
      data
    )
    alert("更新完了しました。");
    console.log(response);
    window.location.reload();
  });
});

// Delete Task
$(document).on("click", ".todo-delete",function(){
  click=false;
  let id = $(this).data('id');
  let taskName = $(this).data('task_name');
  $("#will_delete").text(taskName);
  $("#delete-complete").click( async function(){
    const response = await httpDelete(
      "//" + window.location.host + "/api/tasks/" + id
    );
    console.log(response);
    alert("Delete Complete!");
    window.location.reload();
  });
});

// search task by keyword
$("#search-icon").click( async function(){
  click=false;
  $("[name=category_filter]").val(0);
  let keyword = $("[name=task-search]").val();
  const data = await httpGet(
    "//" + window.location.host + "/api/search/" + keyword
  );
  $("#todo-list").empty();
  console.log(data);
  let resultString;
  if(data.length===0){
    resultString = `キーワード「${keyword}」に一致するタスクはありませんでした。\n
                    <button onclick="reloadPage()">戻る</button>`
    $("#todo-list").append(resultString);
  }else{
    resultString = `キーワード「${keyword}」に一致する${data.length}のタスクが見つかりました。\n
                    <button onclick="reloadPage()">戻る</button>`;
    $("#todo-list").append(resultString);
  }
  $("#todo-list").append(getList(data));
});

// filtering by category
$("[name=category_filter]").on("change", async function(){
  $("[name=task-search]").val('');
  const categoryId = $("[name=category_filter]").val();
  let data;
  if(categoryId === '0'){
    data = await httpGet(
      "//" + window.location.host + "/api/items"
    );
    $("#todo-list").empty();
    console.log(data);
  }else{
    data = await httpGet(
      "//" + window.location.host + "/api/category/" + categoryId
    );
    $("#todo-list").empty();
    console.log(data);
    if(data.length===0){
      alert("カテゴリーに一致するタスクはありません。");
    }
  }
  console.log(data);
  $("#todo-list").append(getList(data));
});

// sort tasks
$("[name=sort-by]").on("change", async function(){
  const sortBy = $("[name=sort-by]").val();
  const data = await httpGet(
    "//" + window.location.host + "/api/sort/" + sortBy
  );
  $("#todo-list").empty();
  console.log(data);
  $("#todo-list").append(getList(data));
});


// Hide completed task.
$("#completed-hide").on("click",function(){
  click=false;
  if(!$(this).hasClass("active")){
    $(this).addClass("active");
    $(".completed_task").toggle("hide");
    $(this).text("モドス");
  } else{
    $(this).removeClass("active");
    $(".completed_task").toggle("hide");
    $(this).text("完了タスクをカスク");
  }
});

// 日付のフォーマットに関する検証に利用
function inputError(where,message){
  $(where).text(message).css("color", "red");
  console.log("Error output works!");
}

// タスクリスト取得 一覧表示、サーチ、カテゴリー分類、ソートなどでしよう
function getList(data){
  let tasks = [];
  let alertedTasks = [];
  let unlimitedTasks = [];
  data.map((item)=>{
    let checkIcon = '';
    let uncompleteIcon = `<i class='task-uncomplete bi bi-check-circle' data-id='${item.id}'></i>`;
    let dateString='';
    let timeOut = '';
    let deadlineAlert = '';
    let alertString = '';
    let toggleChecked = '';
    if(item.deadline!==null){
      let deadline = new Date(item.deadline);
      let today = new Date();
      if(deadline < today){
        timeOut = 'time-out';
        uncompleteIcon = '';
      }else if((deadline.getTime()-today.getTime())/1000 < 86400){
        deadlineAlert = 'deadline-alert';
        alertString = '期限間近!!';
      }
      let year = deadline.getFullYear();
      let month = deadline.getMonth() +1;
      let day = deadline.getDate();
      dateString = year+'年'+month+'月'+day+'日';
    }else {
      dateString = '期限設定なし';
    }
    let stripe = '';
    let backGray = '';
    let tag = '';
    let completed_task = '';
    if(item.task_status===1){
      checkIcon = "<i class='task-complete bi bi-check-circle'></i>";
      uncompleteIcon = '';
      stripe = 'stripe';
      backGray = 'backGray';
      tag = 'grayTag';
      toggleChecked = 'checked';
      completed_task = 'completed_task';
    }else if(item.task_status===2){
      tag = 'blueTag';
    }else{
      tag = 'redTag';
    }

    if(deadlineAlert!==''){
      alertedTasks.push(
        `<li class="justify-content-md-center ${completed_task} ${timeOut} ${deadlineAlert}">
        ${checkIcon}${uncompleteIcon}
        <span class="${tag}"></span>
        <div class="list-content col col-9 ${backGray}">
          <span class="todo-text ${stripe}">${item.task_name}</span>
          <span class="alert-message">${timeOut}${alertString}</span>
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
    }else if(item.deadline===null){
      unlimitedTasks.push(
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
    }else{
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
  return [...alertedTasks,...tasks,...unlimitedTasks].join('');
}