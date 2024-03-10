import { addMilliseconds } from "date-fns";

new (class Toast {
  constructor() {
    this.TOAST_TIMEOUT = 3500;
    this.toastsDiv = document.querySelector(".toasts");
    PubSub.subscribe("*", (msg, data) => {
      this.prepToast(msg, data);
    });
  }

  prepToast(topic, data) {
    //Guard clause to limit toasts to user actions.
    if (!topic.includes("user")) return;
    console.log(data);
    let msg = topic.replace("user_", "");
    msg = msg.replace("_", " ");
    msg = msg.charAt(0).toUpperCase() + msg.slice(1);
    this.popToast(msg);
  }

  popToast(msg) {
    let toastDiv = document.createElement("div");
    toastDiv.classList.add("toast");
    toastDiv.classList.add("animate", "pop");

    let icon = document
      .createElement("i")
      .classList.add("fa-solid", "fa-champagne-glasses");
    //toastDiv.appendChild(icon);

    toastDiv.textContent += msg;
    this.toastsDiv.appendChild(toastDiv);
    setTimeout(this.eatToast, this.TOAST_TIMEOUT);
  }

  eatToast = function () {
    document.querySelector(".toast").remove();
  };
})();
