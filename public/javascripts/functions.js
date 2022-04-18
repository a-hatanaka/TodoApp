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
  console.log(data);
  const list = data.map((item) => {
    console.log(item.category_name);
    let dateString='';
    let timeOut = '';
    if(item.deadline!==null){
      var deadline = new Date(item.deadline);
      if(deadline < new Date()){
        timeOut = 'time-out';
        console.log(item.task_name+"is time out.");
      }
      console.log(deadline);
      var year = deadline.getFullYear();
      var month = deadline.getMonth() +1;
      var day = deadline.getDate();
      dateString = year+'年'+month+'月'+day+'日';
    }else {
      dateString = '期限設定なし';
    }
    let checkIcon = '';
    let stripe = '';
    let backGray = '';
    let tag = '';
    let completed_task = '';
    if(item.task_status===1){
      checkIcon = "<i class='task-complete bi bi-check-circle'></i>";
      stripe = 'stripe';
      backGray = 'backGray';
      tag = 'grayTag';
      completed_task = 'completed_task';
    }else if(item.task_status===2){
      tag = 'blueTag';
    }else{
      tag = 'redTag';
    }
    return `<li class="justify-content-md-center ${completed_task} ${timeOut}">
              ${checkIcon}
              <span class="${tag}"></span>
              <div class="list-content col col-10 ${backGray}">
                <span class="todo-text ${stripe}">${item.task_name}</span>
                <span>${timeOut}</span>
                <span class="created-date ${stripe}">${dateString}</span>
              </div>
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
  $("#todo-list").append(list);
});


// Create New Task
$("#create-task").click( async function(){
  if($("[name=task_name]").val()===''){
    alert("タスク名は入力必須です");
    return false;
  }
  const task_name = $("[name=task_name]").val();

  // 日付の値が、「○○○○年○月○日」の場合、ここで「○○○○-○-○」などに置き換え処理
  let deadline = $("[name=deadline]").val();
  deadline = deadline.replace( /(\d+)年(\d+)月(\d+)日/g , "$1-$2-$3" );
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


// Update
$(document).on("click", ".todo-update", function(){
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
  $("[name=category_filter]").val(0);
  let keyword = $("[name=task-search]").val();
  const data = await httpGet(
    "//" + window.location.host + "/api/search/" + keyword
  );
  $("#todo-list").empty();
  console.log(data);

  const searchedList = data.map((item) => {
    let dateString='';
    if(item.deadline!==null){
      var deadline = new Date(item.deadline);
      console.log(deadline);
      var year = deadline.getFullYear();
      var month = deadline.getMonth() +1;
      var day = deadline.getDate();
      dateString = year+'年'+month+'月'+day+'日';
    }else {
      dateString = '期限設定なし';
    }
    let checkIcon = '';
    let stripe = '';
    let backGray = '';
    let tag = '';
    if(item.task_status===1){
      checkIcon = "<i class='task-complete bi bi-check-circle'></i>";
      stripe = 'stripe';
      backGray = 'backGray';
      tag = 'grayTag';
    }else if(item.task_status===2){
      tag = 'blueTag';
    }else{
      tag = 'redTag';
    }
    return `<li class="justify-content-md-center">
              ${checkIcon}
              <span class="${tag}"></span>
              <div class="list-content col col-10 ${backGray}">
                <span class="todo-text ${stripe}">${item.task_name}</span>
                <span class="created-date ${stripe}">${dateString}</span>
              </div>
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
  $("#todo-list").append(
    `検索ワード「${keyword}」を探した結果、\n${data.length}件のタスクがありました。`
  );
  $("#todo-list").append(searchedList);
});

// filtering by category
$("[name=category_filter]").on("change", async function(){
  $("[name=task-search]").val('');
  const categoryId = $("[name=category_filter]").val();
  let data;
  let filteredList;
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
  filteredList = data.map((item) => {
    let dateString='';
    if(item.deadline!==null){
      var deadline = new Date(item.deadline);
      console.log(deadline);
      var year = deadline.getFullYear();
      var month = deadline.getMonth() +1;
      var day = deadline.getDate();
      dateString = year+'年'+month+'月'+day+'日';
    }else {
      dateString = '期限設定なし';
    }
    let checkIcon = '';
    let stripe = '';
    let backGray = '';
    let tag = '';
    console.log(item.task_status);
    if(item.task_status===1){
      checkIcon = "<i class='task-complete bi bi-check-circle'></i>";
      stripe = 'stripe';
      backGray = 'backGray';
      tag = 'grayTag';
    }else if(item.task_status===2){
      tag = 'blueTag';
    }else{
      tag = 'redTag';
    }
    return `<li class="justify-content-md-center">
              ${checkIcon}
              <span class="${tag}"></span>
              <div class="list-content col col-10 ${backGray}">
                <span class="todo-text ${stripe}">${item.task_name}</span>
                <span class="created-date ${stripe}">${dateString}</span>
              </div>
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
  $("#todo-list").append(filteredList);
});

// sort tasks
$("[name=sort-by]").on("change", async function(){
  const sortBy = $("[name=sort-by]").val();
  const data = await httpGet(
    "//" + window.location.host + "/api/sort/" + sortBy
  );
  $("#todo-list").empty();
  const filteredList = data.map((item) => {
    let dateString='';
    if(item.deadline!==null){
      var deadline = new Date(item.deadline);
      console.log(deadline);
      var year = deadline.getFullYear();
      var month = deadline.getMonth() +1;
      var day = deadline.getDate();
      dateString = year+'年'+month+'月'+day+'日';
    }else {
      dateString = '期限設定なし';
    }
    let checkIcon = '';
    let stripe = '';
    let backGray = '';
    let tag = '';
    if(item.task_status===1){
      checkIcon = "<i class='task-complete bi bi-check-circle'></i>";
      stripe = 'stripe';
      backGray = 'backGray';
      tag = 'grayTag';
    }else if(item.task_status===2){
      tag = 'blueTag';
    }else{
      tag = 'redTag';
    }
    return `<li class="justify-content-md-center">
              ${checkIcon}
              <span class="${tag}"></span>
              <div class="list-content col col-10 ${backGray}">
                <span class="todo-text ${stripe}">${item.task_name}</span>
                <span class="created-date ${stripe}">${dateString}</span>
              </div>
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
  $("#todo-list").append(filteredList);
});


// Hide completed task.
$("#completed-hide").on("click",function(){
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

function inputError(where,message){
  $(where).text(message).css("color", "red");
  console.log("Error output works!");
}