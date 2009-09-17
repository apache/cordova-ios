//	for console support
if (typeof window.parent.console == 'undefined') {
	window.console = {
	
			sprintf: function(args){
				if (typeof args == 'undefined') {
					return null;
				}
				
				if (args.length < 1) {
					return null;
				};
				
				if (typeof args[0] != 'string') {
					return null;
				}
				
				if (typeof RegExp == 'undefined') {
					return null;
				}
				
				if (args.length == 1) {
					return args[0];
				}
				
				
				var str = args[0];
				var newString = args[0];
				var arr = new Array();
				var exp = new RegExp(/[^%](%)([a-zA-Z])/g);
				var match = null;
				var lastMatch = 0;
				var argPos = 1;
				while (match = exp.exec(str) && argPos < args.length) {
					if (str[exp.lastIndex - 1] == "%") {
						
					}
					else 
						if (str[exp.lastIndex - 1] == "d") {
							arr.push(str.substring(lastMatch, exp.lastIndex - 2));
							arr.push(args[argPos++]);
						}
						else 
							if (str[exp.lastIndex - 1] == "i") {
								arr.push(str.substring(lastMatch, exp.lastIndex - 2));
								arr.push(args[argPos++]);
							}
							else 
								if (str[exp.lastIndex - 1] == "f") {
									arr.push(str.substring(lastMatch, exp.lastIndex - 2));
									arr.push(args[argPos++]);
								}
								else 
									if (str[exp.lastIndex - 1] == "s") {
										arr.push(str.substring(lastMatch, exp.lastIndex - 2));
										arr.push(args[argPos++]);
									}
									else 
										if (str[exp.lastIndex - 1] != "%") {
											arr.push(str.substring(lastMatch, exp.lastIndex - 2));
											arr.push("\"");
											arr.push(args[argPos++]);
											arr.push("\"");
										}
					lastMatch = exp.lastIndex;
				}
				if (lastMatch < str.length) {
					arr.push(str.substring(lastMatch, str.length));
				}
				while (argPos < args.length) {
					arr.push(" ");
					arr.push(args[argPos++]);
				}
				return arr.join("").replace(/\%\%/g,"%");
			},
		error: function(){
			var errorStr = console.sprintf(arguments);
			if (errorStr) {
				_BRIDGE_REF.nokia.layout.log('error', errorStr);
			}
		},
		info: function(){
			var errorStr = console.sprintf(arguments);
			if (errorStr) {
				_BRIDGE_REF.nokia.layout.log('info', errorStr);
			}
		},
		warn: function(){
			var errorStr = console.sprintf(arguments);
			if (errorStr) {
				_BRIDGE_REF.nokia.layout.log('warn', errorStr);
			}
		},
		log: function(){
			var errorStr = console.sprintf(arguments);
			if (errorStr) {
				_BRIDGE_REF.nokia.layout.log('log', errorStr);
			}
		},
		debug: function(){
			var errorStr = console.sprintf(arguments);
			if (errorStr) {
				_BRIDGE_REF.nokia.layout.log('debug', errorStr);
			}
		},
		assert: function(){
			var errorStr = console.sprintf(arguments);
			if (errorStr) {
				//	@todo
			}
		}
	}
	
	//	enable the Console.
	_BRIDGE_REF.nokia.layout._console_enabled = true;
	_BRIDGE_REF.nokia.layout.render();

}

//	make TRUE console.js script loaded
window.parent.NOKIA.scriptsLoaded.console = true;
