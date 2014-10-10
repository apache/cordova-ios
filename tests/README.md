# Tests for cordova-ios

You need to install `node.js` to run npm test


# Testing from Xcode

1. Launch the `cordova-ios.xcworkspace` file.
2. Choose "CordovaLibTests" from the scheme drop-down menu
3. Click and hold on the `Play` button, and choose the `Wrench` icon to run the tests


# Testing from the command line

    npm test

OR

    killall 'iOS Simulator' && xcodebuild test -scheme CordovaLibTests -destination 'platform=iOS Simulator,name=iPhone 5'
