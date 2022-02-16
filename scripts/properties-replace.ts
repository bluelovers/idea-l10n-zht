import { async as FastGlob } from '@bluelovers/fast-glob/bluebird';
import { __plugin_dev_raw_dir } from '../lib/const';
import { SingleBar } from 'cli-progress';
import { console } from 'debug-color2';
import { join } from 'upath2';
import { createMultiBar } from '../lib/cli-progress';
import DotProperties from 'dot-properties-loader';
import { outputJSON } from 'fs-extra';
import { LAZY_PROPERTIES, LAZY_PROPERTIES_KEYS, replaceProperties } from '../lib/build/properties-replace';

export default replaceProperties('zh')
