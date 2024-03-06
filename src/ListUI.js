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

    this.addListInput.addEventListener("keypress", (e) => this.addList(e));
    this.addItemInput.addEventListener("keypress", (e) => this.addItem(e));

    document.addEventListener("keyup", (e) => this.handleShortcuts(e));

    PubSub.subscribe("item_added", (msg, data) => {
      this.displayItem(data.title, data.id);
    });

    PubSub.subscribe("lists_updated", (msg, data) => {
      this.displayLists(data.lists);
    });

    PubSub.subscribe("list_activated", (msg, data) => {
      this.displayActiveList(data.id, data.items);
    });
  }

  handleShortcuts(e) {
    if (
      this.addItemLi.style.display === "block" ||
      this.addListLi.style.display === "block"
    )
      return;
    console.log(e.keyCode);
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
    if (e.key === "Escape") {
      this.addItemLi.style.display = "none";
      this.addListLi.style.display = "none";
    }
  }
  toggleItemInput(e) {
    this.addItemLi.style.display =
      this.addItemLi.style.display === "none" ? "block" : "none";
    this.addItemInput.focus();
  }

  toggleListInput(e) {
    this.addListLi.style.display =
      this.addListLi.style.display === "none" ? "block" : "none";
    this.addListInput.focus();
    this.addItemInput.value = "";
  }

  addList(e) {
    if (e.key !== "Enter") return;
    if (this.addListInput.value === "") return;
    PubSub.publish("user_created_list", {
      name: this.addListInput.value,
    });
    this.addListInput.value = "";
    this.addListLi.style.display = "none";
  }

  addItem(e) {
    if (e.key !== "Enter") return;
    if (this.addItemInput.value === "") return;
    PubSub.publish("user_created_item", {
      name: this.addItemInput.value,
    });
    this.addItemInput.value = "";
    this.addItemLi.style.display = "none";
  }

  //   toggleAddForm(e) {
  //     if (e.target === this.addListDiv) {
  //       this.addListForm.style.visibility === "visible"
  //         ? (this.addListForm.style.visibility = "hidden")
  //         : (this.addListForm.style.visibility = "visible") &&
  //           this.addListForm.querySelector("input").focus();
  //     }
  //     if (e.target === this.addItemDiv) {
  //       this.addItemForm.style.visibility === "visible"
  //         ? (this.addItemForm.style.visibility = "hidden")
  //         : (this.addItemForm.style.visibility = "visible") &&
  //           this.addItemForm.querySelector("input").focus();
  //     }
  //   }

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
    });
    console.log();
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
      actionElement.classList.add("fa-solid");
      actionElement.classList.add("fa-" + action);
      actionElement.addEventListener("click", (e) =>
        this.processQuickAction(action, element)
      );
      element.appendChild(actionElement);
    });
  }

  processQuickAction(action, element) {
    console.log(`Action of ${action} on element ${element} detected.`);
    if (action === "trash") {
      console.log(element.classList[1]);
      PubSub.publish("user_deleted_" + element.classList[0], {
        id: element.classList[1],
      });
    }
  }

  displayActiveList(id, items) {
    //Update items area
    this.clearItemList();
    if (items.length > 0) {
      items.forEach((item) => {
        this.displayItem(item.title, item.id);
      });
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

  displayItem(title, id) {
    let li = document.createElement("li");
    li.classList.add("item");
    li.classList.add("item-" + id);
    li.textContent = title;
    //quick actions to be applied are fancy awesome font icons (eg - 'trash' here will add an i element with the fa-trash icon)
    this.appendQuickActions(li, ["trash", "pen"]);
    this.itemsBase.insertBefore(li, this.itemsBase.children[0]);
  }
}
