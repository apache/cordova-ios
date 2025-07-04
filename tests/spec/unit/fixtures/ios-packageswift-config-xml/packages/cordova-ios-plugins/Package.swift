// swift-tools-version:5.5

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

import PackageDescription

let package = Package(
    name: "CordovaPlugins",
    platforms: [
        .iOS(.v13),
        .macCatalyst(.v13)
    ],
    products: [
        .library(name: "CordovaPlugins", targets: ["CordovaPlugins"])
    ],
    targets: [
        .target(name: "CordovaPlugins")
    ]
)


package.dependencies.append(.package(name: "org.test.plugins.swiftpackagecocoapodplugin", path: "../org.test.plugins.swiftpackagecocoapodplugin"))
package.targets.first?.dependencies.append(.product(name: "org.test.plugins.swiftpackagecocoapodplugin", package: "org.test.plugins.swiftpackagecocoapodplugin"))
