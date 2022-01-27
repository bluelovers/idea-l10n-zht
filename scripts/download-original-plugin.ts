import fetch from 'cross-fetch';
import { Response } from 'node-fetch';
import { outputFile } from 'fs-extra';
import { join } from 'upath2';
import { cli_logger } from '../lib/cli-progress';
import { __plugin_downloaded_dir } from '../lib/const';
import { __plugin_zh_cn_download, __plugin_zh_cn_id, __plugin_zh_cn_version } from '../lib/const/link-of-zh-cn';

export default cli_logger(fetch(__plugin_zh_cn_download)
	.then((res) => (res as any as Response).buffer())
	.then(buf =>
	{
		return outputFile(join(__plugin_downloaded_dir, 'zh.zip'), buf)
	}), `download Chinese ​(Simplified)​ Language Pack / 中文语言包\nid: ${__plugin_zh_cn_id}\nversion: ${__plugin_zh_cn_version}`)
;
