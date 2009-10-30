PhoneGap.run_command = function() {
    if (!PhoneGap.available || !PhoneGap.queue.ready)
        return;
		
	PhoneGap.queue.ready = false;
		
	var args = PhoneGap.queue.commands.shift();
    if (PhoneGap.queue.commands.length == 0) {
        clearInterval(PhoneGap.queue.timer);
        PhoneGap.queue.timer = null;
    }
	
	var command = "PhoneGap=" + args.join("/");
	document.cookie = command;
};
