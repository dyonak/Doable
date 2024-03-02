new (class StorageManager {
  constructor() {
    //This is just here for testing
  }

  storeObj(obj) {
    localStorage.setItem(this.getNextID(), JSON.stringify(obj));
    return this.getNextID() - 1;
  }

  getNextID() {
    return localStorage.length;
  }

  retrieveObj(id) {
    //Object.assign(JSON.parse(localStorage.getItem(id)), new Todo());
    //prototype must be set to re-attach the class methods, localstorage strips them
    return Object.setPrototypeOf(
      JSON.parse(localStorage.getItem(id)),
      Todo.prototype
    );
  }
})();
