new (class Storage {
  constructor() {
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
    //Check for no lists, new user state
    if (!lists) {
      PubSub.publish("no_lists_in_storage");
      return;
    }

    PubSub.publish("lists_retrieved_from_storage", { lists: lists });
  }
})();
