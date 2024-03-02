new (class ListUi {
  constructor() {
    this.listBase = document.querySelector("body");

    PubSub.subscribe("item_added", (msg, data) => {
      this.displayItem(data.title);
    });
  }

  displayItem(title) {
    let li = document.createElement("li");
    li.classList.add("list-item");
    li.textContent = title;
    this.listBase.appendChild(li);
  }
})();
