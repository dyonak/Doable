const { format } = require("date-fns");
import { PubSub } from "pubsub-js";
import { Logger } from "./Logger.js";
import { Todo } from "./Todo.js";
import { List } from "./List.js";
import { ListUi } from "./ListUI.js";
import { ListApp } from "./ListApp.js";
import css from "./style.css";

//Eventually this is the only line
//On startup
//1. Check storage (localStorage for now)
//2. Build List and Todo objects from storage (class'ify')
//3. Update new list and new todo logic to append to storage
const app = new ListApp();

// let myItems = ["test1", "test2", "test3", "test4"];
// let list = app.addList("My List");
// myItems.forEach((item) => {
//   let todo = new Todo(item);
//   list.addItem(todo);
// });
// list.items.forEach((item) => {
//   item.isComplete = false;
// });

// list.archiveComplete();
// list.activateList();
