#!/bin/sh

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


if [ ! -d "$PROJECT_DIR/www" ] ; then
	cp -R /Users/Shared/Cordova/Frameworks/Cordova.framework/www "$PROJECT_DIR"
fi
# detect www folder reference in project, if missing, print warning
grep "{isa = PBXFileReference; lastKnownFileType = folder; path = www; sourceTree = \"<group>\"; };" "$PROJECT_DIR/$PROJECT_NAME.xcodeproj/project.pbxproj"
rc=$? 
if [ $rc != 0 ] ; then
echo -e "warning: Missing - Add $PROJECT_DIR/www as a folder reference in your project. Just drag and drop the folder into your project, into the Project Navigator of Xcode 4. Make sure you select the second radio-button: 'Create folder references for any added folders' (which will create a blue folder)" 1>&2
fi