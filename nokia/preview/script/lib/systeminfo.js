/**
	This API is used to provide system related data.
	It takes the sysObject as an argument that is the embeded API in the main HTML file.
	While using this API outside mobile environment, User or developer need not to take any extara action in oprder to support SYSAPI.
*/

function systemAPI(sysObject)
{
	/*
	 * 	System Language information services
	 */
	sysObject.language = 'EN';




	/*
	 * 	Power information services
	 */
	
	//	Properties
	sysObject.chargelevel = 5;
	sysObject.chargerconnected = 0;

	//	Event triggers
	sysObject.onchargelevel = null;
	sysObject.onchargerconnected = null;



	/*
	 * 	Beep tone control services
	 */	
	sysObject.beep = function(frequency, duration){	}



	/*
	 * 	Network Information services
	 */
	
	//	value range between: {0-7}
	sysObject.signalbars = 7;

	sysObject.networkname = 'No network';

	//	value range between: {0-7}
	sysObject.networkregistrationstatus = 0;
	


	/*
	 * 	Display and keypad illumination information and control services
	 */

	//	Properties
	sysObject.lightminintensity = 1;
	sysObject.lightmaxintensity = 100;
	sysObject.lightdefaultintensity = 0;
	
	sysObject.lightinfiniteduration = 0;
	sysObject.lightmaxduration = 1;
	sysObject.lightdefaultcycletime = 0;

	sysObject.lighttargetprimarydisplayandkeyboard = 0x3;
	sysObject.lighttargetsystem = 1;

	//	functions
	sysObject.lighton	= function(lighttarget, duration, intensity, fadein){ 	}
	sysObject.lightblink	= function(lighttarget, duration, onduration, offduration, intensity){ 	}
	sysObject.lightoff	= function(lighttarget, duration, fadeout){ 	}



	/*
	 * 	Vibration information and control services
	 */
	sysObject.vibraminintensity = 1;
	sysObject.vibramaxintensity = 10;
	sysObject.vibramaxduration = 100;
	
	//	Vibration setting in the user profile is off.
	sysObject.vibrasettings = 2; 

	sysObject.startvibra	= function(duration, intensity){	}

	sysObject.stopvibra	= function(){	}




	/*
	 * 	Memory and file system information services
	 */
	sysObject.totalram = 32;	
	sysObject.freeram = 10;	
	sysObject.drivelist = 'C';	

	sysObject.drivesize	= function(drive){	return 64;	}
	
	sysObject.drivefree	= function(drive){	return 32;	}

}


//	make TRUE systeminfo.js script loaded
window.parent.NOKIA.scriptsLoaded.systeminfo = true;