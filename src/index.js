const { format } = require("date-fns");
import { PubSub } from "pubsub-js";
import { Toast } from "./Toast.js";
import { Logger } from "./Logger.js";
import { Todo } from "./Todo.js";
import { List } from "./List.js";
import { ListUi } from "./ListUI.js";
import { ListApp } from "./ListApp.js";
import css from "./style.css";

//On startup
//1. Check storage (localStorage for now)
//2. Build List and Todo objects from storage (class'ify')
//3. Update new list and new todo logic to append to storage

//TODO: Style the item and list creation forms
//TODO: Add toast messages for user actions, should be easy with a few subscribes
//TODO: Add persistence via localStorage, load on app start, update on all changes
//TODO: Add quick actions for lists, icon(s) on the li (Delete at a min. maybe edit?)
//TODO: Add quick actions for items, icon(s) on the li (Delete, mark complete, edit)
//TODO: Add card/detail view for todo items, clicking on list item should expand it to a card where all details can be seen and edited
//TODO: Add a light/dark mode toggle, learn more about media queries for user-prefers-theme
//TODO: Add animations for toasts, forms, card expansion
let app = new ListApp();
