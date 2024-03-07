new (class Storage {
  constructor() {
    //This is just here for testing
    this.listCount = 0;
    this.itemCount = 0;
    PubSub.subscribe("lists_updated", (msg, data) => {
      this.storeLists(data.lists);
    });
    PubSub.subscribe("app_started", (msg) => {
      this.retrieveLists();
    });
  }

  storeLists(lists) {
    localStorage.setItem("lists", JSON.stringify(lists));
  }

  retrieveLists() {
    let lists = JSON.parse(localStorage.getItem("lists"));
    //localStorage.clear();
    PubSub.publish("lists_retrieved_from_storage", { lists: lists });
    //Object.assign(JSON.parse(localStorage.getItem(id)), new Todo());
    //prototype must be set to re-attach the class methods, localstorage strips them
  }
})();
