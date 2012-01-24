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
PG_JS_CORE = javascripts/core
pgver = $(shell head -1 VERSION)

all :: javascripts/phonegap-$(pgver).js

javascripts/phonegap-$(pgver).js: clean $(PG_JS_CORE)/license.js $(PG_JS_CORE)/phonegap.js.base $(PG_JS_CORE)/acceleration.js $(PG_JS_CORE)/accelerometer.js $(PG_JS_CORE)/battery.js $(PG_JS_CORE)/camera.js $(PG_JS_CORE)/capture.js $(PG_JS_CORE)/contact.js $(PG_JS_CORE)/debugconsole.js $(PG_JS_CORE)/device.js $(PG_JS_CORE)/file.js $(PG_JS_CORE)/filetransfer.js $(PG_JS_CORE)/geolocation.js $(PG_JS_CORE)/compass.js $(PG_JS_CORE)/media.js $(PG_JS_CORE)/notification.js $(PG_JS_CORE)/orientation.js $(PG_JS_CORE)/position.js $(PG_JS_CORE)/sms.js $(PG_JS_CORE)/telephony.js $(PG_JS_CORE)/network.js $(PG_JS_CORE)/splashscreen.js
	$(RM_F) $@
	$(CAT) $(PG_JS_CORE)/license.js | sed 's/{VERSION}/$(pgver)/' >> $@
	$(CAT) $(PG_JS_CORE)/phonegap.js.base >> $@
	$(CAT) $(PG_JS_CORE)/debugconsole.js >> $@
	$(CAT) $(PG_JS_CORE)/position.js >> $@
	$(CAT) $(PG_JS_CORE)/acceleration.js >> $@
	$(CAT) $(PG_JS_CORE)/accelerometer.js >> $@
	$(CAT) $(PG_JS_CORE)/battery.js >> $@
	$(CAT) $(PG_JS_CORE)/camera.js >> $@
	$(CAT) $(PG_JS_CORE)/device.js >> $@
	$(CAT) $(PG_JS_CORE)/capture.js >> $@
	$(CAT) $(PG_JS_CORE)/contact.js >> $@
	$(CAT) $(PG_JS_CORE)/file.js >> $@
	$(CAT) $(PG_JS_CORE)/filetransfer.js >> $@
	$(CAT) $(PG_JS_CORE)/geolocation.js >> $@
	$(CAT) $(PG_JS_CORE)/compass.js >> $@
	$(CAT) $(PG_JS_CORE)/media.js >> $@
	$(CAT) $(PG_JS_CORE)/notification.js >> $@
	$(CAT) $(PG_JS_CORE)/orientation.js >> $@
	$(CAT) $(PG_JS_CORE)/sms.js >> $@
	$(CAT) $(PG_JS_CORE)/telephony.js >> $@
	$(CAT) $(PG_JS_CORE)/network.js >> $@
	$(CAT) $(PG_JS_CORE)/splashscreen.js >> $@
	
clean:
	$(RM_F) javascripts/phonegap-*.js