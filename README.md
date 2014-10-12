<!--
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
-->

[![Build Status](https://travis-ci.org/apache/cordova-ios.svg)](https://travis-ci.org/apache/cordova-ios)

Cordova iOS
=============================================================
Cordova iOS is an iOS application library that allows for Cordova-based projects to be built for the iOS Platform. Cordova based applications are, at the core, applications written with web technology: HTML, CSS and JavaScript.

<a href="http://cordova.apache.org">Apache Cordova</a> is a project of <a href="http://apache.org">The Apache Software Foundation (ASF)</a>.

Requires:

* Xcode 5.x or greater. Download it at [http://developer.apple.com/downloads](http://developer.apple.com/downloads) or the [Mac App Store](http://itunes.apple.com/us/app/xcode/id497799835?mt=12).
<br />


Create a Cordova project
-------------------------------------------------------------

1. Launch **Terminal.app**
2. Go to the location where you installed Cordova, in the **bin** sub-folder
3. Follow the instructions in the [**Command-Line Usage** section](http://cordova.apache.org/docs/en/edge/guide_cli_index.md.html#The%20Command-line%20Interface) of [http://docs.cordova.io](http://docs.cordova.io)

To use a **shared CordovaLib**, add as the first parameter "**--shared**" to the **bin/create** command.
<br />

Updating a CordovaLib subproject reference in your project
-------------------------------------------------------------

When you update to a new Cordova version, you may need to update the CordovaLib reference in an existing project. Cordova comes with a script that will help you to do this. 

1. Launch **Terminal.app**
2. Go to the location where you installed Cordova, in the **bin** sub-folder
3. Run **"update_cordova_subproject [path/to/your/project/xcodeproj]"**  where the first parameter is the path to your project's .xcodeproj file

By default when you create a new project, the CordovaLib sub-project is copied into your project folder, it is not shared.
<br />

Tests
--------------------------------------------------------------------

1. Install [node.js](http://nodejs.org)
2. Run `npm install`
3. Run `npm test`

Futher reading
-----
* [http://cordova.apache.org/](http://cordova.apache.org/)
* [http://wiki.apache.org/cordova/](http://wiki.apache.org/cordova/)

<br />
