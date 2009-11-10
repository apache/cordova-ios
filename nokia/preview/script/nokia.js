/*
	@chinnapp
*/

if(typeof NOKIA == "undefined" || !NOKIA) 
{
	var NOKIA = {
		version : 'WRT 1.1',
		currentDevice : '240x320',
		mode : 'portrait',
		resolution : ['240x320', '320x240', '360x640', '800x352'],
		scriptsLoaded : {
			loader : false,
			widget : false,
			systeminfo : false,
			menu   : false,
			menuItem : false,
			console : false
		}
	};
	NOKIA.namespace = function(name)
	{
		var parts = name.split('.');
		var current = NOKIA;
		for(var key in parts){
			if(!current[parts[key]]){
				current[parts[key]] = {};
			}
			current = current[parts[key]];
		}  
	};
	
	NOKIA.init = function()
	{
		// Not-Supported Browser check
		NOKIA.emulator.is_browserReady = (/MSIE/i.test(navigator.userAgent));
		if(NOKIA.emulator.is_browserReady)
		{
			var notSupportedBrowser = NOKIA.helper.readCookie('NOKIA_NOT_SUPPORTED_BROWSER');
			if (notSupportedBrowser != 1) {
				$("#NotificationDiv")[0].className = 'show';
				$("#NotificationDiv").dialog({
					width: 550,
					minWidth: 550,
					minHeight: 350,
					height: 150,
					autoOpen: true,
					position: top,
					title: 'Notification window',
					buttons: {
						Cancel: function(){
							$("#NotificationDiv").dialog('close');
						},
						Continue: function(){
							$("#NotificationDiv").dialog('close');
							NOKIA.helper.createCookie('NOKIA_NOT_SUPPORTED_BROWSER', 1);
							NOKIA.init();
						}
					}
				});
				return false;
			}else{
				$("#BrowserNotificationBar").css({display:'block'});
				$("#BrowserNotificationBar > p > a").click(function(){ $("#BrowserNotificationBar").hide(); });
			}
		}
	
		$('iframe')[0].src = "wrt_preview_main.html";

		NOKIA.data.load(deviceResolutionList);
		
		var url = window.location.toString();			
		url = url.split('/');
		
		var pointer = 3;
		if(url[0] == 'http:')
			pointer = 2;

		var t = ''; 
		for(var i=pointer; i<url.length-1; i++){ 	t = t + url[i] + '/'; 	}
		if(url[0] == 'file:')
			NOKIA.emulator.url = 'file:///' + t;
		else
			NOKIA.emulator.url = 'http://' + t;

		//	Common Error/Notification Dialog
		NOKIA.helper.errorDailog = $("#Dialog").dialog({
			bgiframe: true, minHeight: 150, width: 450, modal: true, autoOpen: false,
			buttons: {	
					Cancel: function(){ $(this).dialog('close');	},			
					Reload: function(){ 
						$(this).dialog('close');
						$("#loaderDiv").html("Widget is reloading. Please wait...");
						$("#loaderDiv")[0].className = 'green';
						$("#loaderDiv").show();
						window.setTimeout(function(){
							document.location = document.location;
						}, 3000);
					}			
				}
		});

		//	validating Info.plist
		this.helper.getInfo('Info.plist', NOKIA.helper.getInfoCallback);	

		//	For getting Icon.png
		this.helper.getInfo('Icon.png', NOKIA.helper.getIconCallback);	
	};

	/*
	 * NOKIA.data
	 */
	NOKIA.namespace('data.load');

	NOKIA.data.load = function(data){
		NOKIA.deviceList = data;
	}



	/*
	 * NOKIA.emulator
	 */
	NOKIA.namespace('menu');
	NOKIA.menu = {
		is_menu_visible : false,		// true/false
		is_softkeys_visible : false,	// true : only when MenuItem's are displayed
		softkeys_visibility : true,		// true/false : for hide/show SFK's
		is_dimmed : false,
		is_rsk_overridden : false,
		log_counter : 1,
		enable_log : false,
		rsk_label : '',
		rsk_event : false,
		highlighted_item : null,
		
		hide : function()
		{
			$("#MenuItemsArea").fadeIn("slow");

			//	Hide the SFK's If user hidden them from his code
			if(NOKIA.menu.softkeys_visibility)
				$("#SoftKeysArea").fadeIn("slow");
			
			NOKIA.menu.is_softkeys_visible = false;
		},

		log : function(str)
		{
			if(!this.enable_log)
				return false;
			NOKIA.layout.log("log", NOKIA.menu.log_counter + ' ' +str);
			NOKIA.layout.log("log", 'is_rsk_overridden: '+NOKIA.menu.is_rsk_overridden);
			NOKIA.layout.log("log", 'rsk_label: '+NOKIA.menu.rsk_label);
			NOKIA.layout.log("log", 'rsk_event: '+NOKIA.menu.rsk_event);
			
			NOKIA.menu.log_counter++;
		},

		show : function()
		{
			if(NOKIA.menu.is_dimmed)
				return false;
				
			NOKIA.menu.showSoftKeys();
			
			NOKIA.menu.is_menu_visible = true;
			$("#MenuItemsArea").show();
			
			NOKIA.menu.highlighted_item = $("#MenuItemsArea > ul > li")[0];
			NOKIA.menu.highlighted_item.className = 'active';


			$("#MenuItemsArea > ul > li").mouseover(function(){
				if(NOKIA.menu.highlighted_item != null)
				{
					NOKIA.menu.highlighted_item.className = '';
					NOKIA.menu.highlighted_item = null;
				}

				NOKIA.menu.highlighted_item = this;
				NOKIA.menu.highlighted_item.className = 'active';
			});

			$("#SoftKeysArea").mouseout(function(){
				if (!NOKIA.menu.is_menu_visible) {
					return false;
				}
				
				if (NOKIA.helper.intervalId) {
					clearInterval(NOKIA.helper.intervalId);
				}
				NOKIA.helper.intervalId = setTimeout(function(){
					NOKIA.menu.cancel()
				}, 500);
			});


			//	Change the label "Options" to "Select" to LSK
			$("#LskLabel > a")[0].innerHTML = "Select";
			NOKIA.menu.setLsk(NOKIA.menu.selectMenu);
			
			//	Change the label "Exit" to "Cancel" to RSK
			$("#RskLabel > a")[0].innerHTML = 'Cancel';
			NOKIA.menu.setRsk(NOKIA.menu.cancel);
			

			NOKIA.emulator.setMenuItemsStyle();
			
		},
		
		selectMenu : function(){
			try {
				if(typeof NOKIA.menu.highlighted_item.onclick != 'undefined'){
					eval(NOKIA.menu.highlighted_item.onclick)();
				}
			} catch (e) {
				
			}
//			NOKIA.menu.cancel();
		},

		
		cancel : function()
		{
			if(NOKIA.menu.is_dimmed)
				return false;
				
			NOKIA.menu.hideSoftKeys();

			NOKIA.menu.is_menu_visible = false;
			$("#MenuItemsArea").hide();

			//	Reset the "OPTION" label to LSK
			$("#LskLabel > a")[0].innerHTML = 'Options';
			NOKIA.menu.setLsk(NOKIA.emulator.child.menu.show);

			//	Change the label "CANCEL" to "EXIT" to RSK
			if(!NOKIA.menu.is_rsk_overridden)
			{
				$("#RskLabel > a")[0].innerHTML = 'Exit';
				NOKIA.menu.setRsk(NOKIA.menu.exit);	
			}
			else
			{
				$("#RskLabel > a")[0].innerHTML = NOKIA.menu.rsk_label;
				NOKIA.menu.setRsk(NOKIA.menu.rsk_event);	
			}
			
		},

		exit : function()
		{
			if(NOKIA.menu.is_dimmed)
				return false;
				
			if(NOKIA.helper.setHomeScreen())
				return false;

			//	clear the Menu Settings
			NOKIA.menu.cancel();
			NOKIA.emulator.child.menu.setRightSoftkeyLabel('', null);
			NOKIA.emulator.child.menu.items = [];
			NOKIA.menu.softkeys_visibility = false;
			
			// Hide Widget DIV
			NOKIA.menu.hideSoftKeys();
			NOKIA.menu.setLsk(function(){});
			NOKIA.menu.setRsk(function(){});
			
			$("#WidgetArea").hide();

			//	Show Icon
			var style = NOKIA.deviceList[NOKIA.currentDevice][NOKIA.mode]['style'];
			$('#IconArea').css({
				'width' 	:	'100%',
				'height'	:	style['widget']['height']+'px',
				'float' 	:	style['widget']['float']
			});
			
			$('#IconArea')[0].className = NOKIA.mode+NOKIA.currentDevice;
			
			var img = document.createElement('img');
			img.src = NOKIA.emulator.iconFile;
			img.border = 0;
			
			var div = document.createElement('div');
			var p = document.createElement('p');
			
			if(NOKIA.emulator.plist.DisplayName.length <= 12)
				p.innerHTML = NOKIA.emulator.plist.DisplayName; 
			else
				p.innerHTML = NOKIA.emulator.plist.DisplayName.substr(0, 11) + '...' 

			div.className = 'IconFile';
			div.style.marginTop = parseInt(parseInt(style['widget']['height']/2)-80) + 'px';
			div.appendChild(img);
			img.onclick = function(){
				
				//	close the console DIV
				NOKIA.layout._console_enabled = false;
				NOKIA.layout.render();
				
				$("#loaderDiv").html("Widget is loading. Please wait...");
				$("#loaderDiv")[0].className = 'green';
				$("#loaderDiv").show();
				window.setTimeout(function(){
					document.location = document.location;
				}, 3000);
				
			};
			
			div.appendChild(p);

			$("#loaderDiv").html("Click on Icon to Launch Widget");
			$("#loaderDiv").show();
			$("#loaderDiv")[0].className = 'yellow';

			$('#IconArea').append(div);
			$('#IconArea').show();

			NOKIA.menu.is_dimmed = true;
			
			$("#PreferencesBtn").hide();
			$("#PreferencesTab").dialog('close');
			
		},
		
		setLsk : function(func)
		{
			//	for RSK
			$('#LskArea')[0].onclick = function(){
				if(!NOKIA.menu.is_dimmed)
					func();
			};
		
			$('#LskLabel > a')[0].onclick = function(){
				if(!NOKIA.menu.is_dimmed)
					func();
			};

			return true;
		},
		
		setRsk : function(func)
		{
			//	for RSK
			$('#RskArea')[0].onclick = function(){
				if(!NOKIA.menu.is_dimmed)
					func();
			};
			
			$('#RskLabel > a')[0].onclick = function(){
				if(!NOKIA.menu.is_dimmed)
					func();
			};
			
			return true;
		},


		triggerLsk : function(event)
		{
			var callback;
			if(NOKIA.mode == 'portrait')
				callback = NOKIA.menu.lsk_event;
			else if( (NOKIA.mode == 'landscape') && (event.id =='LskLabel') )
				callback = NOKIA.menu.lsk_event;
			else
				callback = NOKIA.menu.rsk_event;
			
			if(typeof callback == 'function' && !NOKIA.menu.is_dimmed)
			{
				callback();
			}
		},

		triggerRsk : function(event)
		{
			var callback;
			if(NOKIA.mode == 'portrait')
				callback = NOKIA.menu.rsk_event;
			else if( (NOKIA.mode == 'landscape') && (event.id =='RskLabel') )
				callback = NOKIA.menu.rsk_event;
			else
				callback = NOKIA.menu.lsk_event;
			
			if(typeof callback == 'function')
			{
				if(!NOKIA.menu.is_dimmed)
				{
					callback();
					NOKIA.menu.cancel();
				}
			}
		},
		
		render : function()
		{
			if(!NOKIA.menu.softkeys_visibility)
				NOKIA.menu.hideSoftKeys();
			else
				NOKIA.menu.showSoftKeys();
			
			NOKIA.emulator.setWidgetStyle();
		},
		

		init : function()
		{
			NOKIA.menu.render();
		},
		
		createSFKArea : function()
		{
			var a = $('#SoftKeys > a');
			a.html('');
			
			var preferences = NOKIA.deviceList[NOKIA.currentDevice][NOKIA.mode];
			
			var lsk = document.createElement('img');
			lsk.border="0";
			lsk.id = "LskArea";
			lsk.name ="LskArea";
			lsk.src = "preview/images/TransperantImage.png";
			lsk.style.width = preferences.style.softkeysImg.width; 
			lsk.style.height = preferences.style.softkeysImg.height;
			
			var rsk = document.createElement('img');
			rsk.border = 0;
			rsk.id = "RskArea";
			rsk.name = "RskArea";
			rsk.src = "preview/images/TransperantImage.png";
			rsk.style.width = preferences.style.softkeysImg.width; 
			rsk.style.height = preferences.style.softkeysImg.height;

			if(NOKIA.mode == 'portrait')
			{	
				lsk.onclick = function(){
					$("#LskLabel > a").trigger('click');
				}
				a[0].appendChild(lsk);

				rsk.onclick = function(){
					$("#RskLabel > a").trigger('click');
				}
				a[1].appendChild(rsk);

			}else{

				rsk.onclick = function(){
					$("#RskLabel > a").trigger('click');
				}
				a[0].appendChild(rsk);

				lsk.onclick = function(){
					$("#LskLabel > a").trigger('click');
				}
				a[1].appendChild(lsk);
			}
			
			
		},

		showSoftKeys : function()
		{
			NOKIA.menu.is_softkeys_visible = true;

			NOKIA.emulator.setWidgetStyle();
			$("#SoftKeysArea").show();
		},
		
		hideSoftKeys : function()
		{
			//	Hide the SFK's If user hidden them from his code
			if(!NOKIA.menu.softkeys_visibility)
				$("#SoftKeysArea").hide();
			
			NOKIA.menu.is_softkeys_visible = false;

			NOKIA.emulator.setWidgetStyle();
		}
	};



	/*
	 * NOKIA.emulator
	 */
	NOKIA.namespace('emulator');
	NOKIA.emulator = {
		child : false,
		iconFile : 'preview/images/default-Icon.png',
		loaded : false,
		plist : {
			DisplayName	:	'',
			Identifier	:	'',
			MainHTML	:	'',
			AllowNetworkAccess	:	"false",
			Version		:	'',
			MiniViewEnabled		:	"false",
			is_browserReady : false
		},
		
		load : function()
		{
			if(this.loaded)
				return false;
				
			//	load the saved device Info
			var device = NOKIA.helper.readCookie('NOKIA_EMULATOR_DEVICE');
			NOKIA.currentDevice = device || NOKIA.currentDevice;


			//	load the saved device mode
			var mode = NOKIA.helper.readCookie('NOKIA_EMULATOR_DEVICE_MODE');
			if(mode != null)
				NOKIA.mode = mode;

			//	SAVE the device DATA
			NOKIA.helper.createCookie('NOKIA_EMULATOR_DEVICE', NOKIA.currentDevice);
			NOKIA.helper.createCookie('NOKIA_EMULATOR_DEVICE_MODE', NOKIA.mode);
			
			this.loaded = true;
			
		},
	
		render : function()
		{
			this.load();
			
			if(!NOKIA.emulator.orientationSupports())
				NOKIA.mode = NOKIA.deviceList[NOKIA.currentDevice]['default'];
			
			if(typeof NOKIA.deviceList == 'undefined' || typeof NOKIA.deviceList[NOKIA.currentDevice] == 'undefined' || typeof NOKIA.deviceList[NOKIA.currentDevice][NOKIA.mode] == 'undefined')
			{
				alert('Deive resolution: '+NOKIA.currentDevice+' or the mode: '+NOKIA.mode+' not found');
				return false;
			}
			
			this.setStyle();
		},
		
		setMode : function(mode)
		{
			NOKIA.mode = mode;

			//	SAVE the device DATA
			NOKIA.helper.createCookie('NOKIA_EMULATOR_DEVICE_MODE', NOKIA.mode);

			NOKIA.emulator.render();
		},
		
		orientationSupports : function()
		{
			return NOKIA.deviceList[NOKIA.currentDevice]['orientation'];
		},
		
		setStyle:function()
		{
			if(!NOKIA.helper.checkDependencies())
			{
				setTimeout(NOKIA.emulator.setStyle, 1000);
			}
			
			var deviceProperties = NOKIA.deviceList[NOKIA.currentDevice][NOKIA.mode];
			var style = deviceProperties['style'];

			//	Apply Style and propertis to Device layers
			$("#DeviceDisplayLayout").css(style['layout']);
			$('#DisplayArea').css(style['display']);
			
			NOKIA.emulator.setWidgetStyle();
			
			$('#SoftKeysArea').css({
				'width'	:	style['menu']['width']+'px',
				'height'	:	style['menu']['height']+'px',
				'float' 	:	style['menu']['float']
			});
			
			$('#SoftKeysArea > ul > li').css('width', parseInt(style['menu']['width']/2)-10);

			
			NOKIA.emulator.setMenuItemsStyle();
			
			$('#SoftKeys').css(style['softkeys']);
//			$('#SoftKeys > a > img').css(style['softkeysImg']);

			NOKIA.menu.createSFKArea();
			
			$("#DeviceDisplayLayout").show();
			$("#PreferencesTab").show();
			
			if(!NOKIA.menu.is_dimmed)
				$("#PreferencesBtn").show();
		},
		
		setWidgetStyle : function()
		{
			var style = NOKIA.deviceList[NOKIA.currentDevice][NOKIA.mode]['style'];
			var height;
			if(NOKIA.menu.softkeys_visibility || NOKIA.menu.is_softkeys_visible)
				height = parseInt(style['widget']['height'] - style['menu']['height']);
			else
				height = style['widget']['height'];

			$('#WidgetArea').css({
				'width' 	:	style['widget']['width']+'px',
				'height'	:	height+'px',
				'float' 	:	style['widget']['float']
			});
		},
		
		setMenuItemsStyle : function()
		{
			var style 	= NOKIA.deviceList[NOKIA.currentDevice][NOKIA.mode]['style'];
			var count = 1;
			try {
				if (NOKIA.emulator.child.menu) {
					count = parseInt(NOKIA.helper.getElementsLengthInObject(NOKIA.emulator.child.menu.items)) + 1;
				}
			} catch (e) {
				count = 1;
			}
			var height 	= parseInt(count*style['menu']['optionKeysheight']) + 10;
			var top 	= parseInt(style['widget']['height'] - height); 

			$('#MenuItemsArea').css({
				'width'		:	style['widget']['width']+'px',
				'height'	:	height+'px',
				'marginTop'	:	'-2px',
				'top'		:	(style['widget']['height']-height-style['menu']['height']+2)+'px',
				'position'	: 	'relative'
			});
		}
	};

	/*
	 * NOKIA.helper functions
	 */
	NOKIA.namespace('helper.loadScript');
	NOKIA.helper = {
		path : document.location.pathname,
		errorDailog	: null,
		prefDailog : null,
		intervalId : null,
		infoPlistCounter : false,
		IconFileCounter  : false,
		loadScript : function(path)
		{
			var head = document.getElementsByTagName("head")[0] || document.documentElement;
			var script = document.createElement("script");
	
			script.type = "text/javascript";
			script.src = src;
			head.appendChild( script );
		},

		loadPreferences : function()
		{
			//	Selecting Resoltion
			var resOptions = $("#resOptions")[0];
			for(var i=0; i<NOKIA.resolution.length; i++)
			{
				if(NOKIA.resolution[i] == NOKIA.currentDevice)
				{
					resOptions.options[i].selected = true;
					$("#resSupportLink")[0].href = resOptions.options[i].value;
					break;
				}				
			}
			
			//	Selecting Orientation
			if(NOKIA.mode == 'portrait')
				$('#input_portrait')[0].checked = true;
			else
				$('#input_landscape')[0].checked = true;

			if (!NOKIA.emulator.orientationSupports()) {
				if (NOKIA.mode == 'portrait') 
					$("#input_landscape")[0].disabled = true;
				else 
					$("#input_portrait")[0].disabled = true;
					
				$("#Orientation_Info").html("Not supported");
				$("#Orientation_Info").show();
				$("#Orientation_Controls").hide();
			}
			else {
				$("#input_landscape")[0].disabled = false;
				$("#input_portrait")[0].disabled = false;

				$("#Orientation_Info").hide();
				$("#Orientation_Controls").show();
			}
			
			//	Selecting Version
			if(NOKIA.version == 'WRT 1.0')
				$('#wrt_version_1_0')[0].checked = true;
			else
				$('#wrt_version_1_1')[0].checked = true;
				
			//	HomeScreen Support
			if(NOKIA.deviceList[NOKIA.currentDevice].homeScreenSupport)
			{
				if (typeof NOKIA.emulator.plist.MiniViewEnabled != 'undefined') {
					if (NOKIA.emulator.plist.MiniViewEnabled == 'false') 
						$('#HS_Control_Info').html("<span id='wrt-help' onclick='javascipt:NOKIA.helper.showMiniviewHelp();'></span><strong>Not Enabled</strong><br/><small>Click on help to read more about enabling Mini view support</small>");
					else 
						$('#HS_Control_Info').html("Supported");
				}
				else
					$('#HS_Control_Info').html("<span id='wrt-help'></span>Not Supported");

				$('#HS_Control_Info').show();

			}
			else
			{
				$('#HS_Control_Info').html("Not Supported for the selected Device resolution");
				$('#HS_Control_Info').show();
			}
		},

		getInfo : function(url, callback)
		{
			try {
				var xhr = this.ajax();
				
				if ((/AppleWebKit/i.test(navigator.userAgent)))
					xhr.open("GET", url, false);
				else
					xhr.open("GET", url, true);
				
				
				xhr.onreadystatechange = function() 
				{
						// readyState = 4 ; "complete"
						if (xhr.readyState==4)
						{
							// status = 200 ; "ok"
							if( (xhr.status == 200) || (!xhr.status) )
							{
								callback(true, xhr);
							}
							else
							{ 
								callback(false, xhr);
							}
						}
	
				}
				xhr.send(null);
			} catch (e) {
				if (e.name == 'NS_ERROR_FILE_NOT_FOUND') {
					callback(false, xhr);
				}			
			}
		},

		getInfoCallback : function(flag, xhr)
		{
			//	If Info.plis NOT FOUND / FAILED LOAD
			//	an ERROR!, unable to proceed further
			// 	STOP there
			if(!flag)
			{
				if(!NOKIA.helper.infoPlistCounter)
				{
					NOKIA.helper.infoPlistCounter = true;
					NOKIA.helper.getInfo('info.plist', NOKIA.helper.getInfoCallback);
					return false;
				}

				NOKIA.helper.error('Unable to intialize the widget, failed to process Info.plist file. <br/>Please ensure <strong style="color:#efe352;">Info.plist</strong> file exists on the widget root folder <br/>or check the filename of <strong style="color:#efe352;">Info.plist</strong> It is case-sensitive');
				return false;
			}
			else{
				
				var xmlString = xhr.responseText;
				
				// do some cheating here
				xmlString = xmlString.replace(/<\s*true\s*\/>/gi, "<string>true</string>");
				xmlString = xmlString.replace(/<\s*false\s*\/>/gi, "<string>false</string>");
	
			/*
			 * 	DomParser Logic
				var appXml = new DOMParser();
				var xmlobject = appXml.parseFromString(xmlString, "text/xml");
			 */
			
				//	return the JSON Object
				NOKIA.helper.validate(xml2json.parser(xmlString));
			}
			
		},
		
		getIconCallback : function(flag, xhr)
		{
			
			if(!flag)
			{
				if(!NOKIA.helper.IconFileCounter)
				{
					NOKIA.helper.IconFileCounter = true;
					NOKIA.helper.getInfo('icon.png', NOKIA.helper.getIconCallback);
					return false;	
				}
			}
			else
				NOKIA.emulator.iconFile =  (NOKIA.helper.IconFileCounter) ? "icon.png" : "Icon.png";
		},
		

		validate : function(xmlObject)
		{
			window.xmlObject = xmlObject;
			
			//	<plist>
			if(typeof xmlObject.plist != 'object' || xmlObject.plist == 'undefined')
			{
				NOKIA.helper.error('Corrupted Info.plist file');
				return false;
			}
			//	<dict>
			xmlObject = xmlObject.plist;
			if(typeof xmlObject.dict != 'object' || xmlObject.dict == 'undefined')
			{
				NOKIA.helper.error('Corrupted Info.plist file');
				return false;
			}

			//	<key>
			xmlObject = xmlObject.dict;
			if(typeof xmlObject.key != 'object' || xmlObject.key == 'undefined')
			{
				NOKIA.helper.error('Corrupted Info.plist file');
				return false;
			}

			//	<string>
			if(typeof xmlObject.string != 'object' || xmlObject.string == 'undefined')
			{
				NOKIA.helper.error('Corrupted Info.plist file');
				return false;
			}

			//	num of <key> = num of <string>
			if(xmlObject.key.length != xmlObject.string.length)
			{
				NOKIA.helper.error('Corrupted Info.plist file');
				return false;
			}

			for(var val in xmlObject.key)
			{
				if(NOKIA.emulator.plist[xmlObject.key[val]] != 'undefined'){
					NOKIA.emulator.plist[xmlObject.key[val]] = xmlObject.string[val].toString(); 
				}
			}

			try {
				if(typeof NOKIA.emulator.plist.DisplayName != 'undefined'){
					document.title = NOKIA.emulator.plist.DisplayName + ' - ' + document.title;
				}
			} catch (e) {}

			//	Add UI-Event listeners
			NOKIA.helper.addListeners();
			NOKIA.layout.init();
			NOKIA.emulator.render();
		},


		ajax : function() 
		{
			//	xmlHttpRequest object	
			var request = null;
		
		    // branch for native XMLHttpRequest object
		    if(window.XMLHttpRequest && !(window.ActiveXObject)) {
		    	try 
				{
					request = new XMLHttpRequest();
					try
					{
						//	attach the Bypass code, if the browser is firefox
						if(netscape.security.PrivilegeManager.enablePrivilege)
						{
							//	duplicate the function
							request._open = request.open;
							
							//	redefine the function definition
							request.open = function(method, url, flag)
							{
								try
								{
									// Enable Universal Browser Read
									netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
		
									//	call the native XmlHttpRequest.open method
									this._open(method, url, flag);
								}catch(e)
								{
									//	call the native XmlHttpRequest.open method
									this._open(method, url, flag);
								}
							}
						}
					}
					catch(e)
					{
						//	eatup all exceptions
					}
				} 
				catch(e) {
					request = null;
		        }
		    // branch for IE/Windows ActiveX version
		    } else if(window.ActiveXObject) {
		       	try {
		        	request = new ActiveXObject("Msxml2.XMLHTTP");
		      	} catch(e) {
		        	try {
		          		request = new ActiveXObject("Microsoft.XMLHTTP");
		        	} catch(e) {
		          		alert('Failed to create XmlHttprequest');
						return null;
		        	}
				}
		    }
			
			return (request);
		},

		error : function(msg)
		{
			if(NOKIA.menu.enable_log)
				NOKIA.layout.log("log", msg);
			
			$("#Dialog").html(msg);
			$("#Dialog").dialog('open');
		},

		createCookie : function(name,value) 
		{
			var days = 240000;
		    if (days) {
				var date = new Date();
				date.setTime(date.getTime()+(days*24*60*60*1000));
				var expires = "; expires="+date.toGMTString();
			}
			else var expires = "";
			var value = "Nokia_WRT#"+NOKIA.helper.path+"#"+name+"="+value;
			document.cookie = value+expires+"; Emulator.path=/"
		},
		
		readCookie : function(name) 
		{
			name = "Nokia_WRT#" + NOKIA.helper.path + "#" + name;		
			var nameEQ = name + "=";
			var ca = document.cookie.split(';');
			for(var i=0;i < ca.length;i++) {
				var c = ca[i];
				while (c.charAt(0)==' ') c = c.substring(1,c.length);
				if (c.indexOf(nameEQ) == 0) {
					return c.substring(nameEQ.length,c.length);
				}
			}
			return undefined;
		},

		toggle : function(ele)
		{
			if (NOKIA.emulator.orientationSupports()) {
//				var mode = (NOKIA.mode == 'portrait') ? 'landscape' : 'portrait';
				NOKIA.emulator.setMode(ele.value);
			}
			else
			{	
				ele.checked = false;
				if(ele.value == 'portrait')
					$("#input_landscape")[0].checked = true;
				else
					$("#input_portrait")[0].checked = true;
			}
		},

		version : function(ele)
		{
			if (confirm('Would you like to reload the widget to apply the changes on the Version settings?')) 
			{
				NOKIA.helper.createCookie('_WRT_VERSION', ele.value);
				$("#loaderDiv").html("Applying the " + ele.value + ", please wait...");
				$("#loaderDiv").show();
				$("#loaderDiv")[0].className = 'green';
				
				$("#PreferencesTab").dialog('close');
				
				window.setTimeout(function(){
					document.location = document.location;
				}, 3000);
			}
			else
			{
				ele.checked = false;
				if(ele.value != 'WRT 1.0')
					$("#wrt_version_1_0")[0].checked = true;
				else
					$("#wrt_version_1_1")[0].checked = true;
			}
		},

		addListeners : function()
		{
			/*
			 * Render Emulator for Interaction
			 */
			NOKIA.helper.prefDailog = $("#PreferencesTab").dialog({
					width: 550,	minWidth: 550, minHeight: 350, height: 350, autoOpen: false, position : top, title : '&nbsp;',
					buttons : {
						Close : function(){
							$("#PreferencesTab").dialog('close');

							//	Hack for Mac firefox
							if(/Mac/i.test(navigator.userAgent))
							{
								$("#WidgetArea iframe").css({overflow:'auto'});
							}
							
							//	select index : 0 tab selected
							$('#tabs').tabs( 'select' , 0);
						}
					}
				});
				
			$('#PreferencesBtn').click(function(){
				//	Load preferences
				NOKIA.helper.loadPreferences();
				$('#PreferencesTab').dialog('open');

				//	Hack for Mac firefox
				if(/Mac/i.test(navigator.userAgent))
				{
					$("#WidgetArea iframe").css({overflow:'hidden'});
				}
			});
			
			$('#input_portrait').change(function(){
				NOKIA.helper.toggle(this);
			});

			$('#input_landscape').change(function(){
				NOKIA.helper.toggle(this);
			});

			$('#resOptions').change(function(ele){
				ele = ele.target || this;
				
				NOKIA.currentDevice = ele.options[ele.selectedIndex].text;
				$("#resSupportLink")[0].href = ele.value;
		
				//	SAVE the device DATA
				NOKIA.helper.createCookie('NOKIA_EMULATOR_DEVICE', NOKIA.currentDevice);
		
				NOKIA.emulator.render();
				NOKIA.helper.loadPreferences();
			});

			//	Hack for Mac firefox
			if (/Mac/i.test(navigator.userAgent)) {
				if (!(/AppleWebKit/i.test(navigator.userAgent))) {
					$("#resOptions")[0].size = '4';
				}
			}


			//	WRT Version controls
			$('#wrt_version_1_0').change(function(){
				NOKIA.helper.version(this);
			});
			
			$('#wrt_version_1_1').change(function(){
				NOKIA.helper.version(this);
			});


			$("#orientationIcon").click(function(){
				var mode = (NOKIA.mode == 'portrait') ? 'landscape' : 'portrait';
				NOKIA.emulator.setMode(mode);
				$("#WidgetArea")[0].className = 'hs_'+NOKIA.mode;
			});


			$("#iframeMask").click(function(){

				$("#PreferencesBtn").show();
				$("#orientationIcon").hide();
				$("#iframeMask").hide();
				$("#loaderDiv").hide();

				NOKIA.menu.is_dimmed = false;
				
				$("#WidgetArea")[0].className = '';
				
				NOKIA.menu.softkeys_visibility = true;
				NOKIA.menu.showSoftKeys();

			});


			//	MenuItems DIV events
			$("#MenuItemsArea").mouseover(function(){
				if(NOKIA.helper.intervalId)
					clearInterval(NOKIA.helper.intervalId);

				$("#MenuItemsArea").show();
			});

			$("#MenuItemsArea").mouseout(function(){
				if(NOKIA.helper.intervalId)
					clearInterval(NOKIA.helper.intervalId);

				NOKIA.helper.intervalId = setTimeout(function(){
					NOKIA.menu.cancel()
				}, 500);
			});


			// Tabs
			$('#tabs').tabs({
				select : function(event, ui){
					if(parseInt(ui.index) == 1)
					{
						$("#event-icons").show();
						$("#event-battery-info").hide();
						$("#event-messaging-info").hide();
						$("#event-memory-info").hide();
						
						//	WRT versionn check
						if(NOKIA.version == 'WRT 1.1')
						{
							$("#event-messaging")[0].className = 'active';
							$("#event-memory")[0].className = 'active';
						}else
						{
							$("#event-messaging")[0].className = 'inactive';
							$("#event-memory")[0].className = 'inactive';
						}
						$("#event-battery")[0].className = 'active';
					}else if(parseInt(ui.index) == 0)
					{
						$("#settings-view").show();
						$("#mini-view-info").hide();
					}
				}
			});

			
			/*	
			 * 	Event triggering
			 */
			
			//	for battery
			$("#event-battery").click(function(event){
				if(event.target.className == 'active')
				{
					$("#event-icons").hide();
					$("#event-battery-info").show();

/*
				$('#slider').slider('option', 'value', NOKIA.emulator.child._BRIDGE_REF.helper.getBatteryStrength());
				NOKIA.emulator.child._BRIDGE_REF.helper.getBatteryStrength()
				$('#slider').slider('option', 'value', 10);
				$('#slider').slider();
*/
				}
			});

			$("#event-battery-back").click(function(event){
				$("#event-icons").show();
				$("#event-battery-info").hide();
			});


			//	for messaging
			$("#event-messaging").click(function(event){
				if(event.target.className == 'active')
				{
					$("#event-icons").hide();
					$("#event-messaging-info").show();
				}
			});

			$("#event-messaging-back").click(function(event){
				$("#event-icons").show();
				$("#event-messaging-info").hide();
			});


			//	for memory
			$("#event-memory").click(function(event){
				if(event.target.className == 'active')
				{
					$("#event-icons").hide();
					$("#event-memory-info").show();
				}
			});

			$("#event-memory-back").click(function(event){
				$("#event-icons").show();
				$("#event-memory-info").hide();
			});


			//	for minView more info
			$("#mini-view-back").click(function(event){
				$("#settings-view").show();
				$("#mini-view-info").hide();
			});


			// Slider
			$('#slider').slider({
				range: true,
				min : 0,
				max : 100,
				step : 1,
				value : 10,
				animate: true,
				slide: function(event, ui) {
					$("#slider-value-panel > span").html(ui.value.toString());
				}
				});

			//	Bind Buttons to trigger values to WRT 1.0 / 1.1 bindings
			
			$("#connect-charger").click(NOKIA.helper.triggerEvents);
			$("#disconnect-charger").click(NOKIA.helper.triggerEvents);
			$("#update-batter-strength").click(NOKIA.helper.triggerEvents);

			$("#send-sms").click(NOKIA.helper.triggerEvents);
			$("#send-mms").click(NOKIA.helper.triggerEvents);

			$("#connect-memory-card").click(NOKIA.helper.triggerEvents);
			$("#disconnect-memory-card").click(NOKIA.helper.triggerEvents);
			
		},
		
		setHomeScreen : function()
		{
			//	HomeScreen Support
			if (NOKIA.deviceList[NOKIA.currentDevice].homeScreenSupport) {

				if (typeof NOKIA.emulator.plist.MiniViewEnabled != 'undefined') {
					if (NOKIA.emulator.plist.MiniViewEnabled != 'false') 
					{
						$("#WidgetArea")[0].className = 'hs_' + NOKIA.mode;
						
						//	menu handlining
						NOKIA.menu.softkeys_visibility = false;
						NOKIA.menu.cancel();
						NOKIA.menu.is_dimmed = true;
						

						$("#loaderDiv").html("Click on widget for Return to Full view");
						$("#loaderDiv")[0].className = 'green';
						$("#loaderDiv").show();

						$("#iframeMask").show();
						$("#orientationIcon").show();
						$("#PreferencesBtn").hide();

						$("#PreferencesTab").dialog('close');
						return true;
					}
				}
			}
			return false;			
		},
		
		getElementsLengthInObject : function(items){
			var count = 0;
			for (var i in items) 
			{
				if(!items[i].isDimmed)
					count++;
			}
			
			return count;
		},
		
		triggerEvents : function(event)
		{
			if(typeof event.target.id == 'undefined')
			return false;
			
			switch(event.target.id)
			{
				//	for battery
				case 'connect-charger': 
										NOKIA.helper.trigger("power", "chargerconnected", 1);
										if(NOKIA.version == 'WRT 1.1')
											NOKIA.helper.triggerSapi("Service.SysInfo", "Battery.ChargingStatus", {Status: 1});
										break;

				case 'disconnect-charger': 
										NOKIA.helper.trigger("power", "chargerconnected", 0);
										if(NOKIA.version == 'WRT 1.1')
											NOKIA.helper.triggerSapi("Service.SysInfo", "Battery.ChargingStatus", {Status: 0});
										break;

				case 'update-batter-strength': 
										var chargeValue = parseInt($('#slider').slider('value'));
										NOKIA.helper.trigger("power", "chargelevel", chargeValue);
										if(NOKIA.version == 'WRT 1.1')
											NOKIA.helper.triggerSapi("Service.SysInfo", "Battery.BatteryStrength", {Status: chargeValue});
										break;

				//	for messaging
				case 'send-sms': 
										if(NOKIA.version == 'WRT 1.1')
											NOKIA.helper.triggerSapi("Service.Messaging", "NewMessage", {MessageType: 'SMS'});
										break;
				case 'send-mms': 
										if(NOKIA.version == 'WRT 1.1')
											NOKIA.helper.triggerSapi("Service.Messaging", "NewMessage", {MessageType: 'MMS'});
										break;

				//	for memory
				case 'connect-memory-card': 
										if(NOKIA.version == 'WRT 1.1')
											NOKIA.helper.triggerSapi("Service.SysInfo", "Memory.MemoryCard", {Status: 1});
										break;
				case 'disconnect-memory-card': 
										if(NOKIA.version == 'WRT 1.1')
											NOKIA.helper.triggerSapi("Service.SysInfo", "Memory.MemoryCard", {Status: 0});
										break;
			}
		},	

		triggerSapi : function(provider, eventType, data){
			NOKIA.emulator.child.device.implementation.triggerListener(provider, eventType, data);
		},	

		trigger : function(provider, eventType, data){
			NOKIA.emulator.child.widget.triggerListener(provider, eventType, data);
		},
		
		showMiniviewHelp : function(){
			$("#settings-view").hide();
			$("#mini-view-info").show();
		},
		
		checkDependencies : function(){
			
			for(var key in NOKIA.scriptsLoaded)
			{
				if(!NOKIA.scriptsLoaded[key])
					return false;
			}

			//	for LSK
			NOKIA.menu.setLsk(NOKIA.emulator.child.menu.show);
		
			//	for RSK
			NOKIA.menu.setRsk(NOKIA.menu.exit);

			return true;
		}
	};
	

	/*
	 * NOKIA.layout functions
	 */
	NOKIA.namespace('layout');
	NOKIA.layout = {
		_console_minimized : true,
		_console_enabled : false,
		_consoleWindowHeight : 200,
		_consoleHeaderHeight : 31,

		init : function(){
			
			//	Toggle console window
			$('#Console-Toggle-Button').click(function(){
				
				NOKIA.layout._console_minimized = (NOKIA.layout._console_minimized) ? false : true;
				NOKIA.layout.render();
			});
			
			// clear Log
			$("#Console-Clear-Button").click(function(){
				$("#preview-ui-bottom-body")[0].innerHTML = '';
			});


			$('#preview-ui-bottom').show();
			NOKIA.layout.render();
		},
		
		log : function(type, msg){
			var p = document.createElement('p');
			p.className = type;
			p.innerHTML = msg;
			var divBody = $('#preview-ui-bottom-body')
			divBody.append(p);
			divBody[0].scrollTop = divBody[0].scrollHeight;
		},
		
		
		render : function(){
			var _width = parseInt(window.innerWidth);
			var _height = parseInt(window.innerHeight);
			
			if(!NOKIA.layout._console_enabled)
			{
				$('#preview-ui-bottom').css({
					display: 'none'
				});
				
				$('#preview-ui-top').css({
					height: _height+'px'
				});

				return false;
			}
			
			
			if(!NOKIA.layout._console_minimized)
			{
				$('#Console-Toggle-Button')[0].className = 'open';
				
				//	set STYLE details for TOP window
				$('#preview-ui-top').css({
					height: parseInt(_height - NOKIA.layout._consoleWindowHeight) + 'px'
				});
				
				//	set STYLE details for Bottom window
				$('#preview-ui-bottom').css({
					height: NOKIA.layout._consoleWindowHeight + 'px',
					display : 'block'
				});

				$('#preview-ui-bottom-header').css({
					height: NOKIA.layout._consoleHeaderHeight + 'px'
				});

				$('#preview-ui-bottom-body').css({
					height: parseInt(NOKIA.layout._consoleWindowHeight - NOKIA.layout._consoleHeaderHeight) + 'px',
					display : 'block'
				});
				
				// Auto scroll when console window opened from MINIMIZED => MAXIMIZED state
				window.setTimeout(function(){
					$('#preview-ui-bottom-body')[0].scrollTop = $('#preview-ui-bottom-body')[0].scrollHeight;
				}, 100);
				
			}else{
				$('#Console-Toggle-Button')[0].className = 'close';

				//	set STYLE details for TOP window
				$('#preview-ui-top').css({
					height: parseInt(_height - NOKIA.layout._consoleHeaderHeight) + 'px'
				});
				
				//	set STYLE details for Bottom window
				$('#preview-ui-bottom').css({
					height: NOKIA.layout._consoleHeaderHeight + 'px',
					display : 'block'
				});

				$('#preview-ui-bottom-header').css({
					height: NOKIA.layout._consoleHeaderHeight + 'px',
					display : 'block'
				});

				$('#preview-ui-bottom-body').css({
					display : 'none'
				});
			}
		}
		
	};
}

$(document).ready(function () {
	NOKIA.init();	
});

window.onresize = NOKIA.layout.render;
