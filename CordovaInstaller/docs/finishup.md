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
## Thanks for installing Cordova {VERSION}!

## Plugins

* Plugins **MUST** add their plugin mapping to their app's Cordova.plist Plugins key, if not they will not work (see your plugin's README)
* Plugins **MUST** add any external hosts they connect to to the white-list in Cordova.plist/ExternalHosts (add hostnames **only**, NO protocols nor paths)
* A plugin's Objective-C code **MUST** be added to the project properly in a "group" (**YELLOW** folder), if you incorrectly added it as a folder reference it would be a blue folder (just delete the reference, and re-add)
* A lot of plugins have changed their mapping names in Cordova.plist, you might have to copy and use the new Cordova.plist in your app.

<br />

## Upgraders
	
1. Please see the "Cordova Upgrade Guide" included in the .dmg distribution, in the "Guides" sub-folder
2. See the FAQ in the README.pdf as well

<br />

## Xcode 4

1. Launch Xcode 4
2. Select "New Project..." then under the File menu
3. Select "Application", under the "iOS" section
4. Select "Cordova-based Application" then in the right pane
5. Select the "Next" button
6. Name your project and bundle identifier
7. Select the "Next" button
8. Choose the location where you want the new project to be

<br />

**IMPORTANT:** On first run, it will create a sample "www" folder for you inside your project. After that, you MUST drag and drop the "www" folder into your project in Xcode, to create a **folder reference** for it (**BLUE** folder).
<br />

**IMPORTANT:** For the "CoreMedia", "UIKit" and "AVFoundation" frameworks, you MUST set the linkage as "Optional", if not iOS 3.x devices will crash. The linkage type could not be set in the template itself (undocumented).
<br />

**NOTE:** In post-1.0.0 releases, new project templates have these 3 frameworks specified above weak linked through linker flags during compile time, and you will not have to do this manually anymore.
<br />

That's it! Modify the contents of the "www" directory to add your HTML, CSS and Javascript.
<br />

## Xcode 3

1. Launch Xcode 3
2. Select "New Project..." then under the File menu
3. Select Cordova, under the "User Templates" section
4. Select "Cordova-based Application" then in the right pane
5. Select the "Choose..." button
6. Name your project
7. Choose the location where you want the new project to be.

<br />

That's it! Modify the contents of the "www" directory to add your HTML, CSS and Javascript.

<br />

## Links

* [http://incubator.apache.org/cordova/](http://incubator.apache.org/cordova/)


<br />
