function FirstAssistant(args) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	this.args = args;
}

FirstAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
		
	/* use Mojo.View.render to render view templates and add them to the scene, if needed. */
	
	/* setup widgets here */
	
	/* add event handlers to listen to events from widgets */
	
	var app_url = Mojo.appPath + "index.html";
	Mojo.Log.error(app_url);
	
	this.controller.setupWidget("WebId",
	        this.attributes = {
	            url:    app_url,
	            },
	        this.model = {
	            }
	   );
	//Bind the methods that listen to it
	        this.progress = this.progress.bind(this);
	        this.started = this.started.bind(this);
	        this.stopped = this.stopped.bind(this);
	        this.finished = this.finished.bind(this);

	        //Start listening
	        Mojo.Event.listen(this.controller.get( "WebId" ), Mojo.Event.webViewLoadProgress, this.progress);
	        Mojo.Event.listen(this.controller.get( "WebId" ), Mojo.Event.webViewLoadStarted, this.started);
	        Mojo.Event.listen(this.controller.get( "WebId" ), Mojo.Event.webViewLoadStopped, this.stopped);
	        Mojo.Event.listen(this.controller.get( "WebId" ), Mojo.Event.webViewLoadFailed, this.stopped);
	        Mojo.Event.listen(this.controller.get( "WebId" ), Mojo.Event.webViewDidFinishDocumentLoad, this.stopped);
	        Mojo.Event.listen(this.controller.get( "WebId" ), Mojo.Event.webViewDownloadFinished, this.finished);
	
/*	Mojo.Log.error(document.body);
	Mojo.Log.error(document.body.innerHTML);
	Mojo.Log.error(this.args.html);
		
	this.buttonModel = {
		buttonLabel : 'Go!!',
		buttonClass : 'affirmative',
		disable : false
	}
	this.buttonAtt = {
		type: 'activity'
	}
				
	this.controller.setupWidget('GetButton',this.buttonAtt,this.buttonModel);
	var that = this;
	this.controller.listen(this.controller.get('GetButton'), Mojo.Event.tap, function(){ 
		navigator.geolocation.watchPosition(that.displayPosition, function() {}, { interval: 5000 });
		navigator.network.isReachable(null, function(result) {
			$('network-output').innerHTML = "<p>" + (result? "Network is reachable" : "Network unreachable") + "</p>";
		});
	});
*/
}

FirstAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
}


FirstAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
}

FirstAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
}

FirstAssistant.prototype.displayPosition = function() {
	var pos = navigator.geolocation.lastPosition.coords;
	$('geo-output').innerHTML = "<p>Geo Info:<br/>" + 
				"latitude: " + pos.latitude + "<br/>" +
				"longitude: " + pos.longitude + "<br/>" + 
				"altitude: " + pos.altitude + "<br/>" +
				"speed: " + pos.speed + "<br/>" +
				"heading: " + pos.heading + "<br/>" +
				"accuracy: " + pos.accuracy + "</p>";
}

FirstAssistant.prototype.started = function(event) { Mojo.Log.error( "started" ); }
FirstAssistant.prototype.progress = function(event) { Mojo.Log.error( "progress" ); }
FirstAssistant.prototype.stopped = function(event) { Mojo.Log.error( "stopped" ); }
FirstAssistant.prototype.finished = function(event) { Mojo.Log.error( "finished" ); }
