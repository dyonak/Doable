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
      this.lists.forEach((list) => {
        if (list.id != data.id) {
          list.isActive = false;
        }
      });
      this.lists.find((list) => list.id === data.id).isActive = true;
      //Check for items that have been complete longer than this list's archive delay
      this.lists
        .find((list) => list.id === data.id)
        .items.forEach((item) => {
          let list = this.lists.find((list) => list.id === data.id);
          if (list.checkItemForArchivability(item)) {
            this.moveItemtoArchive(item);
          }
        });
      PubSub.publish("lists_updated", {
        lists: this.lists,
      });
    });

    PubSub.subscribe("user_created_list", (msg, data) => {
      let list = new List(data.name);
      this.activeList = list.id;
      this.lists.push(list);
      this.lists.find((list) => list.id == this.activeList).activateList();
    });

    PubSub.subscribe("user_deleted_list", (msg, data) => {
      //REmove fr0m lists

      let deletedListId = this.getIdFromClass(data.id);
      this.lists = this.lists.filter((list) => {
        return list.id != deletedListId;
      });
      PubSub.publish("lists_updated", { lists: this.lists });
      //Check for final list removed
      if (this.lists.length === 0) {
        PubSub.publish("all_lists_removed");
        return;
      }
      //Check to see if this was the active list, activate a different list if so
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
      let newItem = new Todo(data.name);
      newItem.listId = this.activeList;
      this.lists.find((list) => list.id === this.activeList).addItem(newItem);
      PubSub.publish("lists_updated", { lists: this.lists });
    });

    PubSub.subscribe("item_edit_requested", (msg, data) => {
      let itemToCheck = this.lists
        .find((element) => element.id === this.activeList)
        .items.find((item) => item.id == data.id);
      let itemChanged = false;

      if (itemToCheck.priority !== data.priority) itemChanged = true;
      if (Math.abs(itemToCheck.dueDate - data.dueDate) >= 60000)
        itemChanged = true;
      if (itemToCheck.description !== data.description) itemChanged = true;
      if (itemToCheck.title !== data.title) itemChanged = true;

      if (itemChanged) {
        this.lists
          .find((element) => element.id === this.activeList)
          .items.find((item) => item.id == data.id).title = data.title;
        this.lists
          .find((element) => element.id === this.activeList)
          .items.find((item) => item.id == data.id).description =
          data.description;
        this.lists
          .find((element) => element.id === this.activeList)
          .items.find((item) => item.id == data.id).dueDate = data.dueDate;
        this.lists
          .find((element) => element.id === this.activeList)
          .items.find((item) => item.id == data.id).priority = data.priority;

        PubSub.publish("user_edited_item");
        PubSub.publish("lists_updated", {
          lists: this.lists,
        });
      }
    });

    PubSub.subscribe("list_edit_requested", (msg, data) => {
      let listChanged = false;

      if (data.title != this.lists.find((list) => list.id == data.id).name)
        listChanged = true;
      if (
        data.defaultDueTime !=
        this.lists.find((list) => list.id == data.id).defaultDue
      )
        listChanged = true;
      if (
        data.archiveTime !=
        this.lists.find((list) => list.id == data.id).autoArchiveDelay
      )
        listChanged = true;

      if (listChanged) {
        this.lists.find((list) => list.id == data.id).name = data.title;
        this.lists.find((list) => list.id == data.id).defaultDue =
          data.defaultDueTime;
        this.lists.find((list) => list.id == data.id).autoArchiveDelay =
          data.archiveTime;
        PubSub.publish("user_edited_list");
        PubSub.publish("lists_updated", {
          lists: this.lists,
        });
      }
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

    PubSub.subscribe("user_archived_item", (msg, data) => {
      let itemIdToArchive = this.getIdFromClass(data.id);
      this.lists
        .find((element) => element.id === this.activeList)
        .items.find((item) => {
          if (item.id == itemIdToArchive) this.moveItemtoArchive(item);
        });
      PubSub.publish("lists_updated", { lists: this.lists });
    });

    PubSub.subscribe("user_archived_list", (msg, data) => {
      let listId = this.getIdFromClass(data.id);
      this.lists
        .find((list) => list.id == listId)
        .items.forEach((item) => {
          if (item.isComplete) this.moveItemtoArchive(item);
        });
      PubSub.publish("lists_updated", { lists: this.lists });
    });

    PubSub.subscribe("user_loaded_list", (msg, data) => {
      this.lists.find((list) => list.id == data.id).activateList();
    });

    PubSub.subscribe("lists_retrieved_from_storage", (msg, data) => {
      this.loadListsFromStorage(data);
    });

    PubSub.subscribe("no_lists_in_storage", (msg, data) => this.newUserSetup());

    PubSub.publish("app_started");
  }

  newUserSetup() {
    console.log("No archive list found, setting up for new user.");
    //Create Archive
    let archiveList = new List("Archive");
    archiveList.isArchive = true;
    this.lists.push(archiveList);

    //Create a default list
    let defaultList = new List("Default");
    this.lists.push(defaultList);
    this.activeList = defaultList.id;

    //Create an initial Todo
    let defaultTodo = new Todo("Have a look around!");
    defaultTodo.listId = defaultList.id;
    defaultList.addItem(defaultTodo);

    this.lists.find((list) => list.id == defaultList.id).activateList();
  }

  loadListsFromStorage(data) {
    let retrievedLists = data.lists;

    retrievedLists.forEach((list) => {
      let newList = new List(list.name);
      newList.createdDate = list.createdDate || Date.now();
      newList.lastAccessed = list.lastAccessed || Date.now();
      newList.tags = list.tags;
      newList.isActive = list.isActive;
      newList.isArchive = list.isArchive;
      newList.defaultDue = list.defaultDue;
      newList.autoArchiveDelay = list.autoArchiveDelay;
      if (newList.isActive) this.activeList = newList.id;
      list.items.forEach((item) => {
        let newItem = new Todo(item.title);
        newItem.createdDate = item.createdDate;
        newItem.dueDate = item.dueDate;
        newItem.completedDate = item.completedDate;
        newItem.isComplete = item.isComplete;
        newItem.priority = item.priority;
        newItem.description = item.description;
        newItem.listId = newList.id;
        newItem.isArchived = item.isArchived;
        if (newList.isArchive) newItem.isArchived = true;
        if (newList.isArchive && !newItem.completedDate) newItem.markComplete();
        newList.addItem(newItem);
      });
      this.lists.push(newList);
    });
    PubSub.publish("lists_updated", { lists: this.lists });
  }

  getIdFromClass(className) {
    return className.replace(/[^0-9]/g, "");
  }

  moveItemtoArchive(item) {
    item.isArchived = true;
    this.lists.find((list) => list.isArchive).items.push(item);
    this.lists.find((list) => list.id == item.listId).removeItem(item.id);
  }
}
