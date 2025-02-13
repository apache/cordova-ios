// swift-tools-version: 5.9
// The swift-tools-version declares the minimum version of Swift required to build this package.

import PackageDescription

let package = Package(
    name: "Cordova",
    platforms: [
        .iOS(.v13)
    ],
    products: [
        // Products define the executables and libraries a package produces, making them visible to other packages.
        .library(name: "Cordova", targets: ["Cordova"])
    ],
    dependencies: [],
    targets: [
        // Targets are the basic building blocks of a package, defining a module or a test suite.
        // Targets can depend on other targets in this package and products from dependencies.
        .target(
            name: "Cordova",
            path: "CordovaLib/",
            exclude: ["Cordova/Info.plist"],
            sources:["Classes"],
            publicHeadersPath: "include/Cordova",
            cSettings: [
                .headerSearchPath("Cordova"),
                .headerSearchPath("Classes/Public"),
                .headerSearchPath("Classes/Private"),
//                .headerSearchPath("Classes/Private/Plugins/CDVGestureHandler"),
//                .headerSearchPath("Classes/Private/Plugins/CDVHandleOpenURL"),
//                .headerSearchPath("Classes/Private/Plugins/CDVIntentAndNavigationFilter"),
//                .headerSearchPath("Classes/Private/Plugins/CDVLaunchScreen"),
//                .headerSearchPath("Classes/Private/Plugins/CDVLogger"),
                .headerSearchPath("Classes/Private/Plugins/CDVWebViewEngine/")
            ]
        )
    ]
)
