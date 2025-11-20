/*
 Licensed to the Apache Software Foundation (ASF) under one
 or more contributor license agreements.  See the NOTICE file
 distributed with this work for additional information
 regarding copyright ownership.  The ASF licenses this file
 to you under the Apache License, Version 2.0 (the
 "License"); you may not use this file except in compliance
 with the License.  You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing,
 software distributed under the License is distributed on an
 "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 KIND, either express or implied.  See the License for the
 specific language governing permissions and limitations
 under the License.
*/


/***********************************************
 This Swift file is intentionally commented out.

 The purpose of this plugin is to test the new `nospm="true"` attribute in the <pod> element of plugin.xml,
 which controls whether a CocoaPods library should be included when the plugin is installed as a Swift Package.

 While the plugin is structured as a Swift Package, it currently cannot function as a valid Cordova plugin 
 because the Cordova framework itself (specifically CDVPlugin and related classes) is not yet accessible 
 from within Swift Packages. Attempting to compile this file results in a build error due to the unresolved
 `import Cordova` statement.

 To allow testing of CocoaPods integration without triggering build failures related to Swift Package usage,
 the contents of this file are commented out.

 Once Cordova fully supports being used as a Swift Package dependency, this file can be uncommented 
 and used to implement plugin functionality.
***********************************************/

import Cordova

@objc(PackagePodPlugin)
class PackagePodPlugin : CDVPlugin {
    override func pluginInitialize() {
        NSLog("Initialized Swift Package Pod Plugin");
    }
}
