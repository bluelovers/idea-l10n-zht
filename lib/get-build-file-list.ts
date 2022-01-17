import { readJSON } from 'fs-extra';
import { join } from 'upath2';
import { __plugin_dev_overwrite_dir, __plugin_downloaded_dir_unzip } from './const';
import Bluebird from 'bluebird';
import { async as FastGlob } from '@bluelovers/fast-glob/bluebird';
import { array_unique_overwrite } from 'array-hyper-unique';

export function getBuildFileList(lang: string)
{
	return Bluebird.props({
			ls: readJSON(join(__plugin_downloaded_dir_unzip, lang + '.list.json')) as Promise<string[]>,
			ls2: FastGlob<string>([
				'META-INF/**/*',
				'**/*',
			], {
				cwd: join(__plugin_dev_overwrite_dir, lang),
			}),
		})
		.then(data =>
		{
			return Object.values(data).flat()
		})
		.then(ls => array_unique_overwrite(ls))
}
