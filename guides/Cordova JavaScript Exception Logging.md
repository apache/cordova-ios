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
# Cordova JavaScript Exception Logging #

In Cordova, adding a few files to your project will enable you to effectively log JavaScript errors to your console at a lower level, without using JavaScript code (window.onerror, console.log).

NOTE: when you include these files, it will **always pop up a warning dialog at startup**, to remind you that you have these classes included. This is to prevent you from inadvertently shipping this code for the App Store, where this code is not allowed (it uses a private interface).

1. Install **Cordova**
2. In your app, add the whole **debugview** folder from  **~/Documents/CordovaLib/Classes/debugview** (where ~ signifies your Home folder). Make sure you select the radiobutton - **"Create groups for any added folders"**
3. In your app's **MainViewController.m**, uncomment/add this code:

        - (CDVCordovaView*) newCordovaViewWithFrame:(CGRect)bounds
        {
            return [[CDVDebugWebView alloc] initWithFrame:bounds];
        }
        
4. Don't forget to add the import at the top of your **MainViewController.m** file as well:

        #import "CDVDebugWebView.h"
5. For newer versions, you may also need to add **-fno-objc-arc** to **CDVDebugWebView.m** build flags (in xcode, select the CordovaLib project, CordovaLib target, build phases tab, compile sources list, find CDVDebugWebView.m and add the flag).

 



