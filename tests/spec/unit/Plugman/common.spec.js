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

const fs = require('fs-extra');
const path = require('path');
const osenv = require('os');
const rewire = require('rewire');

const common = rewire('../../../../bin/templates/scripts/cordova/lib/plugman/pluginHandlers');

const test_dir = path.join(osenv.tmpdir(), 'test_plugman');
const project_dir = path.join(test_dir, 'project');
const src = path.join(project_dir, 'src');
const dest = path.join(project_dir, 'dest');
const srcDirTree = path.join(src, 'one', 'two', 'three');
const srcFile = path.join(srcDirTree, 'test.java');
const symlink_file = path.join(srcDirTree, 'symlink');
const non_plugin_file = path.join(osenv.tmpdir(), 'non_plugin_file');

const copyFile = common.__get__('copyFile');
const copyNewFile = common.__get__('copyNewFile');
const removeFileAndParents = common.__get__('removeFileAndParents');

describe('common handler routines', () => {
    describe('copyFile', () => {
        it('Test 001 : should throw if source path not found', () => {
            fs.removeSync(test_dir);
            expect(() => { copyFile(test_dir, src, project_dir, dest); })
                .toThrow(new Error(`"${src}" not found!`));
        });

        it('Test 002 : should throw if src not in plugin directory', () => {
            fs.ensureDirSync(project_dir);
            fs.writeFileSync(non_plugin_file, 'contents', 'utf-8');
            const outside_file = '../non_plugin_file';
            expect(() => { copyFile(test_dir, outside_file, project_dir, dest); })
                .toThrow(new Error(`File "${path.resolve(test_dir, outside_file)}" is located outside the plugin directory "${test_dir}"`));
            fs.removeSync(test_dir);
        });

        it('Test 003 : should allow symlink src, if inside plugin', () => {
            fs.ensureDirSync(srcDirTree);
            fs.writeFileSync(srcFile, 'contents', 'utf-8');

            // This will fail on windows if not admin - ignore the error in that case.
            if (ignoreEPERMonWin32(srcFile, symlink_file)) {
                return;
            }

            copyFile(test_dir, symlink_file, project_dir, dest);
            fs.removeSync(project_dir);
        });

        it('Test 004 : should throw if symlink is linked to a file outside the plugin', () => {
            fs.ensureDirSync(srcDirTree);
            fs.writeFileSync(non_plugin_file, 'contents', 'utf-8');

            // This will fail on windows if not admin - ignore the error in that case.
            if (ignoreEPERMonWin32(non_plugin_file, symlink_file)) {
                return;
            }

            expect(() => { copyFile(test_dir, symlink_file, project_dir, dest); })
                .toThrow(new Error(`File "${path.resolve(test_dir, symlink_file)}" is located outside the plugin directory "${test_dir}"`));
            fs.removeSync(project_dir);
        });

        it('Test 005 : should throw if dest is outside the project directory', () => {
            fs.ensureDirSync(srcDirTree);
            fs.writeFileSync(srcFile, 'contents', 'utf-8');
            expect(() => { copyFile(test_dir, srcFile, project_dir, non_plugin_file); })
                .toThrow(new Error(`Destination "${path.resolve(project_dir, non_plugin_file)}" for source file "${path.resolve(test_dir, srcFile)}" is located outside the project`));
            fs.removeSync(project_dir);
        });

        it('Test 006 : should call mkdir -p on target path', () => {
            fs.ensureDirSync(srcDirTree);
            fs.writeFileSync(srcFile, 'contents', 'utf-8');

            const s = spyOn(fs, 'ensureDirSync').and.callThrough();
            const resolvedDest = path.resolve(project_dir, dest);

            copyFile(test_dir, srcFile, project_dir, dest);

            expect(s).toHaveBeenCalled();
            expect(s).toHaveBeenCalledWith(path.dirname(resolvedDest));
            fs.removeSync(project_dir);
        });

        it('Test 007 : should call cp source/dest paths', () => {
            fs.ensureDirSync(srcDirTree);
            fs.writeFileSync(srcFile, 'contents', 'utf-8');

            spyOn(fs, 'copySync').and.callThrough();
            const resolvedDest = path.resolve(project_dir, dest);

            copyFile(test_dir, srcFile, project_dir, dest);

            expect(fs.copySync).toHaveBeenCalled();
            expect(fs.copySync).toHaveBeenCalledWith(srcFile, resolvedDest);

            fs.removeSync(project_dir);
        });
    });

    describe('copyNewFile', () => {
        it('Test 008 : should throw if target path exists', () => {
            fs.ensureDirSync(dest);
            expect(() => { copyNewFile(test_dir, src, project_dir, dest); })
                .toThrow(new Error(`"${dest}" already exists!`));
            fs.removeSync(dest);
        });
    });

    describe('deleteJava', () => {
        it('Test 009 : source file should have been removed', () => {
            fs.ensureDirSync(srcDirTree);
            fs.writeFileSync(srcFile, 'contents', 'utf-8');

            expect(fs.existsSync(srcFile)).toBe(true);
            removeFileAndParents(project_dir, srcFile);
            expect(fs.existsSync(srcFile)).toBe(false);

            fs.removeSync(srcDirTree);
        });

        it('Test 010 : should delete empty directories after removing source code in path hierarchy', () => {
            fs.ensureDirSync(srcDirTree);
            fs.writeFileSync(srcFile, 'contents', 'utf-8');

            removeFileAndParents(project_dir, srcFile);
            expect(fs.existsSync(srcFile)).not.toBe(true);
            expect(fs.existsSync(srcDirTree)).not.toBe(true);
            expect(fs.existsSync(path.join(src, 'one'))).not.toBe(true);

            fs.removeSync(srcDirTree);
        });

        it('Test 011 : should delete the top-level src directory if all plugins added were removed', () => {
            fs.ensureDirSync(srcDirTree);
            fs.writeFileSync(srcFile, 'contents', 'utf-8');

            removeFileAndParents(project_dir, srcFile);
            expect(fs.existsSync(src)).toBe(false);

            fs.removeSync(srcDirTree);
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
