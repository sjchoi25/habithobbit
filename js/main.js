// Retrieves the habit data. Only to be used once at the beginning of load.
function getData() {
    // Try retrieval
    const retrieved = localStorage.getItem("data");
    // If fails, return empty array
    if (retrieved === null) {
        //storeData({});
        return {};
    }
    // Success, then we parse
    else {
        return JSON.parse(retrieved);
    }
}

// get data
habits = getData();

intervalID = {};

// Data should look like
/*
habits = {
    h1: {
        active: true,
        interval: 50000,
        description: "A boring habit",
        title: "A title",
        color: "blue"
    },
};
*/

// Stores the data inputted, where data is the habit data
function storeData() {
    localStorage.setItem("data", JSON.stringify(habits));
}

// ONLY FOR RESETTING HABITS
function _deleteData() {
    localStorage.setItem("data", JSON.stringify({}));
}
// h1, h2, h3, ...
// First call updateHabitData (even when creating new habits)
// And then call updateHabitDOM to add the data to the page
function updateHabitDOM(habitId) {
    $(`#${habitId} .habit-description`).text =
        habits[habitId].description;
    // TODO: update interval for this habit
    $(`#${habitId} .habit-interval`).text = habits[habitId].interval;

    $(`#${habitId} .habit-title`).text = habits[habitId].title;

    $(`#${habitId}`).addClass(habits[habitId].color);

    // DONT WORRY ABOUT THIS LOL ITS JUST ACTIVE OR NOT ACTIVE
    // TODO: clearInterval when inactive
    let toggleElem = $(`#${habitId} .habit-toggle`);
    if (toggleElem.classList[-1] != habits[habitId].active) {
        toggleElem.classList.replace(
            toggleElem.classList[-1] ? "active" : "inactive",
            habits[habitId].active ? "active" : "inactive"
        );
    }
}

function updateHabitData(habitId, title_, interval_, active_, description_, color_ = "#eee") {
    habits[habitId] = {
        title: title_,
        interval: interval_,
        active: active_,
        description: description_,
        color: color_
    };
    // save our data
    storeData();
}


function deleteHabit(habitId) {
    // delete element habits array
    habits.pop(habitId);
    storeData();

    // Delete from the DOM
    $(`#${habitId}`).remove();

    // clear interval
    clearInterval(intervalID[habitId]);
    intervalID.pop(habitId);
}

function createHabit(habitId) {
    // will do all the ugly html stuff
    // get all data from habits array
    // put that into the html

    habitHTML = `<div class="habit ${habits[habitId].color}" id="${habitId}">
        <div class="habit-main">
          <div class="habit-title">${habits[habitId].title}</div>
          <div class="habit-actions">
            <div class="habit-toggle">
              <label class="align"><input type="checkbox" class="toggle" checked></label>
            </div>
            <div class="habit-edit"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960"
                width="24px" fill="#999">
                <path
                  d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z" />
              </svg></div>
            <div class="habit-delete" onclick="deleteInterface(this.parentElement.parentElement.parentElement.id)"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960"
                width="24px" fill="#999">
                <path
                  d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />
              </svg></div>
          </div>
        </div>
        <div class="habit-content">
          <div class="habit-interval"><strong>Interval: </strong>${habits[habitId].interval}</div>
          <br />    
          <div class="habit-description"><strong>Description: </strong>${habits[habitId].description}</div>
        </div>
      </div>`

    $("#habits-container").append(habitHTML);
    intervalID[habitId] = setInterval((hid) => { notify(hid) }, habits[habitId].interval, habitId); // value is interval id 
}


function deleteInterface(habitId) {
    show("#confirm-modal", `Are you sure you want to delete the ${habits[habitId].title} habit?`);

    $("#confirm-modal #cancel").click(() => {
        $("#screen-mask").hide();
        $("#confirm-modal").hide();
    });
    $("#confirm-modal #ok").click(() => {
        $("#screen-mask").hide();
        $("#confirm-modal").hide();
        deleteHabit(habitId);
    });
}

function onHabitCreate(title, interval, description) {
    let habitId;
    let keys = Object.keys(habits);
    if (keys.length === 0) {
        habitId = "h1";
    }
    else {
        // First find habitId, basically adding 1 to the last habitId
        habitId = "h" + (parseInt(keys[keys.length - 1].slice(-1)) + 1).toString();
    }
    // populates the array with the habit data
    updateHabitData(habitId, title, interval, true, description);

    createHabit(habitId);
}


if (Notification.permission === 'granted') {
    $("#enable").remove();
}

function askPermission() {
    // Check if the browser supports notifications
    if (!("Notification" in window)) {
        alert("This browser does not support notifications.");
        return;
    }
    Notification.requestPermission().then((permission) => {
        $("#enable").remove();
    });
}


function notify(habitId) {
    console.log(Notification.permission)
    // do something by calling intervalID[habitId]
    if (Notification.permission === "granted") {
        let notification = new Notification(habits[habitId].title, { body: habits[habitId].description });
    }
}

// iterate over all habits
for (const [key, value] of Object.entries(habits)) {
    createHabit(key); // key is habit id 
}


Object.prototype.pop = function() {
    for (var key in this) {
        if (!Object.hasOwnProperty.call(this, key)) continue;
        var result = this[key];
        if (!delete this[key]) throw new Error();
        return result;
    }
};


function aboutWindow() {
    show("#popup-modal", `
        <div style="padding: 20px; font-weight: 400;">
            <h2 style="color: #333; font-size: 24px; margin-bottom: 10px;">About This App</h2>
            <p style="font-size: 16px; color: #555; line-height: 1.5;">
                 
            </p>
            <p style="font-size: 16px; color: #555; line-height: 1.5;">
                <strong>Version:</strong> 1.0.0 <br>
                <strong>Developers:</strong> Sean Choi, Laszlo Zolyomi
            </p>
        </div>
    `);

    // Close the modal when the button is clicked
    $("#popup-modal button").click(() => {
        $("#screen-mask").hide();
        $("#popup-modal").hide();
    });
}


let theme = localStorage.getItem("theme");
if (theme === null) {
    theme = 'theme-light';
}

$('#theme').addClass(theme)

if (theme === 'theme-dark') {
    $('head').append('<style>html {transition: filter .2s; filter: invert(0.9) hue-rotate(180deg);</style>');
}

function darkModeChange(classList) {
    if (classList.contains("theme-light")) {
        classList.replace("theme-light", "theme-dark");
        $('head').append('<style>html {transition: filter .2s; filter: invert(0.9) hue-rotate(180deg);</style>');
        localStorage.setItem('theme', 'theme-dark');
    }
    else {
        classList.replace("theme-dark", "theme-light");
        $('head').append('<style>html {transition: filter .2s; filter: invert(0) hue-rotate(0deg);</style>');
        localStorage.setItem('theme', 'theme-light');
    }
}
