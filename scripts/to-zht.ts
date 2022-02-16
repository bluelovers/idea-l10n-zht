/**
 * Created by user on 2022/1/9.
 */

import { async as FastGlob } from '@bluelovers/fast-glob/bluebird';
import { __plugin_dev_raw_dir, __plugin_downloaded_dir_unzip } from '../lib/const';
import { outputFile, outputJSON, pathExists, readFile, readJSON, unlink } from 'fs-extra';
import { join } from 'upath2';
import { console } from 'debug-color2';
import { createMultiBar } from '../lib/cli-progress';
import { SingleBar } from 'cli-progress';
import { gray, red } from 'ansi-colors';
import { updateMeta } from '../lib/meta';
import { processIdeaSegmentText } from '../lib/segment';
import { array_unique_overwrite } from 'array-hyper-unique';
import { handleText } from '../lib/handleText';
import { convertLang } from '../lib/build/to-zht';
import Bluebird from 'bluebird';

export default convertLang('zh');
