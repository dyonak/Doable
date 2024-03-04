import { ListUi } from "./ListUI";

export class ListApp {
  constructor() {
    this.lists = [];
    this.items = [];
    this.activeList = {};
    this.AppUI = new ListUi();

    PubSub.subscribe("list_activated", (msg, data) => {
      console.log("ListApp received");
      this.loadActiveList(data.id);
      this.activeList = data.id;
    });
    PubSub.subscribe("list_created", (msg, data) => {
      this.loadActiveList(data.id);
      this.activeList = data.id;
      this.lists.push(data);
    });
  }

  loadActiveList(listID) {}
}
