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

function toMins(habitId) {
    return Math.round(habits[habitId].interval / 600) / 100
}

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
    $(`#${habitId} .habit-description`).html(`<strong>Description: </strong>${habits[habitId].description}`);
    $(`#${habitId} .habit-interval`).html(`<strong>Interval: </strong>${toMins(habitId)} minutes`);

    $(`#${habitId} .habit-title`).text(habits[habitId].title);

    $(`#${habitId} .habit-main`).removeClass().addClass("habit-main").addClass(habits[habitId].color);

    // Clear original interval
    clearInterval(intervalID[habitId]);
    delete intervalID[habitId];

    if (habits[habitId].active) {
        // set interval
        intervalID[habitId] = setInterval((hid) => { notify(hid) }, habits[habitId].interval, habitId);
    }
}

function updateHabitData(habitId, title_, interval_, active_, description_, color_ = "default") {
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
    delete habits[habitId];
    storeData();

    // Delete from the DOM
    $(`#${habitId}`).remove();

    // clear interval
    clearInterval(intervalID[habitId]);
    delete intervalID[habitId];

    if (Object.keys(habits).length === 0) {
        $("#no-habits").css("display", "block");
    }
}

function createHabit(habitId) {
    // will do all the ugly html stuff
    // get all data from habits array
    // put that into the html

    habitHTML = `<div class="habit" id="${habitId}">
        <div class="habit-main ${habits[habitId].color}">
          <div class="habit-title">${habits[habitId].title}</div>
          <div class="habit-actions">
            <div class="habit-toggle">
              <label class="align"><input type="checkbox" class="toggle" ${habits[habitId].active ? "checked" : ""}></label>
            </div>
            <div class="habit-edit" onclick="editHabit(this.parentElement.parentElement.parentElement.id)"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960"
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
          <div class="habit-interval"><strong>Interval: </strong>${toMins(habitId)} minutes</div>
          <br />    
          <div class="habit-description"><strong>Description: </strong>${habits[habitId].description}</div>
        </div>
      </div>`

    $("#habits-container").append(habitHTML);

    $(`#${habitId} .toggle`).on("change", () => { toggleHabit(habitId) });

    if (habits[habitId].active) {
        intervalID[habitId] = setInterval((hid) => { notify(hid) }, habits[habitId].interval, habitId); // value is interval id 
    }


    $("#no-habits").css("display", "none");
}


function deleteInterface(habitId) {
    show("#confirm-modal", `Are you sure you want to delete the <b>${habits[habitId].title}</b> habit?`);

    $("#confirm-modal #cancel").click(() => {
        $("#screen-mask").hide();
        $("#confirm-modal").hide();
        $('#confirm-modal #ok').off('click');
    });
    $("#confirm-modal #ok").click(() => {
        $("#screen-mask").hide();
        $("#confirm-modal").hide();
        deleteHabit(habitId);

        $('#confirm-modal #ok').off('click');
    });
}

function onHabitCreate(title, interval, description, color) {
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
    updateHabitData(habitId, title, interval, true, description, color);

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
    window.postMessage({ type: "FROM_PAGE", text: `${habits[habitId].title}-HABIT` }, "*");
}

if (Object.keys(habits).length != 0) {
    $("#no-habits").css("display", "none");
}

// iterate over all habits
for (const [key, value] of Object.entries(habits)) {
    createHabit(key); // key is habit id 
}


function aboutWindow() {
    show("#popup-modal", `
        <div style="padding: 20px; font-weight: 400;">
            <img src="assets/logo.png" style="border-radius: 50%; height: 70px;" alt="logo">
            <h2 style="font-size: 28px; margin-bottom: 10px;">About Habit Hobbit</h2>
            <p style="font-size: 16px; line-height: 1.5;">
                Welcome to <strong>Habit Hobbit</strong>, your companion in building better habits!
            </p>
            <h3 style="font-size: 20px; margin-top: 20px;">Getting Started:</h3>
            <ul style="font-size: 16px; line-height: 1.5; margin-left: 20px;">
                <li>Click the <strong>"New Habit"</strong> button at the top right to add a new habit.</li>
                <li>Set your preferred notification frequency for each habit.</li>
            </ul>
            <h3 style="font-size: 20px; margin-top: 20px;">Managing Your Habits:</h3>
            <ul style="font-size: 16px; line-height: 1.5; margin-left: 20px;">
                <li><strong>Pause</strong> a habit: Click the slider.</li>
                <li><strong>Edit</strong> a habit: Click the pencil icon.</li>
                <li><strong>Delete</strong> a habit: Click the trash can icon.</li>
            </ul>
            <p style="font-size: 16px; color: #555; line-height: 1.5; margin-top: 20px;">
                <strong>Version:</strong> 1.0.0<br>
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

// THEME WHEN PAGE LOADS
let theme = localStorage.getItem("theme");
if (theme === null) {
    theme = 'theme-light';
}

$('#theme').addClass(theme)

if (theme === 'theme-dark') {
    $('head').append('<style>html {transition: filter .2s; filter: invert(0.9) hue-rotate(180deg);} img {filter: invert(1.1) hue-rotate(180deg);}</style>');
}

function darkModeChange(classList) {
    if (classList.contains("theme-light")) {
        classList.replace("theme-light", "theme-dark");
        $('head').append('<style>html {transition: filter .2s; filter: invert(0.9) hue-rotate(180deg);} img {filter: invert(1.1) hue-rotate(180deg);}</style>');
        localStorage.setItem('theme', 'theme-dark');
    }
    else {
        classList.replace("theme-dark", "theme-light");
        $('head').append('<style>html {transition: filter .2s; filter: invert(0) hue-rotate(0deg);} img {filter: invert(0) hue-rotate(0deg);}</style>');
        localStorage.setItem('theme', 'theme-light');
    }
}


function newHabitText(text) {
    return `
    <div id="create-habit-id">
        <h2> ${text} </h2> 

        <div id="create-error" style="padding: 15px;border-radius: 4px;  color: #842029;background-color: #f8d7da;border: 1px solid #f5c2c7;margin-bottom:15px;display:none;">Please fill out all fields correctly.</div>

        <label for="enter-title">Habit Title:</label>

        <input type="text" id="enter-title" name="enter-title" required minlength="1" required maxlength="30" />
        <br /><br />
        <label for="enter-interval">Time interval (in minutes):</label>

        <input type="number" id="enter-interval" name="enter-interval" required minlength="1"/>

        <br /><br />

        <label for="enter-description">Description:</label>

        <input type="text" id="enter-description" name="enter-description" required minlength="1" />
        <br /><br />
        <label for="enter-color">Color:</label>

        <select name="enter-color" id="enter-color">
            <option value="default" selected="selected">Default</option>    
            <option value="red">Red</option>
            <option value="orange">Orange</option>
            <option value="yellow">Yellow</option>
            <option value="green">Green</option>
            <option value="blue">Blue</option>
            <option value="purple">Purple</option>
            <option value="pink">Pink</option>
        </select>
    </div>    
    `
}

function newHabit() {
    show("#confirm-modal", newHabitText("Create a new habit"));

    $("#confirm-modal #cancel").off('click').click(() => {
        $("#screen-mask").hide();
        $("#confirm-modal").hide();
        $('#confirm-modal #ok').off('click');
    });
    $("#confirm-modal #ok").off('click').click(() => {

        let titleE = $('#enter-title').val();
        const interval = $('#enter-interval').val() * 60000;
        let description = $('#enter-description').val();
        const color = $('#enter-color').val()

        if (titleE.trim() === "" || !(/^\d+$/.test(interval) && parseInt(interval) > 0) || description.trim() === "") {
            $("#create-error").show();
        }
        else {
            $("#screen-mask").hide();
            $("#confirm-modal").hide();
            onHabitCreate(
                titleE,
                interval,
                description,
                color
            );
            $('#confirm-modal #ok').off('click');
        }
    });
}


function editHabit(habitId) {
    show("#confirm-modal", newHabitText("Edit your habit"));

    $("#enter-title").attr("value", habits[habitId].title);
    $("#enter-interval").attr("value", toMins(habitId));
    $("#enter-description").attr("value", habits[habitId].description);
    $("#enter-color").val(habits[habitId].color);

    $("#confirm-modal #cancel").off('click').click(() => {
        $("#screen-mask").hide();
        $("#confirm-modal").hide();
        $('#confirm-modal #ok').off('click');
    });
    $("#confirm-modal #ok").off('click').click(() => {

        let titleE = $('#enter-title').val();
        const interval = $('#enter-interval').val() * 60000;
        let description = $('#enter-description').val();
        const color = $('#enter-color').val()

        if (titleE.trim() === "" || !(/^\d+$/.test(interval) && parseInt(interval) > 0) || description.trim() === "") {
            $("#create-error").show();
        }
        else {
            $("#screen-mask").hide();
            $("#confirm-modal").hide();

            // Update data
            updateHabitData(
                habitId,
                titleE,
                interval,
                habits[habitId].active,
                description,
                color);

            // Update DOM
            updateHabitDOM(habitId);
            $('#confirm-modal #ok').off('click');
        }
    });
}

function toggleHabit(habitId) {
    if (habits[habitId].active) {
        habits[habitId].active = false;
        clearInterval(intervalID[habitId]);
        delete intervalID[habitId];
    }
    else {
        habits[habitId].active = true;
        intervalID[habitId] = setInterval((hid) => { notify(hid) }, habits[habitId].interval, habitId); // value is interval id 
    }

    storeData();

}
