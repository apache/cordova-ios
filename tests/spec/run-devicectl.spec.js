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

const fs = require('node:fs');
const path = require('node:path');
const bplist = require('bplist-parser');
const plist = require('plist');
const devicectl = require('devicectl');
const { CordovaError, events } = require('cordova-common');
const build = require('../../lib/build');
const checkReqs = require('../../lib/check_reqs');
const projectFile = require('../../lib/projectFile');

const simctlHelper = require('../../lib/simctlHelper');
const target = '00008110-0000000000000001';
const legacyTarget = '000081100000000000000001';
const appPath = path.join('/test', 'project', 'build', 'Debug-iphoneos', 'Test.app');
const infoPath = path.join(appPath, 'Info.plist');
const bundleId = 'org.apache.cordova.test';

describe('cordova/lib/run devicectl deployment', () => {
    let run;
    let exec;
    let getDevice;
    let start;

    beforeAll(() => {
        // Load a separate instance with mocked subprocesses, then restore the cache.
        // Unlike rewire, this preserves source locations in V8 coverage reports.
        const runPath = require.resolve('../../lib/run');
        const execaModule = require.cache[require.resolve('execa')];
        const originalRun = require.cache[runPath];
        const originalExeca = execaModule.exports;
        const originalGetDevice = simctlHelper.getDeviceFromDeviceTypeId;
        const originalStart = simctlHelper.startSimulator;
        try {
            execaModule.exports = (...args) => exec(...args);
            simctlHelper.getDeviceFromDeviceTypeId = (...args) => getDevice(...args);
            simctlHelper.startSimulator = (...args) => start(...args);
            delete require.cache[runPath];
            run = require('../../lib/run');
        } finally {
            execaModule.exports = originalExeca;
            simctlHelper.getDeviceFromDeviceTypeId = originalGetDevice;
            simctlHelper.startSimulator = originalStart;
            if (originalRun) require.cache[runPath] = originalRun;
            else delete require.cache[runPath];
        }
    });

    beforeEach(() => {
        exec = jasmine.createSpy('execa').and.resolveTo({});
        spyOn(events, 'emit');
    });

    describe('target selection', () => {
        beforeEach(() => {
            run.root = path.join('/test', 'project');
            run.locations = { pbxproj: '/test/project/Test.xcodeproj/project.pbxproj' };
            spyOn(run, 'execListDevices').and.resolveTo([`${target} Test iPhone`]);
            spyOn(checkReqs, 'check_ios_deploy').and.resolveTo();
            spyOn(build, 'run').and.resolveTo();
            spyOn(projectFile, 'parse').and.returnValue({
                xcode: { getBuildProperty: () => 'Test' }
            });
            spyOn(run, 'checkDeviceConnected').and.resolveTo();
            spyOn(run, 'deployToDevice').and.resolveTo();
            spyOn(run, 'deployToSim').and.resolveTo();
            spyOn(fs, 'rmSync');
            spyOn(fs, 'renameSync');
        });

        it('selects the first device and deploys using its devicectl UDID', async () => {
            await run.run({ argv: ['node', 'run', '--device', '--nobuild', '--verbose'] });
            expect(checkReqs.check_ios_deploy).not.toHaveBeenCalled();
            expect(build.run).toHaveBeenCalledWith(jasmine.objectContaining({ device: true, target }));
            expect(run.checkDeviceConnected).toHaveBeenCalledWith(target);
            expect(exec).toHaveBeenCalledWith('unzip', ['-o', '-qq', path.join(path.dirname(appPath), 'Test.ipa')],
                { cwd: path.dirname(appPath), stdio: 'inherit' });
            expect(fs.renameSync).toHaveBeenCalledWith(path.join(path.dirname(appPath), 'Payload', 'Test.app'), appPath);
            expect(run.deployToDevice).toHaveBeenCalledWith(appPath, target, ['--verbose']);
        });

        it('checks ios-deploy for an automatically selected legacy target', async () => {
            run.execListDevices.and.resolveTo([`${legacyTarget} Old iPhone`]);
            await run.run({});
            expect(checkReqs.check_ios_deploy).toHaveBeenCalled();
            expect(run.deployToDevice).toHaveBeenCalledWith(appPath, legacyTarget, []);
        });

        it('preserves an explicit target instead of overwriting it with the first device', async () => {
            await run.run({ device: true, target: legacyTarget });
            expect(checkReqs.check_ios_deploy).toHaveBeenCalled();
            expect(run.checkDeviceConnected).toHaveBeenCalledWith(legacyTarget);
            expect(run.deployToDevice).toHaveBeenCalledWith(appPath, legacyTarget, []);
        });

        it('does not require ios-deploy for an explicit devicectl target', async () => {
            run.execListDevices.and.resolveTo([`${legacyTarget} Old iPhone`]);
            await run.run({ device: true, target });
            expect(checkReqs.check_ios_deploy).not.toHaveBeenCalled();
            expect(run.checkDeviceConnected).toHaveBeenCalledWith(target);
        });

        it('does not attempt deployment when the legacy tool requirement fails', async () => {
            run.execListDevices.and.resolveTo([`${legacyTarget} Old iPhone`]);
            checkReqs.check_ios_deploy.and.rejectWith(new Error('ios-deploy missing'));
            await expectAsync(run.run({})).toBeRejectedWithError('ios-deploy missing');
            expect(build.run).not.toHaveBeenCalled();
            expect(run.deployToDevice).not.toHaveBeenCalled();
        });

        it('retains simulator selection when no devices are found', async () => {
            run.execListDevices.and.resolveTo([]);
            await run.run({});
            expect(checkReqs.check_ios_deploy).not.toHaveBeenCalled();
            expect(run.deployToSim).toHaveBeenCalledWith(
                path.join(run.root, 'build', 'Debug-iphonesimulator', 'Test.app'), undefined);
        });

        it('retains the connection failure fallback without unpacking or installing', async () => {
            run.checkDeviceConnected.and.rejectWith(new Error('Disconnected'));
            await run.run({ device: true, target });
            expect(exec).not.toHaveBeenCalled();
            expect(run.deployToDevice).not.toHaveBeenCalled();
            expect(run.deployToSim).toHaveBeenCalledWith(appPath, target);
        });
    });

    describe('connection checks', () => {
        let info;
        beforeEach(() => {
            info = spyOn(devicectl, 'info');
        });

        it('accepts a wired devicectl device', async () => {
            info.and.returnValue({ json: { result: { connectionProperties: { transportType: 'wired' } } } });
            await expectAsync(run.checkDeviceConnected(target)).toBeResolved();
            expect(info).toHaveBeenCalledWith(devicectl.InfoTypes.Details, target);
            expect(exec).not.toHaveBeenCalled();
        });

        for (const result of [undefined, {}, { connectionProperties: {} }, { connectionProperties: { transportType: 'localNetwork' } }]) {
            it(`rejects a non-wired or unavailable device: ${JSON.stringify(result)}`, async () => {
                info.and.returnValue({ json: { result } });
                await expectAsync(run.checkDeviceConnected(target)).toBeRejectedWithError(
                    CordovaError, `Run destination device '${target}' is not connected.`);
                expect(exec).not.toHaveBeenCalled();
            });
        }

        it('rejects when devicectl returns no JSON', async () => {
            info.and.returnValue({});
            await expectAsync(run.checkDeviceConnected(target)).toBeRejectedWithError(CordovaError);
        });

        for (const device of [legacyTarget, undefined]) {
            it(`uses ios-deploy for ${device || 'an unspecified target'}`, async () => {
                await run.checkDeviceConnected(device);
                expect(exec).toHaveBeenCalledWith('ios-deploy', ['-c', '-t', '1'], { stdio: 'inherit' });
                expect(info).not.toHaveBeenCalled();
            });
        }
    });

    describe('install and launch', () => {
        let install;
        let launch;
        beforeEach(() => {
            install = spyOn(devicectl, 'install').and.returnValue({ status: 0 });
            launch = spyOn(devicectl, 'launch').and.returnValue({ status: 0 });
            spyOn(fs, 'existsSync').and.returnValue(true);
            spyOn(bplist, 'parseFile').and.callFake((file, callback) => callback(null, [{ CFBundleIdentifier: bundleId }]));
        });

        it('installs before launching with the bundle identifier and supplied arguments', async () => {
            const args = ['--verbose'];
            await run.deployToDevice(appPath, target, args);
            expect(install).toHaveBeenCalledWith(target, appPath, { stdio: 'inherit' });
            expect(bplist.parseFile).toHaveBeenCalledWith(infoPath, jasmine.any(Function));
            expect(launch).toHaveBeenCalledWith(target, bundleId, args, { stdio: 'inherit', console: true });
            expect(install).toHaveBeenCalledBefore(launch);
            expect(exec).not.toHaveBeenCalled();
        });

        it('defaults launch arguments to an empty array', async () => {
            await run.deployToDevice(appPath, target);
            expect(launch).toHaveBeenCalledWith(target, bundleId, [], { stdio: 'inherit', console: true });
        });

        it('reads an XML plist when binary parsing fails', async () => {
            bplist.parseFile.and.callFake((file, callback) => callback(new Error('Not binary')));
            spyOn(fs, 'readFileSync').and.returnValue(plist.build({ CFBundleIdentifier: bundleId }));
            await run.deployToDevice(appPath, target, []);
            expect(fs.readFileSync).toHaveBeenCalledWith(infoPath, 'utf8');
            expect(launch).toHaveBeenCalledWith(target, bundleId, [], jasmine.any(Object));
        });

        it('rejects a missing plist without launching', async () => {
            fs.existsSync.and.returnValue(false);
            await expectAsync(run.deployToDevice(appPath, target, [])).toBeRejectedWithError(`${infoPath} file not found.`);
            expect(launch).not.toHaveBeenCalled();
        });

        it('rejects XML parsing errors delivered by an asynchronous binary parser', async () => {
            const error = new Error('Invalid XML');
            bplist.parseFile.and.callFake((file, callback) => setImmediate(() => callback(new Error('Not binary'))));
            spyOn(fs, 'readFileSync').and.returnValue('invalid');
            spyOn(plist, 'parse').and.throwError(error);
            await expectAsync(run.deployToDevice(appPath, target, [])).toBeRejectedWith(error);
            expect(launch).not.toHaveBeenCalled();
        });

        it('rejects XML read errors without launching', async () => {
            const error = new Error('Cannot read plist');
            bplist.parseFile.and.callFake((file, callback) => setImmediate(() => callback(new Error('Not binary'))));
            spyOn(fs, 'readFileSync').and.throwError(error);
            await expectAsync(run.deployToDevice(appPath, target, [])).toBeRejectedWith(error);
            expect(launch).not.toHaveBeenCalled();
        });

        it('rejects the binary error when XML parsing yields no plist', async () => {
            const error = new Error('Not binary');
            bplist.parseFile.and.callFake((file, callback) => callback(error));
            spyOn(fs, 'readFileSync').and.returnValue('');
            spyOn(plist, 'parse').and.returnValue(null);
            await expectAsync(run.deployToDevice(appPath, target, [])).toBeRejectedWith(error);
            expect(launch).not.toHaveBeenCalled();
        });

        it('propagates a launch failure', async () => {
            launch.and.throwError('Launch failed');
            await expectAsync(run.deployToDevice(appPath, target, [])).toBeRejectedWithError('Launch failed');
        });

        it('propagates an install failure without launching', async () => {
            install.and.throwError('Install failed');
            await expectAsync(run.deployToDevice(appPath, target, [])).toBeRejectedWithError('Install failed');
            expect(launch).not.toHaveBeenCalled();
        });

        for (const status of [1, null]) {
            it(`rejects unsuccessful installation status ${status} without launching`, async () => {
                install.and.returnValue({ status });
                await expectAsync(run.deployToDevice(appPath, target, [])).toBeRejectedWithError(
                    CordovaError, `Failed to install app on device '${target}' (exit code ${status}).`);
                expect(launch).not.toHaveBeenCalled();
            });

            it(`rejects unsuccessful launch status ${status}`, async () => {
                launch.and.returnValue({ status });
                await expectAsync(run.deployToDevice(appPath, target, [])).toBeRejectedWithError(
                    CordovaError, `Failed to launch app on device '${target}' (exit code ${status}).`);
            });
        }

        for (const operation of ['install', 'launch']) {
            it(`wraps a ${operation} subprocess error in CordovaError with its cause`, async () => {
                const error = new Error('Subprocess failed');
                (operation === 'install' ? install : launch).and.returnValue({ error, status: null });
                const deployment = run.deployToDevice(appPath, target, []);
                await expectAsync(deployment).toBeRejectedWithError(CordovaError);
                await deployment.catch(wrappedError => {
                    expect(wrappedError.cause()).toBe(error);
                    expect(wrappedError.message).toContain(`Failed to ${operation} app on device '${target}'.`);
                });
                if (operation === 'install') expect(launch).not.toHaveBeenCalled();
            });
        }

        for (const device of [legacyTarget, '', undefined]) {
            it(`preserves ios-deploy arguments for ${JSON.stringify(device)}`, async () => {
                await run.deployToDevice(appPath, device, ['--verbose']);
                expect(exec).toHaveBeenCalledWith('ios-deploy',
                    ['--justlaunch', '-d', '-b', appPath].concat(device ? ['-i', device] : ['--no-wifi'], ['--verbose']),
                    { stdio: 'inherit' });
                expect(install).not.toHaveBeenCalled();
                expect(launch).not.toHaveBeenCalled();
            });
        }

        it('propagates ios-deploy failures', async () => {
            exec.and.rejectWith(new Error('Legacy deployment failed'));
            await expectAsync(run.deployToDevice(appPath, legacyTarget, [])).toBeRejectedWithError('Legacy deployment failed');
        });
    });

    describe('simulator launch using the shared plist reader', () => {
        beforeEach(() => {
            getDevice = jasmine.createSpy('getDeviceFromDeviceTypeId').and.returnValue({ udid: 'simulator' });
            start = jasmine.createSpy('startSimulator');
            spyOn(process, 'exit');
            spyOn(fs, 'existsSync').and.returnValue(true);
            spyOn(bplist, 'parseFile').and.callFake((file, callback) => callback(null, [{ CFBundleIdentifier: bundleId }]));
        });

        it('starts the selected simulator with the extracted bundle identifier', async () => {
            await run.startSim(appPath, 'iPhone 17');
            expect(getDevice).toHaveBeenCalledWith('com.apple.CoreSimulator.SimDeviceType.iPhone 17');
            expect(start).toHaveBeenCalledWith({ udid: 'simulator' }, {
                appPath,
                appIdentifier: bundleId,
                logPath: path.join('/test', 'project', 'cordova', 'console.log'),
                waitForDebugger: false
            });
            expect(process.exit).toHaveBeenCalledWith(0);
        });

        it('reports plist failures and exits with failure', async () => {
            fs.existsSync.and.returnValue(false);
            await run.startSim(appPath, 'iPhone 17');
            expect(events.emit).toHaveBeenCalledWith('warn', `Failed to launch simulator with error: ${infoPath} file not found.`);
            expect(start).not.toHaveBeenCalled();
            expect(process.exit).toHaveBeenCalledWith(1);
        });

        it('reports device lookup errors and exits with failure', async () => {
            getDevice.and.throwError('Unknown simulator');
            await run.startSim(appPath, 'iPhone 17');
            expect(events.emit).toHaveBeenCalledWith('warn', 'Failed to launch simulator with error: Unknown simulator');
            expect(process.exit).toHaveBeenCalledWith(1);
        });

        it('preserves the warning for simulator startup errors', async () => {
            start.and.throwError('Startup failed');
            await run.startSim(appPath, 'iPhone 17');
            expect(events.emit).toHaveBeenCalledWith('warn', 'Failed to start simulator with error: "Startup failed"');
            expect(process.exit).toHaveBeenCalledWith(0);
        });
    });
});
