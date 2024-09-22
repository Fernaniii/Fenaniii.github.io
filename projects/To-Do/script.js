const todoValue = document.getElementById("todoText");
const todoAlert = document.getElementById("Alert");
const listItems = document.getElementById("list-items");
const addUpdate = document.getElementById("AddUpdateClick");

let todo = JSON.parse(localStorage.getItem("todo-list"));
if (!todo) {
  todo = [];
}

function CreateToDoItems() {
    if (todoValue.value === "") {
      todoAlert.innerText = "Please enter your todo text!";
      todoValue.focus();
    } else {
      let IsPresent = false;
      todo.forEach((element) => {
        if (element.item == todoValue.value) {
          IsPresent = true;
        }
      });
  
      if (IsPresent) {
        setAlertMessage("This item already present in the list!");
        return;
      }
  
      let li = document.createElement("li");
      const todoItems = `<div title="Hit Double Click and Complete" ondblclick="CompletedToDoItems(this)">${todoValue.value}</div><div>
                      <div class="edit todo-controls" onclick="UpdateToDoItems(this)" src="/images/pencil.png"><i class="fa-solid fa-pen-to-square fa-lg" style="color: #000000;"></i></div>
                      <div class="delete todo-controls" onclick="DeleteToDoItems(this)"><i class="fa-regular fa-trash-can fa-lg" style="color: #000000;"></i><div/></div></div>`;
      li.innerHTML = todoItems;
      listItems.appendChild(li);
  
      if (!todo) {
        todo = [];
      }
      let itemList = { item: todoValue.value, status: false };
      todo.push(itemList);
      setLocalStorage();
    }
    todoValue.value = "";
    setAlertMessage("Todo item Created Successfully!");
  }
//   end of create
function ReadToDoItems() {
    todo.forEach((element) => {
      let li = document.createElement("li");
      let style = "";
      if (element.status) {
        style = "style='text-decoration: line-through'";
      }
      const todoItems = `<div ${style} title="Hit Double Click and Complete" ondblclick="CompletedToDoItems(this)">${
        element.item
      }
      ${
        style === ""
          ? ""
          : '<div class="todo-controls"><i class="fa-solid fa-check fa-lg" style="color: #000000;"></i></div>'
      }</div><div>
      ${
        style === ""
          ? '<div class="edit todo-controls" onclick="UpdateToDoItems(this)" src="/images/pencil.png"><i class="fa-solid fa-pen-to-square fa-lg" style="color: #000000;"></i></div>'
          : ""
      }
      <div class="delete todo-controls" onclick="DeleteToDoItems(this)"><i class="fa-regular fa-trash-can fa-lg" style="color: #000000;"></i><div/></div></div>`;
      li.innerHTML = todoItems;
      listItems.appendChild(li);
    });
  }
  ReadToDoItems();
//   end of read
function UpdateToDoItems(e) {
    if (
      e.parentElement.parentElement.querySelector("div").style.textDecoration ===
      ""
    ) {
      todoValue.value =
        e.parentElement.parentElement.querySelector("div").innerText;
      updateText = e.parentElement.parentElement.querySelector("div");
      addUpdate.setAttribute("onclick", "UpdateOnSelectionItems()");
      addUpdate.setAttribute("src", "/images/refresh.png");
      todoValue.focus();
    }
  }
  
  function UpdateOnSelectionItems() {
    let IsPresent = false;
    todo.forEach((element) => {
      if (element.item == todoValue.value) {
        IsPresent = true;
      }
    });
  
    if (IsPresent) {
      setAlertMessage("This item already present in the list!");
      return;
    }
  
    todo.forEach((element) => {
      if (element.item == updateText.innerText.trim()) {
        element.item = todoValue.value;
      }
    });
    setLocalStorage();
  
    updateText.innerText = todoValue.value;
    addUpdate.setAttribute("onclick", "CreateToDoItems()");
    addUpdate.setAttribute("src", "/images/plus.png");
    todoValue.value = "";
    setAlertMessage("Todo item Updated Successfully!");
  }
//   end of update 
function DeleteToDoItems(e) {
    let deleteValue =
      e.parentElement.parentElement.querySelector("div").innerText;
  
    if (confirm(`Are you sure. Due you want to delete this ${deleteValue}!`)) {
      e.parentElement.parentElement.setAttribute("class", "deleted-item");
      todoValue.focus();
  
      todo.forEach((element) => {
        if (element.item == deleteValue.trim()) {
          todo.splice(element, 1);
        }
      });
  
      setTimeout(() => {
        e.parentElement.parentElement.remove();
      }, 1000);
  
      setLocalStorage();
    }
  }
//   end of delete
function CompletedToDoItems(e) {
    if (e.parentElement.querySelector("div").style.textDecoration === "") {
      const img = document.createElement("img");
      // <div class="todo-controls"><i class="fa-solid fa-check fa-lg" style="color: #000000;"></i></div>
      img.src = "projects/To-Do/icon/check.png";
      img.className = "todo-controls";
      e.parentElement.querySelector("div").style.textDecoration = "line-through";
      e.parentElement.querySelector("div").appendChild(img);
      e.parentElement.querySelector("img.edit").remove();
  
      todo.forEach((element) => {
        if (
          e.parentElement.querySelector("div").innerText.trim() == element.item
        ) {
          element.status = true;
        }
      });
      setLocalStorage();
      setAlertMessage("Todo item Completed Successfully!");
    }
  }

  function setLocalStorage() {
    localStorage.setItem("todo-list", JSON.stringify(todo));
  }

  function setAlertMessage(message) {
    todoAlert.removeAttribute("class");
    todoAlert.innerText = message;
    setTimeout(() => {
      todoAlert.classList.add("toggleMe");
    }, 1000);
  }