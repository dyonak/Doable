export class List {
  static #id = 0;

  static #incrementID() {
    this.#id++;
  }
  constructor(name, createdDate = Date.now(), tags = [], items = []) {
    this.name = name;
    this.createdDate = createdDate;
    this.tags = tags;
    this.items = [];
    this.id = List.#id;
    List.#incrementID();
    this.isActive = false;
    this.activateList();

    // PubSub.subscribe("list_activated", (msg, data) => {
    //   if (this.id !== data.id) {
    //     this.isActive = false;
    //   } else {
    //     this.isActive = true;
    //   }
    // });
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

  archiveComplete() {
    this.items = this.items.filter((item) => item.isComplete === false);
  }
}
