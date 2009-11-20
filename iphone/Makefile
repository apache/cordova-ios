SHELL = /bin/sh
CHMOD = chmod
CP = cp
MV = mv
NOOP = $(SHELL) -c true
RM_F = rm -f
RM_IR = rm -ir
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
PG_JS_CORE = javascripts/core

all :: installer

clean :: clean_libs

clean_libs:
	-$(RM_RF) lib

lib/iphone/phonegap-min.js: lib/phonegap.js
	$(JAVA) -jar util/yuicompressor-2.4.2.jar --charset UTF-8 -o $@ lib/iphone/phonegap.js

lib/phonegap.js: $(PG_JS_CORE)/phonegap.js.base $(PG_JS_CORE)/acceleration.js $(PG_JS_CORE)/accelerometer.js $(PG_JS_CORE)/camera.js $(PG_JS_CORE)/contact.js $(PG_JS_CORE)/debugconsole.js $(PG_JS_CORE)/device.js $(PG_JS_CORE)/file.js $(PG_JS_CORE)/geolocation.js $(PG_JS_CORE)/compass.js $(PG_JS_CORE)/map.js $(PG_JS_CORE)/media.js $(PG_JS_CORE)/notification.js $(PG_JS_CORE)/orientation.js $(PG_JS_CORE)/position.js $(PG_JS_CORE)/sms.js $(PG_JS_CORE)/telephony.js $(PG_JS_CORE)/uicontrols.js $(PG_JS_CORE)/network.js
	$(RM_RF) lib
	$(MKPATH) lib
	$(RM_F) $@
	$(CAT) $(PG_JS_CORE)/phonegap.js.base >> $@
	$(CAT) $(PG_JS_CORE)/acceleration.js >> $@
	$(CAT) $(PG_JS_CORE)/accelerometer.js >> $@
	$(CAT) $(PG_JS_CORE)/camera.js >> $@
	$(CAT) $(PG_JS_CORE)/contact.js >> $@
	$(CAT) $(PG_JS_CORE)/debugconsole.js >> $@
	$(CAT) $(PG_JS_CORE)/device.js >> $@
	$(CAT) $(PG_JS_CORE)/file.js >> $@
	$(CAT) $(PG_JS_CORE)/geolocation.js >> $@
	$(CAT) $(PG_JS_CORE)/compass.js >> $@
	$(CAT) $(PG_JS_CORE)/map.js >> $@
	$(CAT) $(PG_JS_CORE)/media.js >> $@
	$(CAT) $(PG_JS_CORE)/notification.js >> $@
	$(CAT) $(PG_JS_CORE)/orientation.js >> $@
	$(CAT) $(PG_JS_CORE)/position.js >> $@
	$(CAT) $(PG_JS_CORE)/sms.js >> $@
	$(CAT) $(PG_JS_CORE)/telephony.js >> $@
	$(CAT) $(PG_JS_CORE)/uicontrols.js >> $@
	$(CAT) $(PG_JS_CORE)/network.js >> $@
	$(CP) $@ PhoneGapLib/javascripts/phonegap.js
	
phonegap-js-core: clean_libs lib/phonegap.js
	
installer: phonegap-js-core
	$(PACKAGEMAKER) -d PhoneGapLibInstaller/PhoneGapLibInstaller.pmdoc -o PhoneGapLibInstaller.pkg

uninstall:
	$(RM_RF) ~/Library/Application Support/Developer/Shared/Xcode/Project Templates/PhoneGap
	$(RM_IR) ~/Documents/PhoneGapLib
	
