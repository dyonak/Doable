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
    this.createdDate;
    this.items = [];
    this.id = List.#id;
    List.#incrementID();
    this.isActive = false;
    this.isArchive = false;
    //Initial default due distance for all items created in this list, currently 1 day
    this.defaultDue = 24 * 60 * 60 * 1000;
    //Initial auto archive for this list set to 1 week, completed items will be archived after 1 week
    this.autoArchiveDelay = 7 * 24 * 60 * 60 * 1000;
    this.lastAccessed;
    //this.activateList();
  }
  activateList() {
    this.isActive = true;
    this.lastAccessed = Date.now();
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
