import { async as FastGlob } from '@bluelovers/fast-glob/bluebird';
import {
	__plugin_dev_output_dir,
	__plugin_dev_overwrite_dir,
	__plugin_dev_raw_dir,
	__plugin_downloaded_dir_unzip,
} from '../lib/const';
import { console } from 'debug-color2';
import { outputFile, outputJSON } from 'fs-extra';
import { join } from 'upath2';
import JSZip from "jszip";
import Bluebird from 'bluebird';
import { createMultiBar } from '../lib/cli-progress';
import { cyan } from 'ansi-colors';
import { fixedJSZipDate } from 'jszip-fixed-date';
import { mergePaths } from '../lib/merge-paths';
import { getBuildFileList } from '../lib/get-build-file-list';
import { packPluginJar } from '../lib/build/pack-plugin-jar';

export default packPluginJar('zh');
