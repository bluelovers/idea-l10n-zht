import { outputFile } from 'fs-extra';
import { join } from 'upath2';
import { __root } from '../test/__root';
import fetch from 'cross-fetch';
import { __plugin_zh_cn_id } from '../lib/const/link-of-zh-cn';
import { console } from 'debug-color2';

export default fetch('https://plugins.jetbrains.com/api/plugins/13710/updates?channel=&size=1')
	.then((res) =>
	{
		return res.json();
	}).then((data: {
		id: string,
		link: string,
		version: string,
	}[]) =>
	{
		const id = data[0].id.toString();
		const version = data[0].version.toString();

		if (__plugin_zh_cn_id !== id)
		{
			console.success(`發現新版本 #${id} version: ${version}`);

			return outputFile(join(__root, 'lib/const/link-of-zh-cn.ts'), `

export const __plugin_zh_cn_id = '${id}';

export const __plugin_zh_cn_version = '${version}';

export const __plugin_zh_cn_download = 'https://plugins.jetbrains.com/plugin/download?rel=true&updateId=${id}';

`);
		}

		console.gray(`沒有發現新版本`);
	})
	.catch((e) =>
	{
		console.error(`嘗試偵測新版本時發生錯誤`);
		console.error(e);
	})
;
