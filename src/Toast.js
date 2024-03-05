new (class Toast {
  constructor() {
    this.TOAST_TIMEOUT = 3000;
    this.footer = document.querySelector("footer");
    PubSub.subscribe("*", (msg, data) => {
      this.prepToast(msg);
    });
  }

  prepToast(topic) {
    //Guard clause to limit toasts to user actions.
    if (!topic.includes("user")) return;

    let msg = topic.replace("user_", "");
    msg = msg.replace("_", " ");
    this.popToast(msg.replace("user_", ""));
  }

  popToast(msg) {
    let toastDiv = document.createElement("div");
    toastDiv.classList.add("toast");
    toastDiv.textContent = msg;

    this.footer.appendChild(toastDiv);
    setTimeout(this.eatToast, this.TOAST_TIMEOUT);
  }

  eatToast = function () {
    document.querySelector(".toast").remove();
  };
})();
