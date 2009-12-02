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

all :: js copy_js install

clean :: clean_libs

clean_libs:
	-$(RM_RF) lib
	
copy_js:
	cp lib/phonegap.js framework/www/phonegap.js
	
install:
	cp framework/www/index.html framework/www/app/views/First/First-scene.html
	palm-package framework/www/
	palm-install com.nitobi.phonegap_1.0.0_all.ipk
	
js: lib/phonegap.js

lib/phonegap.js: js/acceleration.js js/accelerometer.js js/device.js js/geolocation.js js/network.js js/notification.js js/orientation.js js/position.js
	$(MKPATH) lib
	$(RM_F) $@
	$(CAT) js/acceleration.js >> $@
	$(CAT) js/accelerometer.js >> $@
	$(CAT) js/device.js >> $@
	$(CAT) js/geolocation.js >> $@
	$(CAT) js/network.js >> $@
	$(CAT) js/notification.js >> $@
	$(CAT) js/orientation.js >> $@
	$(CAT) js/position.js >> $@
