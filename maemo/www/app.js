
var PhoneGap={}
PhoneGap.addConstructor=function(func)
{func();};function Device(){this.available=true;this.platform=DeviceInfo.platform;this.version=DeviceInfo.version;this.name=DeviceInfo.name;this.gap=DeviceInfo.gap;this.uuid=DeviceInfo.uuid;}
navigator.Device=window.Device=window.device=new Device();function Accelerometer(){this.lastAcceleration=null;}
__PG_ACCELEROMETER_CALLBACK_USER=null;__PG_ACCELEROMETER_CALLBACK=function(x,y,z)
{console.log("CALLBACK")
var accel={x:x,y:y,z:z};__PG_ACCELEROMETER_CALLBACK_USER(accel);Accelerometer.lastAcceleration=accel;}
Accelerometer.prototype.getCurrentAcceleration=function(successCallback,errorCallback,options){console.log("getCurrent");if(typeof successCallback=="function"){_NativeAccelerometer.get();__PG_ACCELEROMETER_CALLBACK_USER=successCallback;}}
Accelerometer.prototype.watchAcceleration=function(successCallback,errorCallback,options){this.getCurrentAcceleration(successCallback,errorCallback,options);var frequency=(options!=undefined)?options.frequency:10000;return setInterval(function(){navigator.accelerometer.getCurrentAcceleration(successCallback,errorCallback,options);},frequency);}
Accelerometer.prototype.clearWatch=function(watchId){clearInterval(watchId);}
if(typeof navigator.accelerometer=="undefined")navigator.accelerometer=new Accelerometer();function Notification(){}
Notification.prototype.alert=function(message,title,buttonLabel){_NativeNotification.alert(message,title,buttonLabel);};Notification.prototype.activityStart=function(){};Notification.prototype.activityStop=function(){};Notification.prototype.blink=function(count,colour){};Notification.prototype.vibrate=function(mills){};Notification.prototype.beep=function(count,volume){};if(typeof navigator.notification=="undefined")navigator.notification=new Notification();