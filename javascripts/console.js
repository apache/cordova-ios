/**
 * This class provides access to the debugging console.
 * @constructor
 */
function Console() {
}

/**
 * Utility function for rendering and indenting strings, or serializing
 * objects to a string capable of being printed to the console.
 * @param {Object|String} message The string or object to convert to an indented string
 * @private
 */
Console.prototype.processMessage = function(message) {
    if (typeof(message) != 'object') {
        return encodeURIComponent(message);
    } else {
        /**
         * @function
         * @ignore
         */
        function indent(str) {
            return str.replace(/^/mg, "    ");
        }
        /**
         * @function
         * @ignore
         */
        function makeStructured(obj) {
            var str = "";
            for (var i in obj) {
                try {
                    if (typeof(obj[i]) == 'object') {
                        str += i + ":\n" + indent(makeStructured(obj[i])) + "\n";
                    } else {
                        str += i + " = " + indent(String(obj[i])).replace(/^    /, "") + "\n";
                    }
                } catch(e) {
                    str += i + " = EXCEPTION: " + e.message + "\n";
                }
            }
            return str;
        }
        return encodeURIComponent("Object:\n" + makeStructured(message));
    }
};

/**
 * Open a native alert dialog, with a customizable title and button text.
 * @param {String} message Message to print in the body of the alert
 * @param {String} [title="Alert"] Title of the alert dialog (default: Alert)
 * @param {String} [buttonLabel="OK"] Label of the close button (default: OK)
 */
Console.prototype.alert = function(message, title, buttonLabel) {
    // Default is to use a browser alert; this will use "index.html" as the title though
    alert(message);
};

/**
 * Print a normal log message to the console
 * @param {Object|String} message Message or object to print to the console
 */
Console.prototype.log = function(message) {
};

/**
 * Print an error message to the console
 * @param {Object|String} message Message or object to print to the console
 */
Console.prototype.error = function(message) {
};

/**
 * Start spinning the activity indicator on the statusbar
 */
Console.prototype.activityStart = function() {
};

/**
 * Stop spinning the activity indicator on the statusbar, if it's currently spinning
 */
Console.prototype.activityStop = function() {
};

PhoneGap.addConstructor(function() {
    window.debug = new Console();
});
