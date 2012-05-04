#!/bin/bash

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


# iPhone OS Device SDKs:
# 	Device - iPhone OS 2.2.1      	-sdk iphoneos2.2.1
# 	Device - iPhone OS 3.0        	-sdk iphoneos3.0
# 	Device - iPhone OS 3.1        	-sdk iphoneos3.1
# 
# iPhone OS Simulator SDKs:
# 	Simulator - iPhone OS 2.2.1   	-sdk iphonesimulator2.2.1
# 	Simulator - iPhone OS 3.0     	-sdk iphonesimulator3.0
# 	Simulator - iPhone OS 3.1     	-sdk iphonesimulator3.1
# 
# run 'xcodebuild -showsdks' to show the valid sdks on the system

current_sdk_version=3.0
xcodebuild="/usr/bin/xcodebuild"

# check whether the xcodebuild command exists
if [ ! -f $xcodebuild ]; then
	echo "$xcodebuild not found."
	exit
fi

# check whether it is a proper build command (at least two arguments, configuration and xcode_proj_folder)
if [ $# -lt 2 ]; then
  echo "Usage: $0 <configuration> [target] <xcode_proj_folder>"
  echo "	<configuration>: typically 'debug' or 'release'"
  echo "	[target]: either 'device' or 'emulator' (optional)"
  echo "	<xcode_proj_folder>: the path to the folder containing your Xcode project file"
  exit
fi

# First argument is the build configuration
configuration="$1"

# Second argument may be the emulator/device parameter if available (thus 3rd argument is the xcode project path). 
# If not, it will be the path to folder containing the xcode project path
sdk=""
xcodeproj_folder=""
archs="armv6 armv7"

if [ $2 == "emulator" ]; then
	sdk="-sdk iphonesimulator$current_sdk_version" 
	xcodeproj_folder=$3
	archs="i386"
elif [ $2 == "device" ]; then
	sdk="-sdk iphoneos$current_sdk_version" 
	xcodeproj_folder=$3
else
	xcodeproj_folder=$2	
fi

# the next lines will title-case the configuration value
configuration_len=${#configuration}
non_first_letter_substring="`echo ${configuration:1:configuration_len-1}|tr '[A-Z]' '[a-z]'`"
first_letter="`echo ${configuration:0:1}|tr '[a-z]' '[A-Z]'`"
configuration=$first_letter$non_first_letter_substring

# Check whether the xcode project path exists
if [ ! -d $xcodeproj_folder ]; then
	echo "Path to Xcode folder '$xcodeproj_folder' not found."
	exit
fi

echo 'Cordova: building...'

# change to the project directory, and run the build
cd $xcodeproj_folder
echo $xcodebuild -alltargets -configuration $configuration $sdk
$xcodebuild -alltargets -configuration $configuration $sdk VALID_ARCHS="$archs"

echo 'Cordova: build done.'