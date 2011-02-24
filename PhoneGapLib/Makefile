SHELL = /bin/sh
CHMOD = chmod
CP = cp
MV = mv
NOOP = $(SHELL) -c true
RM_F = rm -f
RM_IR = rm -iR
RM_RF = rm -rf
TEST_F = test -f
TOUCH = touch
UMASK_NULL = umask 0
DEV_NULL = > /dev/null 2>&1
MKPATH = mkdir -p
CAT = cat
MAKE = make
OPEN = open
JAVA = java
ECHO = echo
ECHO_N = echo -n
PG_JS_CORE = javascripts/core
pgver = $(shell head -1 VERSION)

all :: phonegap.js-core

phonegap.js-core :: javascripts/phonegap.$(pgver).js
	$(JAVA) -jar util/yuicompressor/yuicompressor-2.4.2.jar --nomunge --charset UTF-8 -o javascripts/phonegap.$(pgver).min.js javascripts/phonegap.$(pgver).js

javascripts/phonegap.$(pgver).js: $(PG_JS_CORE)/license.js $(PG_JS_CORE)/phonegap.js.base $(PG_JS_CORE)/acceleration.js $(PG_JS_CORE)/accelerometer.js $(PG_JS_CORE)/camera.js $(PG_JS_CORE)/contact.js $(PG_JS_CORE)/debugconsole.js $(PG_JS_CORE)/device.js $(PG_JS_CORE)/file.js $(PG_JS_CORE)/geolocation.js $(PG_JS_CORE)/compass.js $(PG_JS_CORE)/media.js $(PG_JS_CORE)/notification.js $(PG_JS_CORE)/orientation.js $(PG_JS_CORE)/position.js $(PG_JS_CORE)/sms.js $(PG_JS_CORE)/telephony.js $(PG_JS_CORE)/network.js $(PG_JS_CORE)/GetFunctionName.js
	$(RM_F) $@
	$(CAT) $(PG_JS_CORE)/license.js >> $@
	$(CAT) $(PG_JS_CORE)/GetFunctionName.js >> $@
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
	$(CAT) $(PG_JS_CORE)/media.js >> $@
	$(CAT) $(PG_JS_CORE)/notification.js >> $@
	$(CAT) $(PG_JS_CORE)/orientation.js >> $@
	$(CAT) $(PG_JS_CORE)/position.js >> $@
	$(CAT) $(PG_JS_CORE)/sms.js >> $@
	$(CAT) $(PG_JS_CORE)/telephony.js >> $@
	$(CAT) $(PG_JS_CORE)/network.js >> $@
	
	