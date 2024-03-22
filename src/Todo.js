export class Todo {
  static #id = 0;

  static #incrementID() {
    this.#id++;
  }

  constructor(
    title,
    createdDate = Date.now(),
    //Default to 1 day from now hrs * min * sec * ms
    dueDate = Date.now() + 24 * 60 * 60 * 1000,
    completedDate = null,
    isComplete = false,
    priority = 3,
    description = "",
    listId = null,
    isArchived = false
  ) {
    this.title = title;
    this.createdDate = createdDate;
    this.dueDate = dueDate;
    this.completedDate = completedDate;
    this.isComplete = isComplete;
    this.priority = priority;
    this.description = description;
    this.listId = null;
    this.isArchived = false;
    this.id = Todo.#id;
    Todo.#incrementID();

    PubSub.publish("item_added", {
      title: this.title,
      id: this.id,
    });
  }

  markComplete() {
    this.isComplete = true;
    this.completedDate = Date.now();
  }

  markIncomplete() {
    this.isComplete = false;
    this.completedDate = null;
  }
}
