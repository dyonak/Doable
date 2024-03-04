export class ListUi {
  constructor() {
    this.activeList = 1;
    this.itemsBase = document.querySelector(".itemsContainer");
    this.listsBase = document.querySelector(".listsContainer");
    this.addItem = document.querySelector(".addItem");

    PubSub.subscribe("item_added", (msg, data) => {
      this.displayItem(data.title, data.id);
    });

    PubSub.subscribe("item_added_to_list", (msg, data) => {
      this.updateTodoListAssociation(data.itemID, data.listID);
    });

    PubSub.subscribe("list_activated", (msg, data) => {
      this.activeList = data.id;
      this.displayActiveList(data.items);
    });
  }

  clearMainList() {
    this.itemsBase.replaceChildren(this.addItem);
  }

  displayActiveList(items) {
    this.clearMainList();
    items.forEach((item) => {
      this.displayItem(item.title, item.id);
    });
  }

  displayItem(title, id) {
    let li = document.createElement("li");
    li.classList.add("item-" + id);
    li.textContent = title;
    this.itemsBase.insertBefore(li, this.itemsBase.children[0]);
  }

  updateTodoListAssociation(todoID, listID) {
    let li = document
      .querySelector(".item-" + todoID)
      .classList.add("list-" + listID);
  }
}
