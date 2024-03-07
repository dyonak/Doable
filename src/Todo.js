export class Todo {
  static #id = 0;

  static #incrementID() {
    this.#id++;
  }

  constructor(
    title,
    createDate = Date.now(),
    //Default to 1 day from now hrs * min * sec * ms
    dueDate = Date.now() + 24 * 60 * 60 * 1000,
    isComplete = false,
    priority = 2,
    description = "",
    listId = null
  ) {
    this.title = title;
    this.createDate = createDate;
    this.dueDate = dueDate;
    this.isComplete = isComplete;
    this.priority = priority;
    this.description = description;
    this.id = Todo.#id;
    Todo.#incrementID();
    this.listID = listId;

    PubSub.subscribe("user_marked_complete", () => {
      this.markComplete();
    });

    PubSub.publish("item_added", {
      title: this.title,
      id: this.id,
    });
  }
  markComplete() {
    this.isComplete = true;
  }
}
