import fetch from 'cross-fetch';
import { Response } from 'node-fetch';
import { outputFile, pathExists } from 'fs-extra';
import { generateDownloadLink } from './version-map';
import { IVersionApiResultRow } from '../const/version-map';
import { console, chalkByConsole } from 'debug-color2';
import { basename } from 'upath2';

export async function downloadPlugin(link: string, output_file: string, force?: boolean)
{
	if (!force)
	{
		let name = basename(output_file);

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

export function generateDownloadMessage(info: Pick<IVersionApiResultRow, 'id' | 'version'>, download: boolean = true)
{
	let msg = `Chinese ​(Simplified)​ Language Pack / 中文语言包\nid: ${info.id}\nversion: ${info.version}`;

	if (download)
	{
		msg+=`\n`
	}

	return msg
}
