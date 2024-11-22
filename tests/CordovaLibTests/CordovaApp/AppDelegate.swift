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

import UIKit
import Cordova

@main
@objc class AppDelegate : CDVAppDelegate {
    fileprivate var _window : UIWindow?
    fileprivate var _viewController : ViewController?

    @objc public var testViewController : CDVViewController? {
        return _viewController
    }

    @objc func createViewController() {
        _viewController = ViewController();
        _viewController?.webContentFolderName = "www";
        _viewController?.startPage = "index.html";

        _window?.rootViewController = _viewController;
        _window?.makeKeyAndVisible();
    }

    @objc func destroyViewController() {
        _viewController = nil
    }

    override func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil) -> Bool {
        let retVal = super.application(application, didFinishLaunchingWithOptions:launchOptions);

        let bounds = UIScreen.main.bounds;
        _window = UIWindow(frame: bounds);
        _window?.autoresizesSubviews = true;

        if NSClassFromString("CDVWebViewTest") != nil {
            createViewController();
        }

        return retVal;
    }
}
