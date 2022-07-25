import { ITSResolvable } from 'ts-type';
import { _handleArgvResult } from './handle-argv';
import { basename } from 'upath2';
import { unzipLang } from '../build/unzip';
import { convertLang } from '../build/to-zht';
import { replaceProperties } from '../build/properties-replace';
import { packPluginJar } from '../build/pack-plugin-jar';

export type IArgvBuild = Awaited<ReturnType<typeof _handleArgvResult>>;

export function _handleBuild(result: ITSResolvable<IArgvBuild>)
{
	return Promise.resolve(result)
		.then(async (result) =>
		{

			const name = result.name ?? basename(result.file, '.zip');

			await unzipLang(name);
			await convertLang(name);
			await replaceProperties(name);
			await packPluginJar(name);

		})
}
