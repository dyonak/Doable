export class List {
  static #id = 0;

  static #incrementID() {
    this.#id++;
  }
  constructor(name, createdDate = Date.now(), tags = []) {
    this.name = name;
    this.createdDate = createdDate;
    this.tags = tags;
    this.items = [];
    List.#incrementID();
    this.id = List.#id;
    this.isActive = false;
    this.activateList();

    PubSub.subscribe("list_activated", (msg, data) => {
      if (this.id !== data.id) {
        this.isActive = false;
      }
    });
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
    PubSub.publish("item_added_to_list", {
      itemID: item.id,
      listID: this.id,
    });
  }
  archiveComplete() {
    this.items = this.items.filter((item) => item.isComplete === false);
  }
}
