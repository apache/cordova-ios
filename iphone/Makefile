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
DOXYGEN = 
IPHONE_DOCSET_TMPDIR = docs/iphone/tmp
PACKAGEMAKER = /Developer/Applications/Utilities/PackageMaker.app/Contents/MacOS/PackageMaker

all :: installer

clean :: clean_libs

clean_libs:
	-$(RM_RF) lib

lib/iphone/phonegap-min.js: lib/phonegap.js
	$(JAVA) -jar util/yuicompressor-2.4.2.jar --charset UTF-8 -o $@ lib/iphone/phonegap.js

lib/phonegap.js: javascripts/phonegap.js.base javascripts/acceleration.js javascripts/accelerometer.js javascripts/camera.js javascripts/contact.js javascripts/debugconsole.js javascripts/device.js javascripts/file.js javascripts/geolocation.js javascripts/compass.js javascripts/map.js javascripts/media.js javascripts/notification.js javascripts/orientation.js javascripts/position.js javascripts/sms.js javascripts/telephony.js javascripts/uicontrols.js javascripts/network.js
	$(RM_RF) lib
	$(MKPATH) lib
	$(RM_F) $@
	$(CAT) javascripts/phonegap.js.base >> $@
	$(CAT) javascripts/acceleration.js >> $@
	$(CAT) javascripts/accelerometer.js >> $@
	$(CAT) javascripts/camera.js >> $@
	$(CAT) javascripts/contact.js >> $@
	$(CAT) javascripts/debugconsole.js >> $@
	$(CAT) javascripts/device.js >> $@
	$(CAT) javascripts/file.js >> $@
	$(CAT) javascripts/geolocation.js >> $@
	$(CAT) javascripts/compass.js >> $@
	$(CAT) javascripts/map.js >> $@
	$(CAT) javascripts/media.js >> $@
	$(CAT) javascripts/notification.js >> $@
	$(CAT) javascripts/orientation.js >> $@
	$(CAT) javascripts/position.js >> $@
	$(CAT) javascripts/sms.js >> $@
	$(CAT) javascripts/telephony.js >> $@
	$(CAT) javascripts/uicontrols.js >> $@
	$(CAT) javascripts/network.js >> $@
	$(CP) $@ PhoneGap-based\ Application/www/phonegap.js
	
javascript: lib/phonegap.js

installer: javascript
	$(PACKAGEMAKER) -d PhoneGapLibInstaller/PhoneGapLibInstaller.pmdoc -o PhoneGapLibInstaller.pkg
 
	
