#
# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
# 
# http://www.apache.org/licenses/LICENSE-2.0
# 
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
#  KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.
#

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
CDV_JS_CORE = javascripts/core
CDV_VER = $(shell head -1 VERSION)

all :: javascripts/cordova-$(CDV_VER).js

javascripts/cordova-$(CDV_VER).js: clean $(CDV_JS_CORE)/license.js $(CDV_JS_CORE)/cordova.js.base $(CDV_JS_CORE)/acceleration.js $(CDV_JS_CORE)/accelerometer.js $(CDV_JS_CORE)/battery.js $(CDV_JS_CORE)/camera.js $(CDV_JS_CORE)/capture.js $(CDV_JS_CORE)/contact.js $(CDV_JS_CORE)/debugconsole.js $(CDV_JS_CORE)/device.js $(CDV_JS_CORE)/file.js $(CDV_JS_CORE)/filetransfer.js $(CDV_JS_CORE)/geolocation.js $(CDV_JS_CORE)/compass.js $(CDV_JS_CORE)/media.js $(CDV_JS_CORE)/notification.js $(CDV_JS_CORE)/orientation.js $(CDV_JS_CORE)/position.js $(CDV_JS_CORE)/sms.js $(CDV_JS_CORE)/telephony.js $(CDV_JS_CORE)/network.js $(CDV_JS_CORE)/splashscreen.js
	$(RM_F) $@
	$(CAT) $(CDV_JS_CORE)/license.js | sed 's/{VERSION}/$(CDV_VER)/' >> $@
	$(CAT) $(CDV_JS_CORE)/cordova.js.base >> $@
	$(CAT) $(CDV_JS_CORE)/debugconsole.js >> $@
	$(CAT) $(CDV_JS_CORE)/position.js >> $@
	$(CAT) $(CDV_JS_CORE)/acceleration.js >> $@
	$(CAT) $(CDV_JS_CORE)/accelerometer.js >> $@
	$(CAT) $(CDV_JS_CORE)/battery.js >> $@
	$(CAT) $(CDV_JS_CORE)/camera.js >> $@
	$(CAT) $(CDV_JS_CORE)/device.js >> $@
	$(CAT) $(CDV_JS_CORE)/capture.js >> $@
	$(CAT) $(CDV_JS_CORE)/contact.js >> $@
	$(CAT) $(CDV_JS_CORE)/file.js >> $@
	$(CAT) $(CDV_JS_CORE)/filetransfer.js >> $@
	$(CAT) $(CDV_JS_CORE)/geolocation.js >> $@
	$(CAT) $(CDV_JS_CORE)/compass.js >> $@
	$(CAT) $(CDV_JS_CORE)/media.js >> $@
	$(CAT) $(CDV_JS_CORE)/notification.js >> $@
	$(CAT) $(CDV_JS_CORE)/orientation.js >> $@
	$(CAT) $(CDV_JS_CORE)/sms.js >> $@
	$(CAT) $(CDV_JS_CORE)/telephony.js >> $@
	$(CAT) $(CDV_JS_CORE)/network.js >> $@
	$(CAT) $(CDV_JS_CORE)/splashscreen.js >> $@
	
clean:
	$(RM_F) javascripts/cordova-*.js