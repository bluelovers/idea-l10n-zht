import { _lazyImportCore } from '../lib/util/import';
import { unzipLang } from '../lib/build/unzip';
import { basename } from 'upath2';
import { convertLang } from '../lib/build/to-zht';
import { replaceProperties } from '../lib/build/properties-replace';
import { packPluginJar } from '../lib/build/pack-plugin-jar';

export default _lazyImportCore(import('./download-series'))
	.then(async (result) => {

		const name = basename(result.file, '.zip');

		await unzipLang(name);
		await convertLang(name);
		await replaceProperties(name);
		await packPluginJar(name);

	})
;
