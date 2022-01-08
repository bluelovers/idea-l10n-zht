import JSZip from "jszip";
import { outputFile, readFile } from 'fs-extra';
import { join } from 'upath2';
import { __root } from '../test/__root';
import Bluebird from 'bluebird';
import { cli_logger, createProgressEstimator } from '../lib/cli-progress';
import { __plugin_downloaded_dir, __plugin_downloaded_dir_unzip } from '../lib/const';

unzipLang('zh');

function unzipLang(lang: string | 'zh')
{
	return cli_logger(Bluebird.resolve(readFile(join(__plugin_downloaded_dir, `${lang}.zip`)))
			.then<JSZip>(JSZip.loadAsync)
			.then(async (zip) =>
			{
				let file = zip.file(/\.jar$/);

				return file[0].async('nodebuffer').then(JSZip.loadAsync)
			})
			.then(zip =>
			{
				return Object.values(zip.files)
			})
			.each(async (file) =>
			{
				return !file.dir && outputFile(join(__plugin_downloaded_dir_unzip, lang, file.name), await file.async('nodebuffer'))
			})
		//.tap(console.dir)
		, `unzip ${lang}.zip`)
		;
}
