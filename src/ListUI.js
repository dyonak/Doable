import {
  formatDistance,
  format,
  formatDistanceToNow,
  formatDistanceToNowStrict,
  formatRelative,
  parseISO,
} from "date-fns";

export class ListUi {
  constructor() {
    this.itemsBase = document.querySelector(".itemsContainer");
    this.listsBase = document.querySelector(".listsContainer");
    this.addItemDiv = document.querySelector(".addItem");
    this.addListDiv = document.querySelector(".addList");

    this.addListLi = document.querySelector(".addListLi");
    this.addListInput = document.querySelector(".addListInput");
    this.addItemLi = document.querySelector(".addItemLi");
    this.addItemInput = document.querySelector(".addItemInput");

    this.addListDiv.addEventListener("click", (e) => this.toggleListInput(e));
    this.addItemDiv.addEventListener("click", (e) => this.toggleItemInput(e));

    this.addListInput.addEventListener("keyup", (e) => this.addList(e));
    this.addItemInput.addEventListener("keyup", (e) => this.addItem(e));

    this.addListInput.addEventListener("blur", (e) => this.toggleListInput(e));
    this.addItemInput.addEventListener("blur", (e) => this.toggleItemInput(e));

    document.addEventListener("keyup", (e) => this.handleShortcuts(e));

    PubSub.subscribe("item_added", (msg, data) => {
      this.displayItem(data.title, data.id);
    });

    PubSub.subscribe("lists_updated", (msg, data) => {
      this.displayLists(data.lists);
    });

    PubSub.subscribe("all_lists_removed", (msg) => {
      this.clearLists();
      this.clearItemList();
    });
  }

  handleShortcuts(e) {
    if (document.querySelector(".active-item")) {
      const activeLi = document.querySelector(".active-item");
      if (
        e.key == "Enter" &&
        document.activeElement != activeLi.querySelector("#todoDescription")
      )
        this.processItemEdits();
      return;
    }
    if (
      this.addItemLi.style.display === "block" ||
      this.addListLi.style.display === "block"
    )
      return;
    //Check for l
    if (e.keyCode === 76) {
      this.toggleListInput(e);
    }
    //Check for t
    if (e.keyCode === 84) {
      this.toggleItemInput(e);
    }
    //Check for esc
    //Close/clear all current interactions
    if (e.key == "Escape") {
      this.addItemLi.style.display = "none";
      this.addListLi.style.display = "none";
    }
  }
  toggleItemInput(e) {
    this.addItemInput.value = "";
    this.addItemLi.style.display =
      this.addItemLi.style.display === "none" ? "block" : "none";
    this.addItemDiv.style.display =
      this.addItemLi.style.display === "none" ? "block" : "none";
    this.addItemInput.focus();
  }

  toggleListInput(e) {
    this.addListInput.value = "";
    this.addListLi.style.display =
      this.addListLi.style.display === "none" ? "block" : "none";
    this.addListDiv.style.display =
      this.addListLi.style.display === "none" ? "block" : "none";
    this.addListInput.focus();
  }

  addList(e) {
    if (e.key == "Escape") {
      this.toggleListInput(e);
      return;
    }
    if (e.key !== "Enter") return;
    if (this.addListInput.value === "") return;
    PubSub.publish("user_created_list", {
      name: this.addListInput.value,
    });
    this.toggleListInput(e);
  }

  addItem(e) {
    if (e.key == "Escape") {
      this.toggleItemInput(e);
      return;
    }
    if (e.key !== "Enter") return;
    if (this.addItemInput.value === "") return;
    PubSub.publish("user_created_item", {
      name: this.addItemInput.value,
    });
    this.toggleItemInput(e);
  }

  clearLists() {
    this.listsBase.replaceChildren(this.addListDiv);
    this.listsBase.insertBefore(this.addListLi, this.addListDiv);
  }

  clearItemList() {
    this.itemsBase.replaceChildren(this.addItemDiv);
    this.itemsBase.insertBefore(this.addItemLi, this.addItemDiv);
  }

  markListActive(id) {
    document.querySelector(".list-" + id).classList.add("active");
  }

  displayLists(lists) {
    this.clearLists();
    lists.forEach((list) => {
      this.displayList(list.name, list.id, list.isActive, list.isArchive);
      if (list.isActive) {
        //Set active class for this list's ID
        let listDivs = document.querySelectorAll(".list");
        listDivs.forEach((listDiv) => {
          if (listDiv.classList.contains("list-" + list.id)) {
            listDiv.classList.add("active");
            this.appendQuickActions(listDiv, ["trash", "pen", "box-archive"]);
          } else {
            if (listDiv.classList.contains("active"))
              listDiv.classList.remove("active");
            if (listDiv.querySelector(".quickActions"))
              listDiv.querySelector(".quickActions").remove();
          }
        });
        if (list.isArchive) {
          document
            .querySelector(".list-" + list.id + ">.quickActions")
            .remove();
        }
        this.displayListItems(list.id, list.items);
      }
    });
  }

  displayList(title, id, isActive, isArchive) {
    let li = document.createElement("li");
    li.classList.add("list");
    li.classList.add("list-" + id);
    if (isActive) li.classList.add("active");

    if (isArchive) {
      let archiveIcon = document.createElement("i");
      archiveIcon.classList.add("fa-solid", "fa-box-archive");
      li.appendChild(archiveIcon);
      li.classList.add("archive");
    }

    let titleText = document.createElement("span");
    titleText.textContent = " " + title;
    li.appendChild(titleText);

    li.addEventListener("click", (e) => {
      PubSub.publish("user_loaded_list", { id });
    });

    if (isArchive) {
      this.listsBase.insertBefore(li, this.addListLi);
    } else {
      this.listsBase.insertBefore(li, this.listsBase.children[0]);
    }
  }

  displayListItems(id, items) {
    //Update items area
    this.clearItemList();
    if (items.length > 0) {
      items.sort((a, b) => {
        if (a.isArchived) {
          //Sort the archive by completedDate with newest first
          return a.completedDate - b.completedDate;
        } else {
          //Sort other lists so all completed are at the bottom and remainer go from closest to due to farthest
          return b.isComplete - a.isComplete || b.dueDate - a.dueDate;
        }
      });

      items.forEach((item) => {
        this.displayItem(item);
      });
    }
  }

  appendQuickActions(element, actionsList) {
    actionsList.forEach((action) => {
      if (!element.querySelector(".quickActions")) {
        let quickActionsDiv = document.createElement("div");
        quickActionsDiv.classList.add("quickActions");
        element.appendChild(quickActionsDiv);
      }

      let actionElement = document.createElement("i");
      //TODO: Fix this hacky long string approach to change the solid/regular class
      let faStyle = "clocksquare".includes(action) ? "fa-regular" : "fa-solid";
      actionElement.classList.add(faStyle);
      actionElement.classList.add("fa-" + action, "grow");
      actionElement.addEventListener("click", (e) => {
        e.stopPropagation();
        this.processQuickAction(action, element);
      });

      //Put the actions into the quick actions div unless the action is marking complete
      if (
        actionElement.classList.contains("fa-square-check") ||
        actionElement.classList.contains("fa-square")
      ) {
        element.appendChild(actionElement);
      } else {
        element.querySelector(".quickActions").appendChild(actionElement);
      }
    });
  }

  confirmAction(action, element) {
    console.log("confirming " + action);
    let actionElement = element.querySelector(".fa-" + action);
    [...element.querySelector(".quickActions").children].forEach(
      (child) => (child.style.display = "none")
    );

    let confirmButton = document.createElement("button");

    //Set default action string
    let actionString = "unknown action";

    //Map the action (which is based on the font awesome name) to a meaningful action name for our purposes
    if (action === "box-archive") actionString = "archive";
    if (action === "trash") actionString = "delete";

    //Format the confirmation string
    confirmButton.textContent =
      actionString.charAt(0).toUpperCase() + actionString.slice(1) + "?";
    confirmButton.classList.add("red");

    //Setup cancel button
    let cancelButton = document.createElement("button");
    cancelButton.innerHTML = "<i class='fa-solid fa-rotate-left'></i>";
    cancelButton.classList.add("grey");

    confirmButton.addEventListener("click", (e) => {
      e.preventDefault();
      [...element.querySelector(".quickActions").children].forEach(
        (child) => (child.style.display = "inline-block")
      );

      cancelButton.remove();
      confirmButton.remove();
      PubSub.publish("user_" + actionString + "d_" + element.classList[0], {
        id: element.classList[1],
      });
    });

    cancelButton.addEventListener("click", (e) => {
      e.preventDefault();
      [...element.querySelector(".quickActions").children].forEach(
        (child) => (child.style.display = "inline-block")
      );
      cancelButton.remove();
      confirmButton.remove();
    });
    element
      .querySelector(".quickActions")
      .insertBefore(confirmButton, actionElement);
    element
      .querySelector(".quickActions")
      .insertBefore(cancelButton, actionElement);
  }

  processQuickAction(action, element) {
    if (action === "trash") {
      this.confirmAction(action, element);
    }
    if (action === "box-archive") {
      this.confirmAction(action, element);
    }
    if (action === "square") {
      PubSub.publish("user_completed_" + element.classList[0], {
        id: element.classList[1],
      });
    }
    if (action === "square-check") {
      PubSub.publish("user_uncompleted_" + element.classList[0], {
        id: element.classList[1],
      });
    }
    if (action === "pen") {
      PubSub.publish("editing_" + element.classList[0], {
        id: element.classList[1],
      });

      if (element.classList[0] === "list") return;

      //Handle item edits
      let detailsContainer = document.querySelector(
        "." + element.classList[1] + " .detailsContainer"
      );

      if (
        document.querySelector(".active-item") &&
        !element.classList.contains("active-item")
      )
        return;
      //Process the form if we're going from open to closed
      if (detailsContainer.style.display == "block") {
        this.processItemEdits();
        return;
      }

      //Toggle display and active state
      detailsContainer.style.display =
        detailsContainer.style.display == "block" ? "none" : "block";
      detailsContainer.parentElement.classList.contains("active-item")
        ? detailsContainer.parentElement.classList.remove("active-item")
        : detailsContainer.parentElement.classList.add("active-item");
      detailsContainer.classList.contains("animate", "slide")
        ? detailsContainer.classList.remove("animate", "slide")
        : detailsContainer.classList.add("animate", "slide");
    }
  }

  displayItem(item) {
    //title, id, priority, description, isComplete, dueDate, tags
    //Setup li with classes
    let li = document.createElement("li");
    li.classList.add("item");
    li.classList.add("item-" + item.id);

    //Create the check-square used to complete the item
    let completeIcon = item.isComplete ? "square-check" : "square";
    this.appendQuickActions(li, [completeIcon]);

    //Create title span to hold the item's title
    let titleSpan = document.createElement("span");
    titleSpan.classList.add("itemTitle");
    titleSpan.textContent = item.title;
    li.appendChild(titleSpan);

    //quick actions to be applied are font awesome icons (eg - 'trash' here will add an i element with the fa-trash icon)
    this.appendQuickActions(li, ["trash", "pen"]);

    //Add due date info
    this.displayItemDateInfo(li, item.dueDate);
    //Style based on item parameters
    if (item.isComplete) {
      li.classList.add("strikethrough");
    }

    //Add priority tag
    let prioIcon = document.createElement("i");

    prioIcon.title = "Priority " + item.priority;

    prioIcon.classList.add("fa-solid", "fa-p", "priority" + item.priority);

    prioIcon.textContent = item.priority;
    li.querySelector(".dueDistance").insertBefore(
      prioIcon,
      li.querySelector(".fa-clock")
    );

    //Add expanded div with additional info, this will default to display: none
    let detailsContainer = document.createElement("div");
    detailsContainer.classList.add("detailsContainer");
    detailsContainer.innerHTML = `
    <div class="detailsForm">
    <div><label for="todoTitle" id="todoTitleLabel">Todo</label>
    <input type="input" name="todoTitle" tabindex="1" id="todoTitle" value="${
      item.title
    }" /></div>

    <div><label for="todoDueDate" id="todoDueDateLabel">Due Date</label>
    <input type="datetime-local" height="100" tabindex="2" name="todoDueDate" id="todoDueDate" value="${format(
      item.dueDate,
      "yyyy-MM-dd'T'HH:mm"
    )}" /></div>
    

    <div><label for="todoPriority" id="todoPriorityLabel">Priority</label>
    <select name="todoPriority" id="todoPriority" tabindex="3" />
      <option value="1">Priority 1</option>
      <option value="2">Priority 2</option>
      <option value="3">Priority 3</option>
      <option value="4">Priority 4</option>
    </select>
    </div>

    <div><label for="todoDescription" id="todoDescriptionLabel">Description</label>
    <textarea type="input" name="todoDescription" tabindex="4" id="todoDescription">${
      item.description
    }</textarea></div>

    </div>`;

    //Specific styling/option changes for complete items
    if (item.isComplete) li.removeChild(li.querySelector(".dueDistance"));
    if (item.isComplete) this.appendQuickActions(li, ["box-archive"]);

    //Append the detailscontainer to the li
    li.appendChild(detailsContainer);

    //Set the priority field on the form to the current priority
    let curPrio = detailsContainer.querySelector(
      `#todoPriority option[value="${item.priority}"]`
    );
    curPrio.selected = true;

    //Create the button 'fa-floppy-disk' and the event listener for processing changes
    let saveButton = document.createElement("i");
    saveButton.classList.add("fa-regular", "fa-floppy-disk", "grow");
    saveButton.addEventListener("click", () => this.processItemEdits());
    detailsContainer.appendChild(saveButton);

    //Style archived items
    if (item.isArchived) {
      li.querySelector(".fa-pen").remove();
      li.querySelector(".fa-trash").remove();
      li.classList.remove("strikethrough");
      li.classList.add("archived");

      //Clone the checkmark icon to remove the event listeners so this can't be marked incomplete
      let old_check = li.querySelector(".fa-square-check");
      let new_check = old_check.cloneNode(true);
      li.querySelector(".fa-square-check").remove();

      //Also clone box-archive to remove event listeners
      let old_archive = li.querySelector(".fa-box-archive");
      let new_archive = old_archive.cloneNode(true);
      old_archive.parentNode.replaceChild(new_archive, old_archive);

      this.displayItemDateInfo(li, item.completedDate);
      li.querySelector(".dueDistance").replaceChild(
        new_check,
        li.querySelector(".fa-clock")
      );

      //We should have an "expand" option that pulls up details similar to the pen icon pre-archive
      //A user likely wants the ability to view details/notes of previously completed items
    }

    //Add the compeleted todo item li to the ul
    this.itemsBase.insertBefore(li, this.itemsBase.children[0]);
  }

  processItemEdits() {
    //Get all the current item's info from the UI
    let activeItemLi = document.querySelector(".active-item");
    let id = activeItemLi.classList[1].replace("item-", "");
    let title = activeItemLi.querySelector("#todoTitle").value;
    let dueDate = activeItemLi.querySelector("#todoDueDate").value;

    //Parse and format the date back to a unix timestamp
    dueDate = new Date(dueDate).valueOf();

    let priority = activeItemLi.querySelector("#todoPriority").value;
    let description = activeItemLi.querySelector("#todoDescription").value;

    //Publish check for changes
    PubSub.publish("item_edit_requested", {
      id: id,
      title: title,
      dueDate: dueDate,
      priority: priority,
      description: description,
    });

    //If changed ListApp will publish an update_lists

    //Make sure the form is closed and the active-item is turned off
    activeItemLi.classList.remove("active-item");
    activeItemLi.querySelector(".detailsContainer").style.display = "none";
  }

  displayItemDateInfo(li, itemDate) {
    //Create due distance div
    let dueDistanceDiv = document.createElement("span");
    dueDistanceDiv.classList.add("dueDistance");

    //Create and add classes for icon
    let dueDistanceIcon = document.createElement("i");
    dueDistanceIcon.classList.add("fa-regular", "fa-clock");
    dueDistanceDiv.appendChild(dueDistanceIcon);

    //Add text
    let dueDistance = formatDistance(itemDate, Date.now(), { addSuffix: true });
    let dueDistanceTextSpan = document.createElement("span");
    dueDistanceTextSpan.textContent = dueDistance;
    dueDistanceDiv.appendChild(dueDistanceTextSpan);

    //Style based on time until due date
    if (itemDate - Date.now() < 0) {
      dueDistanceDiv.classList.add("overdue");
    }

    if (
      itemDate - Date.now() < 24 * 60 * 60 * 1000 &&
      itemDate - Date.now() > 0
    ) {
      dueDistanceDiv.classList.add("dueToday");
    }
    li.appendChild(dueDistanceDiv);
  }
}
