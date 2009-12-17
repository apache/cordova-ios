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

all :: js copy_js package deploy

custom :: js copy_js package deploy

clean :: clean_libs

clean_libs:
	-$(RM_RF) lib
	
package:
	cp framework/www/index.html framework/www/app/views/First/First-scene.html
	palm-package framework/www/

deploy:
	palm-install com.palm.phonegap_1.0.0_all.ipk
	
copy_js:
	cp lib/phonegap.js framework/www/phonegap.js
	
js: lib/phonegap.js

lib/phonegap.js: js/phonegap.js.base js/acceleration.js js/accelerometer.js js/audio.js js/camera.js js/contacts.js js/debugconsole.js js/device.js js/file.js js/geolocation.js js/map.js js/network.js js/notification.js js/orientation.js js/position.js js/sms.js js/telephony.js
	$(MKPATH) lib
	$(RM_F) $@
	$(CAT) js/phonegap.js.base >> $@
	$(CAT) js/acceleration.js >> $@
	$(CAT) js/accelerometer.js >> $@
	$(CAT) js/audio.js >> $@
	$(CAT) js/camera.js >> $@
	$(CAT) js/contacts.js >> $@
	$(CAT) js/debugconsole.js >> $@
	$(CAT) js/device.js >> $@
	$(CAT) js/file.js >> $@
	$(CAT) js/geolocation.js >> $@
	$(CAT) js/map.js >> $@
	$(CAT) js/network.js >> $@
	$(CAT) js/notification.js >> $@
	$(CAT) js/orientation.js >> $@
	$(CAT) js/position.js >> $@
	$(CAT) js/sms.js >> $@
	$(CAT) js/telephony.js >> $@
