var myLocation;
var myNotification;
var myContactManager;
var timeout = null;
var displayState = 0;

function start() {
	try {
		var options = new Object();
		options.frequency = 8000;
		timeout = setInterval("animate()", 500);
		myLocation.watchPosition(updateLocation, function() {}, options);
		
		myContactManager.getAllContacts(displayContacts, function() { alert('getallcontacts fail'); }, new Object());
		
		options.frequency = 1000;
		myAccelerometer.watchAcceleration(updateAcceleration, function () { alert('watch failed'); }, options);
	} catch (ex) {
		alert(ex.name + " " + ex.message);
	}
}

function init() {
	myNotification = new Notification();
	myLocation = new Geolocation();
	myContactManager = new ContactManager();
	myAccelerometer = new Accelerometer();
	start();
}

function updateLocation() {
	clearTimeout(timeout);
	//pt.latitude, pt.longitude, pt.altitude, pt.accuracy, pt.heading, pt.speed
	var pt = myLocation.lastPosition.coords;
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
	var contacts = myContactManager.contacts;
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
		myNotification.vibrate(2000);
		myNotification.beep(2000, 100);
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