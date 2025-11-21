/**
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

const fs = require('node:fs');
const path = require('node:path');
const simctl = require('simctl');
const { events } = require('cordova-common');
const simctlHelper = require('../../lib/simctlHelper');

let json;
let emitSpy;

function fixtureJson (output) {
    const file = path.resolve(__dirname, `fixtures/${output}`);
    return JSON.parse(fs.readFileSync(file, { encoding: 'utf-8' }).toString());
}

describe('simctlHelper', () => {
    beforeEach(() => {
        emitSpy = spyOn(events, 'emit');
    });

    describe('fetchSimCtlList', () => {
        beforeEach(() => {
            json = fixtureJson('simctl-list.json');
            spyOn(simctl, 'list').and.callFake(() => ({ json }));
        });

        it('should fetch list of simulators', () => {
            const results = simctlHelper.fetchSimCtlList();
            expect(simctl.list).toHaveBeenCalled();
            expect(results).toEqual(json);
        });
    });

    describe('filterDeviceName', () => {
        beforeEach(() => {
            json = fixtureJson('simctl-list.json');
            spyOn(simctl, 'list').and.callFake(() => ({ json }));
        });

        it('should remove hypens from iPad Pro device names', () => {
            const results = simctlHelper.filterDeviceName('iPad Pro 13-inch (M4) (16GB)');
            expect(results).toEqual('iPad Pro 13 inch (M4) (16GB)');
        });

        it('should replace ʀ in iPhone Xʀ with an R in device names', () => {
            const results = simctlHelper.filterDeviceName('iPhone Xʀ');
            expect(results).toEqual('iPhone XR');
        });
    });

    describe('findRuntimesGroupByDeviceProperty', () => {
        beforeEach(() => {
            json = fixtureJson('simctl-list.json');
            spyOn(simctl, 'list').and.callFake(() => ({ json }));
        });

        it('should find runtimes and group by device name in lowercase format', () => {
            const results = simctlHelper.findRuntimesGroupByDeviceProperty(json, 'name', true, { lowerCase: true });
            const expected = {
                'apple tv': [
                    'tvOS 12.1'
                ],
                'apple tv 4k': [
                    'tvOS 12.1'
                ],
                'apple tv 4k (at 1080p)': [
                    'tvOS 12.1'
                ],
                'apple watch series 2 - 38mm': [
                    'watchOS 5.1'
                ],
                'apple watch series 2 - 42mm': [
                    'watchOS 5.1'
                ],
                'apple watch series 3 - 38mm': [
                    'watchOS 5.1'
                ],
                'apple watch series 3 - 42mm': [
                    'watchOS 5.1'
                ],
                'apple watch series 4 - 40mm': [
                    'watchOS 5.1'
                ],
                'apple watch series 4 - 44mm': [
                    'watchOS 5.1'
                ],
                'apple watch - 38mm': [],
                'apple watch - 42mm': [],
                'iphone 5': [
                    'iOS 10.3',
                    'iOS 9.3'
                ],
                'iphone 5s': [
                    'iOS 10.3',
                    'iOS 12.1',
                    'iOS 9.3',
                    'iOS 11.4'
                ],
                'iphone 6': [
                    'iOS 10.3',
                    'iOS 12.1',
                    'iOS 9.3',
                    'iOS 11.4'
                ],
                'iphone 6 plus': [
                    'iOS 10.3',
                    'iOS 12.1',
                    'iOS 9.3',
                    'iOS 11.4'
                ],
                'iphone 6s': [
                    'iOS 10.3',
                    'iOS 12.1',
                    'iOS 9.3',
                    'iOS 11.4'
                ],
                'iphone 6s plus': [
                    'iOS 10.3',
                    'iOS 12.1',
                    'iOS 9.3',
                    'iOS 11.4'
                ],
                'iphone 7': [
                    'iOS 10.3',
                    'iOS 12.1',
                    'iOS 11.4'
                ],
                'iphone 7 plus': [
                    'iOS 10.3',
                    'iOS 12.1',
                    'iOS 11.4'
                ],
                'iphone se': [
                    'iOS 10.3',
                    'iOS 12.1',
                    'iOS 11.4'
                ],
                'ipad air': [
                    'iOS 10.3',
                    'iOS 12.1',
                    'iOS 9.3',
                    'iOS 11.4'
                ],
                'ipad air 2': [
                    'iOS 10.3',
                    'iOS 12.1',
                    'iOS 9.3',
                    'iOS 11.4'
                ],
                'ipad (5th generation)': [
                    'iOS 10.3',
                    'iOS 12.1',
                    'iOS 11.4'
                ],
                'ipad pro (9.7 inch)': [
                    'iOS 10.3'
                ],
                'ipad pro (12.9 inch)': [
                    'iOS 10.3'
                ],
                'ipad pro (12.9-inch) (2nd generation)': [
                    'iOS 10.3',
                    'iOS 12.1',
                    'iOS 11.4'
                ],
                'ipad pro (10.5-inch)': [
                    'iOS 10.3',
                    'iOS 12.1',
                    'iOS 11.4'
                ],
                'ipad retina': [
                    'iOS 9.3'
                ],
                'iphone 8': [
                    'iOS 12.1',
                    'iOS 11.4'
                ],
                'iphone 8 plus': [
                    'iOS 12.1',
                    'iOS 11.4'
                ],
                'iphone x': [
                    'iOS 12.1',
                    'iOS 11.4'
                ],
                'ipad pro (9.7-inch)': [
                    'iOS 12.1',
                    'iOS 11.4'
                ],
                'ipad pro (12.9-inch)': [
                    'iOS 12.1',
                    'iOS 11.4'
                ],
                'ipad (6th generation)': [
                    'iOS 12.1'
                ],
                'apple tv 1080p': [],
                'iphone xs': [
                    'iOS 12.1'
                ],
                'iphone xs max': [
                    'iOS 12.1'
                ],
                'iphone xr': [
                    'iOS 12.1'
                ],
                'ipad pro (11-inch)': [
                    'iOS 12.1'
                ],
                'ipad pro (12.9-inch) (3rd generation)': [
                    'iOS 12.1'
                ],
                'iphone 4s': [
                    'iOS 9.3'
                ],
                'ipad 2': [
                    'iOS 9.3'
                ],
                'ipad pro': [
                    'iOS 9.3'
                ]
            };
            expect(results).toEqual(expected);
        });

        it('should find runtimes and group by device name', () => {
            const results = simctlHelper.findRuntimesGroupByDeviceProperty(json, 'name', true, { lowerCase: false });
            const expected = {
                'Apple TV': [
                    'tvOS 12.1'
                ],
                'Apple TV 4K': [
                    'tvOS 12.1'
                ],
                'Apple TV 4K (at 1080p)': [
                    'tvOS 12.1'
                ],
                'Apple Watch Series 2 - 38mm': [
                    'watchOS 5.1'
                ],
                'Apple Watch Series 2 - 42mm': [
                    'watchOS 5.1'
                ],
                'Apple Watch Series 3 - 38mm': [
                    'watchOS 5.1'
                ],
                'Apple Watch Series 3 - 42mm': [
                    'watchOS 5.1'
                ],
                'Apple Watch Series 4 - 40mm': [
                    'watchOS 5.1'
                ],
                'Apple Watch Series 4 - 44mm': [
                    'watchOS 5.1'
                ],
                'Apple Watch - 38mm': [],
                'Apple Watch - 42mm': [],
                'iPhone 5': [
                    'iOS 10.3',
                    'iOS 9.3'
                ],
                'iPhone 5s': [
                    'iOS 10.3',
                    'iOS 12.1',
                    'iOS 9.3',
                    'iOS 11.4'
                ],
                'iPhone 6': [
                    'iOS 10.3',
                    'iOS 12.1',
                    'iOS 9.3',
                    'iOS 11.4'
                ],
                'iPhone 6 Plus': [
                    'iOS 10.3',
                    'iOS 12.1',
                    'iOS 9.3',
                    'iOS 11.4'
                ],
                'iPhone 6s': [
                    'iOS 10.3',
                    'iOS 12.1',
                    'iOS 9.3',
                    'iOS 11.4'
                ],
                'iPhone 6s Plus': [
                    'iOS 10.3',
                    'iOS 12.1',
                    'iOS 9.3',
                    'iOS 11.4'
                ],
                'iPhone 7': [
                    'iOS 10.3',
                    'iOS 12.1',
                    'iOS 11.4'
                ],
                'iPhone 7 Plus': [
                    'iOS 10.3',
                    'iOS 12.1',
                    'iOS 11.4'
                ],
                'iPhone SE': [
                    'iOS 10.3',
                    'iOS 12.1',
                    'iOS 11.4'
                ],
                'iPad Air': [
                    'iOS 10.3',
                    'iOS 12.1',
                    'iOS 9.3',
                    'iOS 11.4'
                ],
                'iPad Air 2': [
                    'iOS 10.3',
                    'iOS 12.1',
                    'iOS 9.3',
                    'iOS 11.4'
                ],
                'iPad (5th generation)': [
                    'iOS 10.3',
                    'iOS 12.1',
                    'iOS 11.4'
                ],
                'iPad Pro (9.7 inch)': [
                    'iOS 10.3'
                ],
                'iPad Pro (12.9 inch)': [
                    'iOS 10.3'
                ],
                'iPad Pro (12.9-inch) (2nd generation)': [
                    'iOS 10.3',
                    'iOS 12.1',
                    'iOS 11.4'
                ],
                'iPad Pro (10.5-inch)': [
                    'iOS 10.3',
                    'iOS 12.1',
                    'iOS 11.4'
                ],
                'iPad Retina': [
                    'iOS 9.3'
                ],
                'iPhone 8': [
                    'iOS 12.1',
                    'iOS 11.4'
                ],
                'iPhone 8 Plus': [
                    'iOS 12.1',
                    'iOS 11.4'
                ],
                'iPhone X': [
                    'iOS 12.1',
                    'iOS 11.4'
                ],
                'iPad Pro (9.7-inch)': [
                    'iOS 12.1',
                    'iOS 11.4'
                ],
                'iPad Pro (12.9-inch)': [
                    'iOS 12.1',
                    'iOS 11.4'
                ],
                'iPad (6th generation)': [
                    'iOS 12.1'
                ],
                'Apple TV 1080p': [],
                'iPhone XS': [
                    'iOS 12.1'
                ],
                'iPhone XS Max': [
                    'iOS 12.1'
                ],
                'iPhone XR': [
                    'iOS 12.1'
                ],
                'iPad Pro (11-inch)': [
                    'iOS 12.1'
                ],
                'iPad Pro (12.9-inch) (3rd generation)': [
                    'iOS 12.1'
                ],
                'iPhone 4s': [
                    'iOS 9.3'
                ],
                'iPad 2': [
                    'iOS 9.3'
                ],
                'iPad Pro': [
                    'iOS 9.3'
                ]
            };

            expect(results).toEqual(expected);
        });

        it('should find 43 groups of runtimes', () => {
            const runtimes = simctlHelper.findRuntimesGroupByDeviceProperty(json, 'name', false);
            expect(Object.keys(runtimes).length).toEqual(43);
        });
    });

    describe('getDeviceFromDeviceTypeId', () => {
        beforeEach(() => {
            json = fixtureJson('simctl-list.json');
            spyOn(simctl, 'list').and.callFake(() => ({ json }));
        });

        it('unknown device', () => {
            expect(() => simctlHelper.getDeviceFromDeviceTypeId('unknown-device'))
                .toThrowError('Device type "com.apple.CoreSimulator.SimDeviceType.unknown-device" could not be found.');
        });

        it('no device', () => {
            const device = simctlHelper.getDeviceFromDeviceTypeId();
            expect(device).toEqual({
                id: '0CB7F7A1-A837-4809-8951-B724D6496462',
                name: 'Apple Watch Series 2 - 38mm',
                runtime: 'watchOS 5.1'
            });
            expect(emitSpy).toHaveBeenCalledWith('warn', '--devicetypeid was not specified, using first available device: Apple Watch Series 2 - 38mm.');
        });

        it('known device, with runtime', () => {
            const device = simctlHelper.getDeviceFromDeviceTypeId('iPhone-X, 12.1');
            expect(device).toEqual({
                id: 'BAC3ADB2-66B2-41C0-AF0D-8D4D58E2E88A',
                name: 'iPhone X',
                runtime: 'iOS 12.1'
            });
        });

        it('known device, with runtime prefix', () => {
            const device = simctlHelper.getDeviceFromDeviceTypeId('iPhone-8, 11.3');
            expect(device).toEqual({
                id: '85D9D9AE-2749-4169-A3DB-94FC9C8EC8F4',
                name: 'iPhone 8',
                runtime: 'iOS 11.3'
            });
        });

        it('known device, no runtime', () => {
            const device = simctlHelper.getDeviceFromDeviceTypeId('com.apple.CoreSimulator.SimDeviceType.iPhone-X');
            expect(device).toEqual({
                id: 'BAC3ADB2-66B2-41C0-AF0D-8D4D58E2E88A',
                name: 'iPhone X',
                runtime: 'iOS 12.1'
            });
        });

        it('known device, unknown runtime', () => {
            expect(() => simctlHelper.getDeviceFromDeviceTypeId('iPhone-X, 4.1'))
                .toThrowError('Device id for device name "iPhone X" and runtime "iOS 4.1" could not be found, or is not available.');
        });

        // Not passing in a deviceTypeId will trigger the code to try and find findFirstAvailableDevice
        it('should find the first avaialbe device', () => {
            const expected = {
                id: '0CB7F7A1-A837-4809-8951-B724D6496462',
                name: 'Apple Watch Series 2 - 38mm',
                runtime: 'watchOS 5.1'
            };
            expect(simctlHelper.getDeviceFromDeviceTypeId()).toEqual(expected);
        });
    });

    describe('getDeviceFromDeviceTypeId (issue #262)', () => {
        beforeEach(() => {
            json = fixtureJson('simctl-list-issue-262.json');
            spyOn(simctl, 'list').and.callFake(() => ({ json }));
        });

        it('issue #262', () => {
            const expected = {
                id: '622B99AE-E57D-4435-B7C8-6A0151E68C68',
                name: 'iPhone 5',
                runtime: 'iOS 10.3'
            };
            expect(simctlHelper.getDeviceFromDeviceTypeId()).toEqual(expected);
        });
    });
});
