import { List } from "./List";
import { ListUi } from "./ListUI";
import { Todo } from "./Todo";

export class ListApp {
  constructor() {
    this.lists = [];
    this.AppUI = new ListUi();
    this.activeList = 0;

    PubSub.subscribe("list_activated", (msg, data) => {
      this.activeList = data.id;
      console.log("active list is " + this.activeList);
    });

    PubSub.subscribe("user_created_list", (msg, data) => {
      let list = new List(data.name);
      this.lists.push(list);

      PubSub.publish("lists_updated", {
        lists: this.lists,
      });
    });

    PubSub.subscribe("user_created_item", (msg, data) => {
      this.lists
        .find((element) => element.id === this.activeList)
        .addItem(new Todo(data.name));

      console.log(this.lists.find((element) => element.id === this.activeList));
    });

    PubSub.subscribe("list_clicked", (msg, data) => {
      console.table(this.lists);
      console.log(data.id);
      this.lists.forEach((list) => {
        if (list.id === data.id) {
          list.activateList();
        }
      });
    });

    PubSub.publish("app_started");
  }

  addList(list) {
    let newList = new List(list);
    this.lists.push(newList);
    PubSub.publish("lists_updated", {
      lists: this.lists,
    });
    return newList;
  }
}
