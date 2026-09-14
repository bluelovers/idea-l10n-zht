/**
 * 替換 properties 屬性檔中的翻譯文字
 * Replace translation text in properties files
 *
 * 使用 replaceProperties 函式處理 zh（中文）語系的屬性檔替換，
 * 將懶載入屬性檔中的簡體中文翻譯套用至已解壓縮的語系檔。
 * Uses replaceProperties to handle zh (Chinese) properties replacement,
 * applying translations from lazy-loaded properties files to unzipped locale files.
 */
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
