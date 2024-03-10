import {
  formatDistance,
  format,
  formatDistanceToNow,
  formatDistanceToNowStrict,
  formatRelative,
} from "date-fns";

export class ListUi {
  constructor() {
    this.itemsBase = document.querySelector(".itemsContainer");
    this.listsBase = document.querySelector(".listsContainer");
    this.addItemDiv = document.querySelector(".addItem");
    this.addListDiv = document.querySelector(".addList");

    this.addListLi = document.querySelector(".addListLi");
    this.addListInput = document.querySelector(".addListInput");
    this.addItemLi = document.querySelector(".addItemLi");
    this.addItemInput = document.querySelector(".addItemInput");

    this.addListDiv.addEventListener("click", (e) => this.toggleListInput(e));
    this.addItemDiv.addEventListener("click", (e) => this.toggleItemInput(e));

    this.addListInput.addEventListener("keyup", (e) => this.addList(e));
    this.addItemInput.addEventListener("keyup", (e) => this.addItem(e));

    this.addListInput.addEventListener("blur", (e) => this.toggleListInput(e));
    this.addItemInput.addEventListener("blur", (e) => this.toggleItemInput(e));

    document.addEventListener("keyup", (e) => this.handleShortcuts(e));

    PubSub.subscribe("item_added", (msg, data) => {
      this.displayItem(data.title, data.id);
    });

    PubSub.subscribe("lists_updated", (msg, data) => {
      this.displayLists(data.lists);
    });

    PubSub.subscribe("all_lists_removed", (msg) => {
      this.clearLists();
      this.clearItemList();
    });
  }

  handleShortcuts(e) {
    if (
      this.addItemLi.style.display === "block" ||
      this.addListLi.style.display === "block"
    )
      return;
    //Check for l
    if (e.keyCode === 76) {
      this.toggleListInput(e);
    }
    //Check for t
    if (e.keyCode === 84) {
      this.toggleItemInput(e);
    }
    //Check for esc
    //Close/clear all current interactions
    if (e.key == "Escape") {
      this.addItemLi.style.display = "none";
      this.addListLi.style.display = "none";
    }
  }
  toggleItemInput(e) {
    this.addItemInput.value = "";
    this.addItemLi.style.display =
      this.addItemLi.style.display === "none" ? "block" : "none";
    this.addItemDiv.style.display =
      this.addItemLi.style.display === "none" ? "block" : "none";
    this.addItemInput.focus();
  }

  toggleListInput(e) {
    this.addListInput.value = "";
    this.addListLi.style.display =
      this.addListLi.style.display === "none" ? "block" : "none";
    this.addListDiv.style.display =
      this.addListLi.style.display === "none" ? "block" : "none";
    this.addListInput.focus();
  }

  addList(e) {
    if (e.key == "Escape") {
      this.toggleListInput(e);
      return;
    }
    if (e.key !== "Enter") return;
    if (this.addListInput.value === "") return;
    PubSub.publish("user_created_list", {
      name: this.addListInput.value,
    });
    this.toggleListInput(e);
  }

  addItem(e) {
    if (e.key == "Escape") {
      this.toggleItemInput(e);
      return;
    }
    if (e.key !== "Enter") return;
    if (this.addItemInput.value === "") return;
    PubSub.publish("user_created_item", {
      name: this.addItemInput.value,
    });
    this.toggleItemInput(e);
  }

  clearLists() {
    this.listsBase.replaceChildren(this.addListDiv);
    this.listsBase.insertBefore(this.addListLi, this.addListDiv);
  }

  clearItemList() {
    this.itemsBase.replaceChildren(this.addItemDiv);
    this.itemsBase.insertBefore(this.addItemLi, this.addItemDiv);
  }

  markListActive(id) {
    document.querySelector(".list-" + id).classList.add("active");
  }

  displayLists(lists) {
    this.clearLists();
    lists.forEach((list) => {
      this.displayList(list.name, list.id, list.isActive);
      if (list.isActive) {
        this.displayActiveList(list.id, list.items);
      }
    });
  }

  displayList(title, id, isActive) {
    let li = document.createElement("li");
    li.classList.add("list");
    li.classList.add("list-" + id);
    if (isActive) li.classList.add("active");
    li.textContent = title;
    li.addEventListener("click", (e) => {
      PubSub.publish("user_loaded_list", { id });
    });
    //quick actions to be applied, the list, are fancy awesome font icons (eg - 'trash' here will add an i element with the fa-trash icon)
    this.appendQuickActions(li, ["trash", "pen"]);
    this.listsBase.insertBefore(li, this.listsBase.children[0]);
  }

  appendQuickActions(element, actionsList) {
    actionsList.forEach((action) => {
      let actionElement = document.createElement("i");

      //TODO: Fix this hacky long string approach to change the solid/regular class
      let faStyle = "clocksquare".includes(action) ? "fa-regular" : "fa-solid";
      actionElement.classList.add(faStyle);
      actionElement.classList.add("fa-" + action, "grow");
      actionElement.addEventListener("click", (e) => {
        e.stopPropagation();
        this.processQuickAction(action, element);
      });
      element.appendChild(actionElement);
    });
  }

  processQuickAction(action, element) {
    if (action === "trash") {
      PubSub.publish("user_deleted_" + element.classList[0], {
        id: element.classList[1],
      });
    }
    if (action === "square") {
      PubSub.publish("user_completed_" + element.classList[0], {
        id: element.classList[1],
      });
    }
    if (action === "square-check") {
      PubSub.publish("user_uncompleted_" + element.classList[0], {
        id: element.classList[1],
      });
    }
    if (action === "pen") {
      PubSub.publish("editing_" + element.classList[0], {
        id: element.classList[1],
      });
    }
  }

  displayActiveList(id, items) {
    //Update items area
    this.clearItemList();
    if (items.length > 0) {
      items.sort((a, b) => {
        return b.isComplete - a.isComplete || b.dueDate - a.dueDate;
      });

      items.forEach((item) => {
        this.displayItem(
          item.title,
          item.id,
          item.priority,
          item.isComplete,
          item.dueDate
        );
        console.log("Displaying " + item.title);
      });
      console.log("Displayed items.");
    }
    //Set active class for this list's ID
    let listDivs = document.querySelectorAll(".list");
    listDivs.forEach((listDiv) => {
      if (listDiv.classList.contains("active"))
        listDiv.classList.remove("active");
      if (listDiv.classList.contains("list-" + id))
        listDiv.classList.add("active");
    });
  }

  displayItem(title, id, prio, isComplete, dueDate) {
    //Setup li with classes
    let li = document.createElement("li");
    li.classList.add("item");
    li.classList.add("item-" + id);

    //Create the check-square used to complete the item
    let completeIcon = isComplete ? "square-check" : "square";
    this.appendQuickActions(li, [completeIcon]);

    //Create title span to hold the item's title
    let titleSpan = document.createElement("span");
    titleSpan.classList.add("itemTitle");
    titleSpan.textContent = title;
    li.appendChild(titleSpan);

    //quick actions to be applied are font awesome icons (eg - 'trash' here will add an i element with the fa-trash icon)
    this.appendQuickActions(li, ["trash", "pen"]);

    //Add due date info
    this.displayItemDueDateInfo(li, dueDate);
    //Style based on item parameters
    if (isComplete) {
      li.classList.add("strikethrough");
    }

    this.itemsBase.insertBefore(li, this.itemsBase.children[0]);
  }

  displayItemDueDateInfo(li, dueDate) {
    //Create due distance div
    let dueDistanceDiv = document.createElement("span");
    dueDistanceDiv.classList.add("dueDistance");
    //Create and add classes for icon
    let dueDistanceIcon = document.createElement("i");
    dueDistanceIcon.classList.add("fa-regular", "fa-clock");
    dueDistanceDiv.appendChild(dueDistanceIcon);

    //Add text
    let dueDistance = formatDistance(dueDate, Date.now(), { addSuffix: true });
    let dueDistanceTextSpan = document.createElement("span");
    dueDistanceTextSpan.textContent = dueDistance;
    dueDistanceDiv.appendChild(dueDistanceTextSpan);

    //Style based on time until due date
    if (dueDate - Date.now() < 0) {
      dueDistanceDiv.classList.add("overdue");
    }

    if (
      dueDate - Date.now() < 24 * 60 * 60 * 1000 &&
      dueDate - Date.now() > 0
    ) {
      dueDistanceDiv.classList.add("dueToday");
    }

    li.appendChild(dueDistanceDiv);
  }
}
