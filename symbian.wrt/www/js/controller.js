var timeout = null;
var displayState = 0;
var accel_watch_id;
var CURRENT_VIEW = "CONTACTS";
var current_menu = null;

function init() {
	current_menu = document.getElementById("mnu-cont");
}

var changeView = function (e) {
	if (current_menu)
		current_menu.className = "menu-item";
	current_menu = e.target;
	e.target.className = "menu-item selected";
	var id = e.target.innerHTML;
	document.getElementById(CURRENT_VIEW).style.display = "none";
	document.getElementById(id).style.display = "block";
	CURRENT_VIEW = id;
}

function getLocation() {
	var options = new Object();
	options.frequency = 8000;
	timeout = setInterval("animate()", 500);
	navigator.geolocation.getCurrentPosition(updateLocation, function(){
	}, options);
}

function watchAccel() {
	var options = new Object();
	options.frequency = 1000;
	accel_watch_id = navigator.accelerometer.watchAcceleration(updateAcceleration, function(ex){
		navigator.accelerometer.clearWatch(accel_watch_id);
		alert("accel fail (" + ex.name + ": " + ex.message + ")");
	}, options);
}

function watchOrientation() {
	var options = new Object();
	options.frequency = 1000;
	navigator.orientation.watchOrientation(updateOrientation, null, options);
}

function getContacts() {
	navigator.ContactManager.getAllContacts(displayContacts, function(){
		alert('getallcontacts fail');
	}, new Object());
}

function checkStorage() {
	var store = navigator.storage.getItem("store_test");
	if (store) {
		document.getElementById("storage_output").innerHTML = "You stored this: " + store;
	}
}

function updateLocation(position) {
	clearTimeout(timeout);
	//pt.latitude, pt.longitude, pt.altitude, pt.accuracy, pt.heading, pt.speed
	var pt = position.coords;
	document.getElementById('latitude').innerHTML = pt.latitude;
	document.getElementById('longitude').innerHTML = pt.longitude;
	document.getElementById('altitude').innerHTML = pt.altitude;
	document.getElementById('heading').innerHTML = pt.heading;
	document.getElementById('speed').innerHTML = pt.speed;
}

function updateAcceleration(accel) {
	document.getElementById('accel_x').innerHTML = accel.x;
	document.getElementById('accel_y').innerHTML = accel.y;
	document.getElementById('accel_z').innerHTML = accel.z;
}

function displayContacts() {
	var contacts = navigator.ContactManager.contacts;
	var output = "";
	for (var i=0; i<contacts.length; i++) {
		output += 	"<div class='list-item'>" + contacts[i].firstName + " " + contacts[i].lastName +
					"<span class='list-item-small'> Phone: " + contacts[i].phones["Mobile"] +
					"</div>";
	}
	document.getElementById('contacts').innerHTML = output;
}

function vibrate() {
	try {
		navigator.notification.vibrate(2000);
	} catch (ex) {
		alert(ex.name + ": " + ex.message);
	}
}

function animate() {
	switch (displayState) {
		case 0:
			displayStatus('finding satellites.');
			displayState = 1;
			break;
		case 1:
			displayStatus('finding satellites..');
			displayState = 2;
			break;
		case 2:
			displayStatus('finding satellites...');
			displayState = 3;
			break;
		case 3:
			displayStatus('finding satellites');
			displayState = 0;
			break;
			
	}
}

function displayStatus(status) {
	document.getElementById('latitude').innerHTML = status;
	document.getElementById('longitude').innerHTML = status;
	document.getElementById('altitude').innerHTML = status;
	document.getElementById('heading').innerHTML = status;
	document.getElementById('speed').innerHTML = status;
}

function sendSMS() {
	var number = document.getElementById('sms_number').value;
	navigator.sms.send(number, "I love scotch. scotch scotch scotch", smsSuccess, smsFailure);
}

function smsSuccess() {
	document.getElementById("sms_status").innerHTML = "success";
}

function smsFailure() {
	document.getElementById("sms_status").innerHTML = "failed";
}

function takePicture() {
	navigator.camera.getPicture(cameraSuccess, cameraFailure, null);
}

function cameraSuccess(imageUrls) {
	//this is an array of all the photos taken while the camera app was open
	document.getElementById('preview').innerHTML = "<img class=\"img_preview\" src=\"" + imageUrls[0] + "\" alt=\"\" />";
}

function cameraFailure(error) {
	alert("camera fail: " + error.name + " - " + error.message);
}

function updateOrientation(orientation) {
	document.getElementById("orientation").innerHTML = orientation;
}

function testStorage(mode) {
	try {
		if (mode == 'store') {

			navigator.storage.setItem("store_test", document.getElementById("storage_string").value);
		}
		else {
			navigator.storage.removeItem("store_test");
		}
	} catch (ex) {
		alert(ex.name + ": " + ex.message);
	}
}
