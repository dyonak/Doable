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
    isComplete = false,
    priority = 2,
    description = ""
  ) {
    this.title = title;
    this.createdDate = createdDate;
    this.dueDate = dueDate;
    this.isComplete = isComplete;
    this.priority = priority;
    this.description = description;
    this.id = Todo.#id;
    Todo.#incrementID();

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
