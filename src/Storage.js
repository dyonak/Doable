new (class Storage {
  constructor() {
    //This is just here for testing
    this.listCount = 0;
    this.itemCount = 0;
    PubSub.subscribe("lists_updated", (msg, data) => {
      this.storeLists(data.lists);
    });
    this.retrieveLists();
  }

  storeLists(lists) {
    localStorage.setItem("lists", JSON.stringify(lists));
  }

  retrieveLists() {
    //Object.assign(JSON.parse(localStorage.getItem(id)), new Todo());
    //prototype must be set to re-attach the class methods, localstorage strips them
  }
})();
