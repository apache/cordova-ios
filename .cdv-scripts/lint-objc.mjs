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

import { spawnSync } from 'node:child_process';
import { readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';

const args = parseArgs({
    options: {
        path: { type: 'string', short: 'p' },
        fix: { type: 'boolean', short: 'f', default: false }
    }
});

const rootDir = args.values.path || './';

async function getObjCFiles (dir) {
    const files = [];
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory()) {
            files.push(...(await getObjCFiles(fullPath)));
        } else if (fullPath.endsWith('.m') || fullPath.endsWith('.h')) {
            files.push(fullPath);
        }
    }

    return files;
}

async function lint () {
    if (!existsSync(rootDir)) {
        console.error(`Path, "${rootDir}", does not exist.`);
        process.exit(1);
    }

    const files = await getObjCFiles(rootDir);
    if (!files.length) {
        console.log(`No ObjC files found in ${rootDir}`);
        return;
    }

    console.log(`Linting ${files.length} ObjC files in ${rootDir}`);

    for (const file of files) {
        // Skipping Test Fixtures
        if (file.startsWith('tests/spec/fixtures')) continue;

        const fileToTest = join(rootDir, file);
        console.log(`Linting: ${file}`);
        try {
            const spawnArgs = args.values.fix ? ['-i'] : ['--dry-run', '--Werror'];
            spawnSync('xcrun', ['clang-format', fileToTest, ...spawnArgs], { stdio: 'inherit' });
        } catch {
            console.error(`Lint issues in ${file}`);
        }
    }
}

lint();
