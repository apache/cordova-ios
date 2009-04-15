/**
 * This class exposes mobile phone interface controls to JavaScript, such as
 * native alerts, tab and tool bars, etc.
 * @constructor
 */
function UIControls() {
}

/**
 * Open a native alert dialog, with a customizable title and button text.
 * @param {String} message Message to print in the body of the alert
 * @param {String} [title="Alert"] Title of the alert dialog (default: Alert)
 * @param {String} [buttonLabel="OK"] Label of the close button (default: OK)
 */
UIControls.prototype.alert = function(message, title, buttonLabel) {
    // Default is to use a browser alert; this will use "index.html" as the title though
    alert(message);
};

/**
 * Start spinning the activity indicator on the statusbar
 */
UIControls.prototype.activityStart = function() {
};

/**
 * Stop spinning the activity indicator on the statusbar, if it's currently spinning
 */
UIControls.prototype.activityStop = function() {
};

PhoneGap.addConstructor(function() {
    window.uicontrols = new UIControls();
});
