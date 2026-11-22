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

var exec = require('cordova/exec');

var statusBarVisible = true;
var statusBar = {};

// This <script> element is explicitly used by Cordova's statusbar for computing color. (Do not use this element)
const statusBarScript = document.createElement('script');
document.head.appendChild(statusBarScript);

/**
 * Gets or sets the visibility of the system status bar. Assign true to show it
 * or false to hide it.
 *
 * The getter returns the last value assigned in JavaScript (initially true).
 * If cordova-plugin-statusbar is installed, reads use window.StatusBar.isVisible
 * and writes call window.StatusBar.show() or window.StatusBar.hide().
 */
Object.defineProperty(statusBar, 'visible', {
    configurable: false,
    enumerable: true,
    get: function () {
        // If cordova-plugin-statusbar is installed fallback to it for compatibility reasons
        if (window.StatusBar) {
            return window.StatusBar.isVisible;
        }

        return statusBarVisible;
    },
    set: function (value) {
        // If cordova-plugin-statusbar is installed fallback to it for compatibility reasons
        if (window.StatusBar) {
            if (value) {
                window.StatusBar.show();
            } else {
                window.StatusBar.hide();
            }
        } else {
            statusBarVisible = value;
            exec(null, null, 'StatusBarInternal', 'setVisible', [!!value]);
        }
    }
});

/**
 * Sets the status bar background color. Accepts CSS colors that the web view
 * computes as rgb() or rgba(), such as rebeccapurple, #RRGGBBAA, or rgb(255 0 153).
 *
 * For page-level colors, prefer the <meta name="theme-color"> tag. Use this
 * method to explicitly override the status bar color at runtime.
 *
 * The built-in API supports alpha since cordova-ios 8.1.1. If
 * cordova-plugin-statusbar is installed, the call forwards an opaque #RRGGBB
 * color to window.StatusBar.backgroundColorByHexString().
 */
Object.defineProperty(statusBar, 'setBackgroundColor', {
    configurable: false,
    enumerable: false,
    writable: false,
    value: function (value) {
        statusBarScript.style.color = value;
        var rgbStr = window.getComputedStyle(statusBarScript).getPropertyValue('color');

        if (!rgbStr.match(/^rgb/)) {
            return;
        }

        var rgbVals = rgbStr.match(/[\d.]+/g).map(function (v, i) { return (i < 3) ? parseInt(v, 10) : parseFloat(v); });
        if (rgbVals.length < 3) {
            return;
        }

        // If cordova-plugin-statusbar is installed fallback to it for compatibility reasons
        if (window.StatusBar) {
            window.StatusBar.backgroundColorByHexString('#' + rgbVals[0].toString(16).padStart(2, '0') + rgbVals[1].toString(16).padStart(2, '0') + rgbVals[2].toString(16).padStart(2, '0'));
        } else {
            exec(null, null, 'StatusBarInternal', 'setBackgroundColor', rgbVals);
        }
    }
});

module.exports = statusBar;
