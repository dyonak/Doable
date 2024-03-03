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

    PubSub.subscribe(
      "archive_complete_list_" + this.name,
      this.archiveComplete()
    );
  }

  addItem(item) {
    this.items.push(item);
    PubSub.publish("item_added_to_list", {
      itemID: item.id,
      listID: this.id,
    });
  }
  archiveComplete() {
    this.items.forEach((item) => {
      if (item.isComplete) {
        this.items.splice(item, 1);
      }
    });
  }
}
