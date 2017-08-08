/*
 *
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
*/

var fs = require('fs');
var path = require('path');
var osenv = require('os');
var shell = require('shelljs');
var rewire = require('rewire');

var common = rewire('../../../../bin/templates/scripts/cordova/lib/plugman/pluginHandlers');

var test_dir = path.join(osenv.tmpdir(), 'test_plugman');
var project_dir = path.join(test_dir, 'project');
var src = path.join(project_dir, 'src');
var dest = path.join(project_dir, 'dest');
var srcDirTree = path.join(src, 'one', 'two', 'three');
var srcFile = path.join(srcDirTree, 'test.java');
var symlink_file = path.join(srcDirTree, 'symlink');
var non_plugin_file = path.join(osenv.tmpdir(), 'non_plugin_file');

var copyFile = common.__get__('copyFile');
var copyNewFile = common.__get__('copyNewFile');
var removeFileAndParents = common.__get__('removeFileAndParents');

describe('common handler routines', function () {

    describe('copyFile', function () {
        it('Test 001 : should throw if source path not found', function () {
            shell.rm('-rf', test_dir);
            expect(function () { copyFile(test_dir, src, project_dir, dest); })
                .toThrow(new Error('"' + src + '" not found!'));
        });

        it('Test 002 : should throw if src not in plugin directory', function () {
            shell.mkdir('-p', project_dir);
            fs.writeFileSync(non_plugin_file, 'contents', 'utf-8');
            var outside_file = '../non_plugin_file';
            expect(function () { copyFile(test_dir, outside_file, project_dir, dest); })
                .toThrow(new Error('File "' + path.resolve(test_dir, outside_file) + '" is located outside the plugin directory "' + test_dir + '"'));
            shell.rm('-rf', test_dir);
        });

        it('Test 003 : should allow symlink src, if inside plugin', function () {
            shell.mkdir('-p', srcDirTree);
            fs.writeFileSync(srcFile, 'contents', 'utf-8');

            // This will fail on windows if not admin - ignore the error in that case.
            if (ignoreEPERMonWin32(srcFile, symlink_file)) {
                return;
            }

            copyFile(test_dir, symlink_file, project_dir, dest);
            shell.rm('-rf', project_dir);
        });

        it('Test 004 : should throw if symlink is linked to a file outside the plugin', function () {
            shell.mkdir('-p', srcDirTree);
            fs.writeFileSync(non_plugin_file, 'contents', 'utf-8');

            // This will fail on windows if not admin - ignore the error in that case.
            if (ignoreEPERMonWin32(non_plugin_file, symlink_file)) {
                return;
            }

            expect(function () { copyFile(test_dir, symlink_file, project_dir, dest); })
                .toThrow(new Error('File "' + path.resolve(test_dir, symlink_file) + '" is located outside the plugin directory "' + test_dir + '"'));
            shell.rm('-rf', project_dir);
        });

        it('Test 005 : should throw if dest is outside the project directory', function () {
            shell.mkdir('-p', srcDirTree);
            fs.writeFileSync(srcFile, 'contents', 'utf-8');
            expect(function () { copyFile(test_dir, srcFile, project_dir, non_plugin_file); })
                .toThrow(new Error('Destination "' + path.resolve(project_dir, non_plugin_file) + '" for source file "' + path.resolve(test_dir, srcFile) + '" is located outside the project'));
            shell.rm('-rf', project_dir);
        });

        it('Test 006 : should call mkdir -p on target path', function () {
            shell.mkdir('-p', srcDirTree);
            fs.writeFileSync(srcFile, 'contents', 'utf-8');

            var s = spyOn(shell, 'mkdir').and.callThrough();
            var resolvedDest = path.resolve(project_dir, dest);

            copyFile(test_dir, srcFile, project_dir, dest);

            expect(s).toHaveBeenCalled();
            expect(s).toHaveBeenCalledWith('-p', path.dirname(resolvedDest));
            shell.rm('-rf', project_dir);
        });

        it('Test 007 : should call cp source/dest paths', function () {
            shell.mkdir('-p', srcDirTree);
            fs.writeFileSync(srcFile, 'contents', 'utf-8');

            var s = spyOn(shell, 'cp').and.callThrough();
            var resolvedDest = path.resolve(project_dir, dest);

            copyFile(test_dir, srcFile, project_dir, dest);

            expect(s).toHaveBeenCalled();
            expect(s).toHaveBeenCalledWith('-f', srcFile, resolvedDest);

            shell.rm('-rf', project_dir);
        });

    });

    describe('copyNewFile', function () {
        it('Test 008 : should throw if target path exists', function () {
            shell.mkdir('-p', dest);
            expect(function () { copyNewFile(test_dir, src, project_dir, dest); })
                .toThrow(new Error('"' + dest + '" already exists!'));
            shell.rm('-rf', dest);
        });

    });

    describe('deleteJava', function () {
        it('Test 009 : should call fs.unlinkSync on the provided paths', function () {
            shell.mkdir('-p', srcDirTree);
            fs.writeFileSync(srcFile, 'contents', 'utf-8');

            var s = spyOn(fs, 'unlinkSync').and.callThrough();
            removeFileAndParents(project_dir, srcFile);
            expect(s).toHaveBeenCalled();
            expect(s).toHaveBeenCalledWith(path.resolve(project_dir, srcFile));

            shell.rm('-rf', srcDirTree);
        });

        it('Test 010 : should delete empty directories after removing source code in path hierarchy', function () {
            shell.mkdir('-p', srcDirTree);
            fs.writeFileSync(srcFile, 'contents', 'utf-8');

            removeFileAndParents(project_dir, srcFile);
            expect(fs.existsSync(srcFile)).not.toBe(true);
            expect(fs.existsSync(srcDirTree)).not.toBe(true);
            expect(fs.existsSync(path.join(src, 'one'))).not.toBe(true);

            shell.rm('-rf', srcDirTree);
        });

        it('Test 011 : should delete the top-level src directory if all plugins added were removed', function () {
            shell.mkdir('-p', srcDirTree);
            fs.writeFileSync(srcFile, 'contents', 'utf-8');

            removeFileAndParents(project_dir, srcFile);
            expect(fs.existsSync(src)).toBe(false);

            shell.rm('-rf', srcDirTree);
        });
    });
});

function ignoreEPERMonWin32 (symlink_src, symlink_dest) {
    try {
        fs.symlinkSync(symlink_src, symlink_dest);
    } catch (e) {
        if (process.platform === 'win32' && e.message.indexOf('Error: EPERM, operation not permitted' > -1)) {
            return true;
        }
        throw e;
    }
    return false;
}
