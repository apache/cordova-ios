/**
 * This class exposes mobile phone interface controls to JavaScript, such as
 * native alerts, tab and tool bars, etc.
 * @constructor
 */
function UIControls() {
}

PhoneGap.addConstructor(function() {
    window.uicontrols = new UIControls();
});
