UIControls.prototype.createTabBar = function() {
    PhoneGap.exec("UIControls.createTabBar");
};

UIControls.prototype.showTabBar = function(options) {
    PhoneGap.exec("UIControls.showTabBar", options);
};

UIControls.prototype.hideTabBar = function(animate) {
    PhoneGap.exec("UIControls.hideTabBar", { animate: animate });
};

UIControls.prototype.createTabBarItem = function(name, label, image, options) {
    var tag = this.tabBarTag++;
    if (typeof(options['onSelect']) == 'function')
        this.tabBarCallbacks[tag] = options.onSelect;
    PhoneGap.exec("UIControls.createTabBarItem", name, label, image, tag, options);
};

UIControls.prototype.updateTabBarItem = function(name, options) {
    PhoneGap.exec("UIControls.updateTabBarItem", name, options);
};

UIControls.prototype.showTabBarItems = function() {
    var parameters = [ "UIControls.showTabBarItems" ];
    for (var i = 0; i < arguments.length; i++) {
        parameters.push(arguments[i]);
    }
    PhoneGap.exec.apply(this, parameters);
};

UIControls.prototype.createToolBar = function() {
    PhoneGap.exec("UIControls.createToolBar");
};

UIControls.prototype.setToolBarTitle = function(title) {
    PhoneGap.exec("UIControls.setToolBarTitle", title);
};
