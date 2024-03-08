const { format, formatDistance } = require("date-fns");
import { PubSub } from "pubsub-js";
import { Storage } from "./Storage.js";
import { Toast } from "./Toast.js";
//import { Logger } from "./Logger.js";
import { Todo } from "./Todo.js";
import { List } from "./List.js";
import { ListUi } from "./ListUI.js";
import { ListApp } from "./ListApp.js";
import css from "./style.css";

let app = new ListApp();
