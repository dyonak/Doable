export class List {
  constructor(name, createdDate = Date.now(), tags = []) {
    this.name = name;
    this.createdDate = createdDate;
    this.tags = tags;
    this.items = [];

    PubSub.subscribe(
      "archive_complete_list_" + this.name,
      this.archiveComplete()
    );
  }

  addItem(item) {
    this.items.push(item);
    PubSub.publish("item_added_to_list_" + this.name, (msg, data) => {});
  }
  archiveComplete() {
    this.items.forEach((item) => {
      if (item.isComplete) {
        this.items.splice(item, 1);
      }
    });
  }
}
