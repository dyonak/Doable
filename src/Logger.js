new (class Logger {
  constructor() {
    PubSub.subscribe("*", (msg, data) => {
      this.logMessage(msg, data);
    });
  }

  logMessage(msg, data) {
    console.log("%cMessage: " + msg + " \nData: " + data, "color: grey");
  }
  logInfo(msg, data) {
    console.log("%cMessage: " + msg + " \nData: " + data, "color: darkblue");
  }
  logWarning(msg, data) {
    console.log("%cMessage: " + msg + " \nData: " + data, "color: orange");
  }
  logFailure(msg, data) {
    console.log("%cMessage: " + msg + " \nData: " + data, "color: red");
  }
})();
