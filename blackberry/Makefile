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

all :: blackberry

blackberry: lib/phonegap-min.js

lib/phonegap-min.js: lib/phonegap.js
	$(JAVA) -jar ../util/yuicompressor-2.4.2.jar --charset UTF-8 -o $@ lib/phonegap.js

lib/phonegap.js: js/phonegap.js js/acceleration.js js/accelerometer.js js/camera.js js/contacts.js js/device.js js/file.js js/geolocation.js js/compass.js js/media.js js/network.js js/notification.js js/orientation.js js/position.js js/sms.js js/telephony.js js/utility.js
	$(RM_RF) lib
	$(MKPATH) lib
	$(RM_F) $@
	$(CAT) js/phonegap.js >> $@
	$(CAT) js/acceleration.js >> $@
	$(CAT) js/accelerometer.js >> $@
	$(CAT) js/camera.js >> $@
	$(CAT) js/contacts.js >> $@
	$(CAT) js/device.js >> $@
	$(CAT) js/file.js >> $@
	$(CAT) js/geolocation.js >> $@
	$(CAT) js/compass.js >> $@
	$(CAT) js/media.js >> $@
	$(CAT) js/network.js >> $@
	$(CAT) js/notification.js >> $@
	$(CAT) js/orientation.js >> $@
	$(CAT) js/position.js >> $@
	$(CAT) js/sms.js >> $@
	$(CAT) js/telephony.js >> $@
	$(CAT) js/utility.js >> $@
	$(CP) $@ framework/src/www/phonegap.js