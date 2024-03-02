import { PubSub } from "pubsub-js";
import { Todo } from "./Todo.js";
import { List } from "./List.js";
import { ListUi } from "./ListUI.js";
const { format } = require("date-fns");

let myItems = ["test1", "test2", "test3", "test4"];
let list = new List("test");

myItems.forEach((item) => {
  let todo = new Todo(item);
  list.addItem(todo);
});
