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

import XCTest
import WebKit
import Cordova
@testable import CordovaApp

class ScriptHandlingViewController: ViewController, WKScriptMessageHandler {
    var expectation: XCTestExpectation? = nil

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        if let expectation = self.expectation {
            expectation.fulfill()
        }

        if let webView = self.webViewEngine.engineWebView as? WKWebView,
           let scriptMessageHandler = self.webViewEngine as? WKScriptMessageHandler {
            scriptMessageHandler.userContentController(webView.configuration.userContentController, didReceive:message)
        }
    }
}

class CDVWebViewEngineTests: XCTestCase {
    @MainActor func testViewControllerScriptMessageHandler() {
        let vc = ScriptHandlingViewController()
        vc.webContentFolderName = "www"
        vc.startPage = "index.html"
        vc.expectation = expectation(description: "Script Handler expectation")

        let appDelegate = UIApplication.shared.delegate as! AppDelegate
        appDelegate.testWindow?.rootViewController = vc
        appDelegate.testWindow?.makeKeyAndVisible()

        waitForExpectations(timeout: 10.0, handler: nil)

        appDelegate.testWindow?.rootViewController = UIViewController()
    }
}
