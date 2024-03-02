export class Todo {
  constructor(
    title,
    createDate = Date.now(),
    //Default to 1 day from now hrs * min * sec * ms
    dueDate = Date.now() + 24 * 60 * 60 * 1000,
    isComplete = false,
    description = ""
  ) {
    this.title = title;
    this.createDate = createDate;
    this.dueDate = dueDate;
    this.isComplete = isComplete;
    this.description = description;

    PubSub.subscribe("todo_completed", () => {
      this.markComplete();
    });

    PubSub.publish("item_added", {
      title: this.title,
    });
  }
  markComplete() {
    this.isComplete = true;
  }
}

//Since Todos are stored in localStorage in this implementation the prototype holds the class's methods
// export class TodoProto {
//   markComplete() {
//     this.isComplete = true;
//   }
// }
