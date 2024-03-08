import { List } from "./List";
import { ListUi } from "./ListUI";
import { Todo } from "./Todo";

export class ListApp {
  constructor() {
    this.lists = [];
    this.AppUI = new ListUi();
    this.activeList = 0;

    PubSub.subscribe("list_activated", (msg, data) => {
      console.log("list activated published with id " + data.id);
      this.lists.forEach((list) => {
        if (list.id != data.id) {
          list.isActive = false;
        }
      });
      this.lists.find((list) => list.id === data.id).isActive = true;
      PubSub.publish("lists_updated", {
        lists: this.lists,
      });
    });

    PubSub.subscribe("user_created_list", (msg, data) => {
      let list = new List(data.name);
      this.activeList = list.id;
      this.lists.push(list);
      PubSub.publish("list_activated", {
        id: list.id,
        items: list.items,
      });
      PubSub.publish("lists_updated", {
        lists: this.lists,
      });
    });

    PubSub.subscribe("user_deleted_list", (msg, data) => {
      //REmove fr0m lists

      let deletedListId = this.getIdFromClass(data.id);
      this.lists = this.lists.filter((list) => {
        return list.id != deletedListId;
      });
      PubSub.publish("lists_updated", { lists: this.lists });
      //Check to see if this was the active list, activate a different list if so
      if (this.lists.length === 0) {
        PubSub.publish("all_lists_removed");
        return;
      }
      if (this.activeList == deletedListId) {
        let newActiveList = this.lists.find(
          (list) => list.id != this.activeList
        ).id;
        this.activeList = newActiveList;
        this.lists.find((list) => list.id == this.activeList).activateList();
      }
    });

    PubSub.subscribe("user_deleted_item", (msg, data) => {
      let deletedItemId = this.getIdFromClass(data.id);
      this.lists
        .find((list) => list.id === this.activeList)
        .removeItem(deletedItemId);
      PubSub.publish("lists_updated", { lists: this.lists });

      //this.lists.find((list) => list.id === this.activeList).activateList();
    });

    PubSub.subscribe("user_created_item", (msg, data) => {
      this.lists
        .find((element) => element.id === this.activeList)
        .addItem(new Todo((name = data.name)));
      console.log(this.activeList, data);
      PubSub.publish("lists_updated", { lists: this.lists });
    });

    PubSub.subscribe("user_completed_item", (msg, data) => {
      let itemIdToComplete = this.getIdFromClass(data.id);
      this.lists
        .find((element) => element.id === this.activeList)
        .items.find((item) => item.id == itemIdToComplete)
        .markComplete();
      PubSub.publish("lists_updated", { lists: this.lists });
    });

    PubSub.subscribe("user_uncompleted_item", (msg, data) => {
      let itemIdToComplete = this.getIdFromClass(data.id);
      this.lists
        .find((element) => element.id === this.activeList)
        .items.find((item) => item.id == itemIdToComplete)
        .markIncomplete();
      PubSub.publish("lists_updated", { lists: this.lists });
    });

    PubSub.subscribe("user_loaded_list", (msg, data) => {
      this.lists.forEach((list) => {
        if (list.id === data.id) {
          this.activeList = data.id;
          list.activateList();
        }
      });
    });

    PubSub.subscribe("lists_retrieved_from_storage", (msg, data) => {
      this.loadListsFromStorage(data);
    });
    PubSub.publish("app_started");
  }

  loadListsFromStorage(data) {
    let retrievedLists = data.lists;

    retrievedLists.forEach((list) => {
      let newList = new List(list.name);
      newList.createdDate = list.createDate;
      newList.tags = list.tags;
      newList.isActive = list.isActive;
      if (newList.isActive) this.activeList = newList.id;
      list.items.forEach((item) => {
        let newItem = new Todo(item.title);
        newItem.createdDate = item.createdDate;
        newItem.dueDate = item.dueDate;
        newItem.completedDate = item.completedDate;
        newItem.isComplete = item.isComplete;
        newItem.priority = item.priority;
        newItem.description = item.description;
        newList.addItem(newItem);
      });
      this.lists.push(newList);
    });
    PubSub.publish("lists_updated", { lists: this.lists });
    this.lists.find((list) => list.id == this.activeList).activateList();
  }

  addList(list, createdDate = new Date(), tags = [], items = []) {
    let newList = new List(
      (name = list),
      (createdDate = createdDate),
      (tags = tags),
      (items = items)
    );
    this.lists.push(newList);
    PubSub.publish("lists_updated", {
      lists: this.lists,
    });
    return newList;
  }

  getIdFromClass(className) {
    return className.replace(/[^0-9]/g, "");
  }
}
