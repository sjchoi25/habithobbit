function show(name, text) {
    // Show the mask
    $("#screen-mask").show();

    // Show the popup/alert
    $(name).show();

    // Change the text
    $(`${name} p`).html(text);
}

function popup(text) {
    show("#popup-modal", text);

    // Close the modal when the button is clicked
    $("#popup-modal button").click(() => {
        $("#screen-mask").hide()
        $("#popup-modal").hide()
    });
}

function conf(text) {
    show("#confirm-modal", text);

    $("#confirm-modal #cancel").click(() => {
        $("#screen-mask").hide();
        $("#confirm-modal").hide()
    });
    $("#confirm-modal #ok").click(() => {
        $("#screen-mask").hide();
        $("#confirm-modal").hide()
    });
}