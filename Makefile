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

all :: iphone blackberry android nokia docs

clean :: clean_docs clean_libs

clean_docs:
	-$(RM_RF) docs/javascript
	-$(RM_RF) docs/iphone

clean_libs:
	-$(RM_RF) lib

iphone/www/phonegap.js: lib/iphone/phonegap-min.js
	$(CP) lib/iphone/phonegap-min.js $@

docs :: javascript_docs iphone_docs

iphone_docs:
javascript_docs :: javascripts/acceleration.js javascripts/accelerometer.js javascripts/camera.js javascripts/contact.js javascripts/debugconsole.js javascripts/device.js javascripts/file.js javascripts/geolocation.js javascripts/compass.js javascripts/map.js javascripts/media.js javascripts/notification.js javascripts/orientation.js javascripts/position.js javascripts/sms.js javascripts/telephony.js javascripts/uicontrols.js
	$(JAVA) -jar util/jsdoc-toolkit/jsrun.jar util/jsdoc-toolkit/app/run.js -a -d=docs/javascript -t=util/jsdoc-toolkit/templates/jsdoc  javascripts/acceleration.js javascripts/accelerometer.js javascripts/camera.js javascripts/contact.js javascripts/debugconsole.js javascripts/device.js javascripts/file.js javascripts/geolocation.js javascripts/compass.js javascripts/map.js javascripts/media.js javascripts/notification.js javascripts/orientation.js javascripts/position.js javascripts/sms.js javascripts/telephony.js javascripts/uicontrols.js
iphone: lib/iphone/phonegap-min.js

lib/iphone/phonegap-min.js: lib/iphone/phonegap.js
	$(JAVA) -jar util/yuicompressor-2.4.2.jar --charset UTF-8 -o $@ lib/iphone/phonegap.js

lib/iphone/phonegap.js: javascripts/phonegap.js.base javascripts/acceleration.js javascripts/accelerometer.js javascripts/camera.js javascripts/contact.js javascripts/debugconsole.js javascripts/device.js javascripts/file.js javascripts/geolocation.js javascripts/compass.js javascripts/map.js javascripts/media.js javascripts/notification.js javascripts/orientation.js javascripts/position.js javascripts/sms.js javascripts/telephony.js javascripts/uicontrols.js javascripts/network.js javascripts/iphone/accelerometer.js javascripts/iphone/bonjour.js javascripts/iphone/contact.js javascripts/iphone/camera.js javascripts/iphone/debugconsole.js javascripts/iphone/device.js javascripts/iphone/geolocation.js javascripts/iphone/compass.js javascripts/iphone/media.js javascripts/iphone/notification.js javascripts/iphone/phonegap.js javascripts/iphone/uicontrols.js javascripts/iphone/network.js
	$(RM_RF) lib/iphone
	$(MKPATH) lib/iphone
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
	$(CAT) javascripts/iphone/accelerometer.js >> $@
	$(CAT) javascripts/iphone/bonjour.js >> $@
	$(CAT) javascripts/iphone/contact.js >> $@
	$(CAT) javascripts/iphone/camera.js >> $@
	$(CAT) javascripts/iphone/debugconsole.js >> $@
	$(CAT) javascripts/iphone/device.js >> $@
	$(CAT) javascripts/iphone/geolocation.js >> $@
	$(CAT) javascripts/iphone/compass.js >> $@
	$(CAT) javascripts/iphone/media.js >> $@
	$(CAT) javascripts/iphone/notification.js >> $@
	$(CAT) javascripts/iphone/phonegap.js >> $@
	$(CAT) javascripts/iphone/uicontrols.js >> $@
	$(CAT) javascripts/iphone/network.js >> $@

blackberry: lib/blackberry/phonegap-min.js

lib/blackberry/phonegap-min.js: lib/blackberry/phonegap.js
	$(JAVA) -jar util/yuicompressor-2.4.2.jar --charset UTF-8 -o $@ lib/blackberry/phonegap.js

lib/blackberry/phonegap.js: javascripts/phonegap.js.base javascripts/acceleration.js javascripts/accelerometer.js javascripts/camera.js javascripts/contact.js javascripts/debugconsole.js javascripts/device.js javascripts/file.js javascripts/geolocation.js javascripts/compass.js javascripts/media.js javascripts/network.js javascripts/notification.js javascripts/orientation.js javascripts/position.js javascripts/sms.js javascripts/telephony.js javascripts/blackberry/phonegap.js javascripts/blackberry/contacts.js javascripts/blackberry/device.js javascripts/blackberry/file.js javascripts/blackberry/geolocation.js javascripts/blackberry/compass.js javascripts/blackberry/media.js javascripts/blackberry/network.js javascripts/blackberry/notification.js javascripts/blackberry/sms.js
	$(RM_RF) lib/blackberry
	$(MKPATH) lib/blackberry
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
	$(CAT) javascripts/network.js >> $@
	$(CAT) javascripts/notification.js >> $@
	$(CAT) javascripts/orientation.js >> $@
	$(CAT) javascripts/position.js >> $@
	$(CAT) javascripts/sms.js >> $@
	$(CAT) javascripts/telephony.js >> $@
	$(CAT) javascripts/blackberry/phonegap.js >> $@
	$(CAT) javascripts/blackberry/contacts.js >> $@
	$(CAT) javascripts/blackberry/device.js >> $@
	$(CAT) javascripts/blackberry/file.js >> $@
	$(CAT) javascripts/blackberry/geolocation.js >> $@
	$(CAT) javascripts/blackberry/compass.js >> $@
	$(CAT) javascripts/blackberry/media.js >> $@
	$(CAT) javascripts/blackberry/network.js >> $@
	$(CAT) javascripts/blackberry/notification.js >> $@
	$(CAT) javascripts/blackberry/sms.js >> $@
	$(CAT) javascripts/blackberry/telephony.js >> $@
android: lib/android/phonegap-min.js

lib/android/phonegap-min.js: lib/android/phonegap.js
	$(JAVA) -jar util/yuicompressor-2.4.2.jar --charset UTF-8 -o $@ lib/android/phonegap.js

lib/android/phonegap.js: javascripts/phonegap.js.base javascripts/acceleration.js javascripts/accelerometer.js javascripts/addressbook.js javascripts/camera.js javascripts/debugconsole.js javascripts/device.js javascripts/file.js javascripts/geolocation.js javascripts/map.js javascripts/media.js javascripts/notification.js javascripts/orientation.js javascripts/position.js javascripts/sms.js javascripts/telephony.js javascripts/uicontrols.js javascripts/android/device.js javascripts/android/geolocation.js javascripts/android/notification.js javascripts/android/camera.js
	$(MKPATH) lib/android
	$(RM_F) $@
	$(CAT) javascripts/phonegap.js.base >> $@
	$(CAT) javascripts/acceleration.js >> $@
	$(CAT) javascripts/accelerometer.js >> $@
	$(CAT) javascripts/addressbook.js >> $@
	$(CAT) javascripts/camera.js >> $@
	$(CAT) javascripts/debugconsole.js >> $@
	$(CAT) javascripts/device.js >> $@
	$(CAT) javascripts/file.js >> $@
	$(CAT) javascripts/geolocation.js >> $@
	$(CAT) javascripts/map.js >> $@
	$(CAT) javascripts/media.js >> $@
	$(CAT) javascripts/notification.js >> $@
	$(CAT) javascripts/orientation.js >> $@
	$(CAT) javascripts/position.js >> $@
	$(CAT) javascripts/sms.js >> $@
	$(CAT) javascripts/telephony.js >> $@
	$(CAT) javascripts/uicontrols.js >> $@
	$(CAT) javascripts/android/device.js >> $@
	$(CAT) javascripts/android/geolocation.js >> $@
	$(CAT) javascripts/android/notification.js >> $@
	$(CAT) javascripts/android/accelerometer.js >> $@
	$(CAT) javascripts/android/camera.js >> $@
	$(CAT) javascripts/android/addressbook.js >> $@
	$(CAT) javascripts/android/media.js >> $@
	$(CAT) javascripts/android/file.js >> $@
	
nokia: lib/nokia/phonegap-min.js

lib/nokia/phonegap-min.js: lib/nokia/phonegap.js
	$(JAVA) -jar util/yuicompressor-2.4.2.jar --charset UTF-8 -o $@ lib/nokia/phonegap.js

lib/nokia/phonegap.js: javascripts/phonegap.js.base javascripts/acceleration.js javascripts/accelerometer.js javascripts/camera.js javascripts/contact.js javascripts/debugconsole.js javascripts/device.js javascripts/file.js javascripts/geolocation.js javascripts/map.js javascripts/media.js javascripts/notification.js javascripts/orientation.js javascripts/position.js javascripts/sms.js javascripts/telephony.js javascripts/uicontrols.js javascripts/nokia/geolocation.js javascripts/nokia/notification.js javascripts/nokia/contact.js
	$(MKPATH) lib/nokia
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
	$(CAT) javascripts/nokia/geolocation.js >> $@
	$(CAT) javascripts/nokia/notification.js >> $@
	$(CAT) javascripts/nokia/contact.js >> $@
	$(CAT) javascripts/nokia/device.js >> $@
	$(CAT) javascripts/nokia/accelerometer.js >> $@
	$(CAT) javascripts/nokia/camera.js >> $@
