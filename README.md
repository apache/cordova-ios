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

# Cordova iOS

[![NPM](https://nodei.co/npm/cordova-ios.png)](https://nodei.co/npm/cordova-ios/)

[![Node CI](https://github.com/apache/cordova-ios/workflows/Node%20CI/badge.svg?branch=master)](https://github.com/apache/cordova-ios/actions?query=branch%3Amaster)
[![codecov.io](https://codecov.io/github/apache/cordova-ios/coverage.svg?branch=master)](https://codecov.io/github/apache/cordova-ios?branch=master)

Cordova iOS is an iOS application library that allows for Cordova-based projects to be built for the iOS Platform. Cordova based applications are, at the core, applications written with web technology: HTML, CSS and JavaScript.

[Apache Cordova](https://cordova.apache.org/) is a project of [The Apache Software Foundation (ASF)](https://apache.org/).

## Requirements

* Xcode 15.x or greater. Download it at the [Apple Developer - Downloads](https://developer.apple.com/downloads) or the [Mac App Store](https://apps.apple.com/us/app/xcode/id497799835?mt=12).
* [Node.js](https://nodejs.org) 20.5.0 or greater

## Create a Cordova project

Follow the instructions in the [**Create your first Cordova app**](https://cordova.apache.org/docs/en/latest/guide/cli/index.html) section of [Apache Cordova Docs](https://cordova.apache.org/docs/en/latest/)

To use a **shared CordovaLib**, for example in development, link the appropriate cordova-ios platform folder path:

```bash
cordova platform add --link /path/to/cordova-ios
```

## Updating a Cordova project

When you install a new version of the [`Cordova CLI`](https://www.npmjs.com/package/cordova) that pins a new version of the [`Cordova-iOS`](https://www.npmjs.com/package/cordova-ios) platform, you can follow these simple upgrade steps within your project:

```bash
cordova platform rm ios
cordova platform add ios
```

## Debugging in Xcode

Import project in Xcode through _File > Open_ and targeting `/path/to/your-cdv-project/platforms/ios/App.xcworkspace`.

## How to Test Repo Development

```bash
npm install
npm test
```

## Install Nightly Build

```bash
cordova platform add ios@nightly
```

### Notes

Nightly builds are **not recommended for production apps**. They are intended for testing purposes. This allows users either to check if recent changes in the main branch have fixed existing issues or to identify new bugs before an official release.

Nightly builds are generated daily and may be **unstable**.


See [Apache Cordova - Nightly Builds](https://cordova.apache.org/contribute/nightly_builds.html) for more details.

## Further reading

* [Apache Cordova](https://cordova.apache.org/)
* [Cordova iOS API Documentation](https://apache.github.io/cordova-ios/)
