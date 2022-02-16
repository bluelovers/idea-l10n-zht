import { join } from 'upath2';
import { cli_logger } from '../lib/cli-progress';
import { __plugin_downloaded_dir } from '../lib/const';
import { __plugin_zh_cn_download, __plugin_zh_cn_id, __plugin_zh_cn_version } from '../lib/const/link-of-zh-cn';
import { downloadPlugin, generateDownloadMessage } from '../lib/util/download-plugin';

export default cli_logger(downloadPlugin(__plugin_zh_cn_download, join(__plugin_downloaded_dir, 'zh.zip')), generateDownloadMessage({
	id: __plugin_zh_cn_id,
	version: __plugin_zh_cn_version,
}))
;
