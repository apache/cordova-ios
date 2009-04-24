/**
 * This class exposes mobile phone interface controls to JavaScript, such as
 * native tab and tool bars, etc.
 * @constructor
 */
function UIControls() {
    this.tabBarTag = 0;
    this.tabBarCallbacks = {};
}

/**
 * Create a native tab bar that can have tab buttons added to it which can respond to events.
 */
UIControls.prototype.createTabBar = function() {};

/**
 * Show a tab bar.  The tab bar has to be created first.
 * @param {Object} [options] Options indicating how the tab bar should be shown:
 * - \c height integer indicating the height of the tab bar (default: \c 49)
 * - \c position specifies whether the tab bar will be placed at the \c top or \c bottom of the screen (default: \c bottom)
 */
UIControls.prototype.showTabBar = function(options) {};

/**
 * Hide a tab bar.  The tab bar has to be created first.
 */
UIControls.prototype.hideTabBar = function(animate) {};

/**
 * Create a new tab bar item for use on a previously created tab bar.  Use ::showTabBarItems to show the new item on the tab bar.
 *
 * If the supplied image name is one of the labels listed below, then this method will construct a tab button
 * using the standard system buttons.  Note that if you use one of the system images, that the \c title you supply will be ignored.
 *
 * <b>Tab Buttons</b>
 *   - tabButton:More
 *   - tabButton:Favorites
 *   - tabButton:Featured
 *   - tabButton:TopRated
 *   - tabButton:Recents
 *   - tabButton:Contacts
 *   - tabButton:History
 *   - tabButton:Bookmarks
 *   - tabButton:Search
 *   - tabButton:Downloads
 *   - tabButton:MostRecent
 *   - tabButton:MostViewed
 * @param {String} name internal name to refer to this tab by
 * @param {String} [title] title text to show on the tab, or null if no text should be shown
 * @param {String} [image] image filename or internal identifier to show, or null if now image should be shown
 * @param {Object} [options] Options for customizing the individual tab item
 *  - \c badge value to display in the optional circular badge on the item; if null or unspecified, the badge will be hidden
 */
UIControls.prototype.createTabBarItem = function(name, label, image, options) {};

/**
 * Update an existing tab bar item to change its badge value.
 * @param {String} name internal name used to represent this item when it was created
 * @param {Object} options Options for customizing the individual tab item
 *  - \c badge value to display in the optional circular badge on the item; if null or unspecified, the badge will be hidden
 */
UIControls.prototype.updateTabBarItem = function(name, options) {};

/**
 * Show previously created items on the tab bar
 * @param {String} arguments... the item names to be shown
 * @param {Object} [options] dictionary of options, notable options including:
 *  - \c animate indicates that the items should animate onto the tab bar
 * @see createTabBarItem
 * @see createTabBar
 */
UIControls.prototype.showTabBarItems = function(tabs, options) {};

/**
 * Manually select an individual tab bar item, or nil for deselecting a currently selected tab bar item.
 * @param {String} tabName the name of the tab to select, or null if all tabs should be deselected
 * @see createTabBarItem
 * @see showTabBarItems
 */
UIControls.prototype.selectTabBarItem = function(tab) {};

/**
 * Function called when a tab bar item has been selected.
 * @param {Number} tag the tag number for the item that has been selected
 */
UIControls.prototype.tabBarItemSelected = function(tag) {
    if (typeof(this.tabBarCallbacks[tag]) == 'function')
        this.tabBarCallbacks[tag]();
};

/**
 * Create a toolbar.
 */
UIControls.prototype.createToolBar = function() {};

/**
 * Function called when a tab bar item has been selected.
 * @param {String} title the title to set within the toolbar
 */
UIControls.prototype.setToolBarTitle = function(title) {};

PhoneGap.addConstructor(function() {
    window.uicontrols = new UIControls();
});
