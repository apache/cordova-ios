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

all :: symbian.wrt

clean :: clean_libs

clean_libs:
	-$(RM_RF) lib
	
symbian.wrt: lib/phonegap.js

lib/phonegap.js: javascripts/phonegap.js.base javascripts/acceleration.js javascripts/accelerometer.js javascripts/camera.js javascripts/camera/com.nokia.device.utility.js javascripts/camera/com.nokia.device.framework.js javascripts/camera/s60_camera.js javascripts/camera/com.nokia.device.camera.js javascripts/contact.js javascripts/device.js javascripts/geolocation.js javascripts/media.js javascripts/notification.js javascripts/orientation.js javascripts/position.js javascripts/sms.js javascripts/storage.js
	$(MKPATH) lib
	$(RM_F) $@
	$(CAT) javascripts/phonegap.js.base >> $@
	$(CAT) javascripts/acceleration.js >> $@
	$(CAT) javascripts/accelerometer.js >> $@
	$(CAT) javascripts/camera.js >> $@
	$(CAT) javascripts/camera/com.nokia.device.utility.js >> $@
	$(CAT) javascripts/camera/com.nokia.device.framework.js >> $@
	$(CAT) javascripts/camera/s60_camera.js >> $@
	$(CAT) javascripts/camera/com.nokia.device.camera.js >> $@
	$(CAT) javascripts/contact.js >> $@
	$(CAT) javascripts/device.js >> $@
	$(CAT) javascripts/geolocation.js >> $@
	$(CAT) javascripts/media.js >> $@
	$(CAT) javascripts/notification.js >> $@
	$(CAT) javascripts/orientation.js >> $@
	$(CAT) javascripts/position.js >> $@
	$(CAT) javascripts/sms.js >> $@
	$(CAT) javascripts/storage.js >> $@
