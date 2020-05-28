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

* Xcode 11.x or greater. Download it at the [Apple Developer - Downloads](https://developer.apple.com/downloads) or the [Mac App Store](https://apps.apple.com/us/app/xcode/id497799835?mt=12).
* [Node.js](https://nodejs.org)

## Create a Cordova project

Follow the instructions in the [**Command-Line Usage** section](https://cordova.apache.org/docs/en/edge/guide_cli_index.md.html#The%20Command-line%20Interface) of [Apache Cordova Docs](https://cordova.apache.org/docs/en/latest/)

To use a **shared CordovaLib**, for example in development, link the appropriate cordova-ios platform folder path:

```bash
cordova platform add --link /path/to/cordova-ios
```

## Updating a Cordova project

When you install a new `cordova-cli` version that comes with a new iOS platform version, from within your project:

```bash
cordova platform rm ios
cordova platform add ios
```

## How to Test Repo Development

```bash
npm install
npm test
```

## Futher reading

* [https://cordova.apache.org/](https://cordova.apache.org/)
