import { eachHourOfInterval } from "date-fns";

new (class ListUi {
  constructor() {
    this.listBase = document.querySelector("body");

    PubSub.subscribe("item_added", (msg, data) => {
      this.displayItem(data.title, data.id);
    });

    PubSub.subscribe("item_added_to_list", (msg, data) => {
      this.updateTodoListAssociation(data.itemID, data.listID);
    });
  }

  displayItem(title, id) {
    let li = document.createElement("li");
    li.classList.add("item-" + id);
    li.textContent = title;
    this.listBase.appendChild(li);
  }

  updateTodoListAssociation(todoID, listID) {
    console.log(todoID + " " + listID);
    let li = document
      .querySelector(".item-" + todoID)
      .classList.add("list-" + listID);
  }
})();
