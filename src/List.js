export class List {
  static #id = 0;

  static #incrementID() {
    this.#id++;
  }
  constructor(
    name,
    createdDate = Date.now(),
    tags = [],
    items = [],
    isActive = false,
    isArchive = false
  ) {
    this.name = name;
    this.createdDate = createdDate;
    this.items = [];
    this.id = List.#id;
    List.#incrementID();
    this.isActive = false;
    this.isArchive = false;
    //this.activateList();
  }
  activateList() {
    this.isActive = true;
    PubSub.publish("list_activated", {
      name: this.name,
      id: this.id,
      active: this.isActive,
      createdDate: this.createdDate,
      items: this.items,
    });
  }

  addItem(item) {
    this.items.push(item);
  }

  removeItem(itemId) {
    this.items = this.items.filter((item) => {
      return item.id != itemId;
    });
  }
}
