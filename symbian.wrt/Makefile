SHELL = /bin/sh
CHMOD = chmod
CP = cp
MV = mv
NOOP = $(SHELL) -c true
RM_F = rm -f
RM_RF = rm -rf
TEST_F = test -f
TOUCH = touch
UMASK_NULL = umask 0
DEV_NULL = > /dev/null 2>&1
MKPATH = mkdir -p
CAT = cat
MAKE = make
OPEN = open
ECHO = echo
ECHO_N = echo -n
JAVA = java

all :: js package

clean :: clean_libs

clean_libs:
	-$(RM_RF) lib
	
package:
	cp lib/phonegap.js framework/www/phonegap.js
	cd framework/ && zip -r app.zip www/* -x www/wrt_preview_frame.html www/wrt_preview_main.html www/preview/ www/*.wgz
	mv framework/app.zip app.wgz
	
js: lib/phonegap.js

lib/phonegap.js: js/phonegap.js.base js/acceleration.js js/accelerometer.js js/camera.js js/camera/com.nokia.device.utility.js js/camera/com.nokia.device.framework.js js/camera/s60_camera.js js/camera/com.nokia.device.camera.js js/contacts.js js/debugconsole.js js/device.js js/geolocation.js js/map.js js/media.js js/notification.js js/orientation.js js/position.js js/sms.js js/storage.js js/telephony.js
	$(MKPATH) lib
	$(RM_F) $@
	$(CAT) js/phonegap.js.base >> $@
	$(CAT) js/acceleration.js >> $@
	$(CAT) js/accelerometer.js >> $@
	$(CAT) js/camera.js >> $@
	$(CAT) js/camera/com.nokia.device.utility.js >> $@
	$(CAT) js/camera/com.nokia.device.framework.js >> $@
	$(CAT) js/camera/s60_camera.js >> $@
	$(CAT) js/camera/com.nokia.device.camera.js >> $@
	$(CAT) js/contacts.js >> $@
	$(CAT) js/debugconsole.js >> $@
	$(CAT) js/device.js >> $@
	$(CAT) js/geolocation.js >> $@
	$(CAT) js/map.js >> $@
	$(CAT) js/media.js >> $@
	$(CAT) js/notification.js >> $@
	$(CAT) js/orientation.js >> $@
	$(CAT) js/position.js >> $@
	$(CAT) js/sms.js >> $@
	$(CAT) js/storage.js >> $@
	$(CAT) js/telephony.js >> $@
