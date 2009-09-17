/**
 * widget object constructor
 * @param {void}
 *     widget()
 * @return {void}
 */ 

if (typeof window.widget == "undefined" || !window.widget) {
	window.widget = {
		author : 'Nokia WRT Emulation Library',
		//	widget identifier, dummy value
		identifier: 14021981,
		isrotationsupported: true,
		
		//	widget event triggers
		onshow: null,
		onhide: null,
		
		sysInfo: [],
		onload: null,
		opacity: 50,
		interval: 20,
		isFront: false,
		preferenceArray: [],
		preferenceKey: 0
	};
	
	
	/**
	 * Launches the browser with the specified url
	 * @param {String} url
	 *     openURL()
	 * @return {Void}
	 */
	widget.openURL = function(url){
		if (url) {
			window.open(url, "New Widget Window", 'height=200 width=250');
		}
	}
	
	
	/**
	 * Returns previously stored preference associated with the specified key
	 * @param {String} Key preference value to be fetch
	 *     preferenceForKey()
	 * @return {String} Value
	 */
	widget.preferenceForKey = function(key){

		var name = key; //"Nokia_WRT#" + this.path + "#" + key;

		var result = _BRIDGE_REF.helper.readCookie(name);
		return result;
	}
	
	
	/**
	 * Stores the key associated with the specified preference
	 * @param {String} Preference value to be stored
	 * @param {String} Key Preference value associated to
	 *     setPreferenceForKey()
	 * @return {Void}
	 */
	widget.setPreferenceForKey = function(preference, key){
		var value;
		//Specifying null for the preference parameter removes the specified key from the preferences
		if (key == null) {
			if (this.preferenceKey > 0) {
				this.preferenceKey--;
			}
			//delete from cookies
		}
		value = key;//"Nokia_WRT#" + this.path + "#" + key;
		this.preferenceArray[this.preferenceKey] = value;
		
		_BRIDGE_REF.helper.createCookie(value, preference, 240000);
		this.preferenceKey++;
		
		//save cookie for cookies
		_BRIDGE_REF.helper.updateMainCookie(document);
	}
	
	
	
	/**
	 * Toggle between Tabbed navigation mode or Cursor mode
	 * @param {Boolean} Value
	 *     setNavigationEnabled()
	 * @return {Void}
	 */
	widget.setNavigationEnabled = function(bool){
		//This function can not be used on preview browser
	}
	
	
	
	/**
	 * Open S0-Application identified by UID along with the specified params
	 * @param {Integer} Uid hexadecimal value to a specified application
	 * @param {String} Value
	 *     openApplication()
	 * @return {Void}
	 */
	widget.openApplication = function(Uid, param){
		alert("openApplication function won't be simulated in this application");
	}
	
	
	
	/**
	 * Prepares the Widget.to do transition to specified transitionState
	 * @param {String} Value Transition state
	 *     prepareForTransition()
	 * @return {Void}
	 */
	widget.prepareForTransition = function(transitionState){
		this.isFront = ("" + transitionState).toLowerCase() != "toback";
		window.document.getElementsByTagName("body")[0].style.opacity = "0.3";
	}
	
	
	
	
	/**
	 * Does the animation to make the transition between the specified transitionState
	 * @param {Void}
	 *     performTransition()
	 * @return {Void}
	 */
	widget.performTransition = function(){
		var _self = this;
		this.opacity = 0;
		this.interval = window.setInterval(function(){
			_self.opacity += 0.2;
			if (_self.opacity > 1) {
				_self.opacity = 1;
			}
			window.document.getElementsByTagName("body")[0].style.opacity = _self.opacity + "";
			if (_self.opacity >= 1) {
				window.clearInterval(_self.interval);
				window.document.getElementsByTagName("body")[0].style.opacity = "1";
			}
			//do nothing
		}, 50);
		//do nothing
	}
	
	
	
	
	
	/**
	 * Set the preferred screen orientation to landscape.
	 * The display will flip if the phone display orientation
	 * is portrait and the phone supports landscape mode.
	 * @param {Void}
	 *     setDisplayLandscape()
	 * @return {Void}
	 */
	widget.setDisplayLandscape = function(){
		try {
			if (this.isrotationsupported && _BRIDGE_REF.nokia.emulator.orientationSupports()) {
				_BRIDGE_REF.nokia.emulator.setMode('landscape');
			}
		} 
		catch (e) {
		}
	}
	
	
	
	
	/**
	 * Set the preferred screen orientation to portrait.
	 * The display will flip if the phone display orientation
	 * is landscape and the phone supports portrait mode.
	 * @param {Void}
	 *     setDisplayPortrait()
	 * @return {Void}
	 */
	widget.setDisplayPortrait = function(){
		try {
			if (this.isrotationsupported && _BRIDGE_REF.nokia.emulator.orientationSupports()) {
				_BRIDGE_REF.nokia.emulator.setMode('portrait');
			}
		} 
		catch (e) {
		}
	}
	
	/**
	 * Allows the definition of a function to be called
	 * when a Widget.is displayed
	 * @param {Void}
	 *     onshow()
	 * @return {Void}
	 */
	widget.onshow = function(){
		// to be implemented
	}
	
	
	
	
	/**
	 * Allows the definition of a function to be called
	 * when a Widget.sent into the background (hidden)
	 * @param {Void}
	 *     onhide()
	 * @return {Void}
	 */
	widget.onhide = function(){
		// to be implemented
	}
	
	
	
	/**
	 * This function returns the System API if sysinfo is included in document embed
	 */
	widget.enableSystemApi = function(){
	
		//	Identify, and Attach System-Info-Object properties
		try {
			var parentIframeRef = window.parent.frames[0];
			if (typeof parentIframeRef == 'object') {
				if (parentIframeRef.document.embeds.length > 0) {
					for (var i = 0; i < parentIframeRef.document.embeds.length; i++) {
						//match the system Info API embed tag
						if (parentIframeRef.document.embeds[i].type == 'application/x-systeminfo-widget') {
							new systemAPI(parentIframeRef.document.embeds[i]);
//							widget.sysInfo = parentIframeRef.document.embeds[i];
							
							// hide the <embed> object
							parentIframeRef.document.embeds[i].style.display='none';
							
							// push the reference object into widget
							widget.sysInfo.push(parentIframeRef.document.embeds[i]);
						}
					}
				}
			}
		} 
		catch (e) {
			alert('Error in attachSysInfo: ' + e);
		}
	}
	
	/**
	 * 
	 */
	
	widget.triggerListener = function(provider, eventType, data){
		if(widget.sysInfo.length){
			for(var i=0; i<widget.sysInfo.length; i++){
				if(provider == "power"){
					switch(eventType){
						case "chargerconnected" : 
												  widget.sysInfo[i].chargerconnected = data;
												  if(typeof widget.sysInfo[i].onchargerconnected != 'undefined'){
												  	// widget.sysInfo[i].onchargerconnected();
													setTimeout(widget.sysInfo[i].onchargerconnected, 0);
												  }
												  break;

						case "chargelevel" 		:
												  widget.sysInfo[i].chargelevel = data;
												  if(typeof widget.sysInfo[i].onchargelevel != 'undefined'){
												  	// widget.sysInfo[i].onchargelevel();
													setTimeout(widget.sysInfo[i].onchargelevel, 0);
												  }
												 break;
					}
				}
			}
		}
	}
	
	//	make TRUE widget.js script loaded
	window.parent.NOKIA.scriptsLoaded.widget = true;
}

(function(){

	//	attach the System-Info api specific functionality
	_BRIDGE_REF.helper.addEvent(window, 'load', function(){
		widget.enableSystemApi();
		
	});

	if (_BRIDGE_REF.nokia) {
		_BRIDGE_REF.nokia.menu.lsk_event = function(){
			_BRIDGE_REF.nokia.emulator.child.menu.show();
		};
		
		//	Add THIS window Reference on FRAME WINDOW
		//	NOKIA.emulator.child object reference
		_BRIDGE_REF.nokia.emulator.child = window;
		_BRIDGE_REF.nokia.menu.init();
	}	
})()
