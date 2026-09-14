import fetch from 'cross-fetch';
import { Response } from 'node-fetch';
import { outputFile, pathExists } from 'fs-extra';
import { generateDownloadLink } from './version-map';
import { IVersionApiResultRow } from '../const/version-map';
import { console, chalkByConsole } from 'debug-color2';
import { basename } from 'upath2';

/**
 * 下載 IntelliJ IDEA 插件檔案，若非強制模式則跳過已存在的檔案
 * Download IntelliJ IDEA plugin file, skipping existing files if not in force mode
 * @param link - 插件下載連結 / Plugin download URL
 * @param output_file - 輸出檔案路徑 / Output file path
 * @param force - 是否強制重新下載（預設 false） / Whether to force re-download (default false)
 * @returns 下載完成的 Promise / Download completion Promise
 */
export async function downloadPlugin(link: string, output_file: string, force?: boolean)
{
	if (!force)
	{
		let name = basename(output_file);

		/**
		 * 僅對符合命名格式的已存在檔案跳過下載（如 "PluginName-12345.zip"）
		 * Skip download only for existing files matching naming pattern (e.g. "PluginName-12345.zip")
		 */
		if (/^\w+-\d+/i.test(name))
		{
			const bool = await pathExists(output_file);

			if (bool)
			{
				return;
			}
		}
	}

	return fetch(link)
		.then((res) => (res as any as Response).buffer())
		.then(buf =>
		{
			return outputFile(output_file, buf)
		})
}

/**
 * 產生插件下載訊息，包含插件 ID、版本與下載連結的格式化文字
 * Generate plugin download message, containing formatted text with plugin ID, version, and download link
 * @param info - 插件資訊（包含 id 和 version） / Plugin info (containing id and version)
 * @param download - 是否包含換行分隔符（預設 true） / Whether to include trailing newline separator (default true)
 * @returns 格式化的訊息字串 / Formatted message string
 */
export function generateDownloadMessage(info: Pick<IVersionApiResultRow, 'id' | 'version'>, download: boolean = true)
{
	let msg = `Chinese ​(Simplified)​ Language Pack / 中文语言包\nid: ${info.id}\nversion: ${info.version}`;

	if (download)
	{
		msg+=`\n`
	}

	return msg
}
