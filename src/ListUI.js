export class ListUi {
  constructor() {
    this.itemsBase = document.querySelector(".itemsContainer");
    this.listsBase = document.querySelector(".listsContainer");
    this.addItemDiv = document.querySelector(".addItem");
    this.addListDiv = document.querySelector(".addList");
    this.addListForm = document.querySelector(".addListForm");
    this.addItemForm = document.querySelector(".addItemForm");
    this.addListSubmit = document.querySelector("#addListSubmit");
    this.addListCancel = document.querySelector("#addListCancel");
    this.addItemSubmit = document.querySelector("#addItemSubmit");
    this.addItemCancel = document.querySelector("#addItemCancel");

    this.addListDiv.addEventListener("click", (e) => this.toggleAddForm(e));
    this.addItemDiv.addEventListener("click", (e) => this.toggleAddForm(e));

    this.addListSubmit.addEventListener("click", (e) => this.addList(e));
    this.addItemSubmit.addEventListener("click", (e) => this.addItem(e));

    this.addListCancel.addEventListener("click", (e) => {
      e.preventDefault();
      this.addListForm.style.visibility = "hidden";
    });
    this.addItemCancel.addEventListener("click", (e) => {
      e.preventDefault();
      this.addItemForm.style.visibility = "hidden";
    });

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

  addList(e) {
    e.preventDefault();
    if (document.querySelector("#listName").value === "") return;
    PubSub.publish("user_created_list", {
      name: document.querySelector("#listName").value,
    });
    document.querySelector("#listName").value = "";
    this.addListForm.style.visibility = "hidden";
  }

  addItem(e) {
    e.preventDefault();
    if (document.querySelector("#itemName").value === "") return;
    PubSub.publish("user_created_item", {
      name: document.querySelector("#itemName").value,
    });
    document.querySelector("#itemName").value = "";
    this.addItemForm.style.visibility = "hidden";
  }

  toggleAddForm(e) {
    if (e.target === this.addListDiv) {
      this.addListForm.style.visibility === "visible"
        ? (this.addListForm.style.visibility = "hidden")
        : (this.addListForm.style.visibility = "visible") &&
          this.addListForm.querySelector("input").focus();
    }
    if (e.target === this.addItemDiv) {
      this.addItemForm.style.visibility === "visible"
        ? (this.addItemForm.style.visibility = "hidden")
        : (this.addItemForm.style.visibility = "visible") &&
          this.addItemForm.querySelector("input").focus();
    }
  }

  clearLists() {
    this.listsBase.replaceChildren(this.addListDiv);
  }

  clearItemList() {
    this.itemsBase.replaceChildren(this.addItemDiv);
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
      PubSub.publish("list_clicked", { id });
    });
    this.listsBase.insertBefore(li, this.listsBase.children[0]);
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
    li.classList.add("item-" + id);
    li.textContent = title;
    this.itemsBase.insertBefore(li, this.itemsBase.children[0]);
  }
}
