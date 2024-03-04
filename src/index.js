const { format } = require("date-fns");
import { PubSub } from "pubsub-js";
import { Logger } from "./Logger.js";
import { Todo } from "./Todo.js";
import { List } from "./List.js";
import { ListUi } from "./ListUI.js";
import { ListApp } from "./ListApp.js";
import css from "./style.css";

const app = new ListApp();

let myItems = ["test1", "test2", "test3", "test4"];
let list = new List("test");

let itemTest = new Todo("test5");

myItems.forEach((item) => {
  let todo = new Todo(item);
  list.addItem(todo);
});

list.activateList();

list.items.forEach((item) => {
  console.log(item.id + " marked complete.");
  item.markComplete();
});

list.archiveComplete();
