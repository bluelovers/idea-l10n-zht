import fetch from 'cross-fetch';
import { Response } from 'node-fetch';
import { outputFile } from 'fs-extra';
import { generateDownloadLink } from './version-map';
import { IVersionApiResultRow } from '../const/version-map';
import { console, chalkByConsole } from 'debug-color2';

export function downloadPlugin(link: string, output_file: string)
{
	return fetch(link)
		.then((res) => (res as any as Response).buffer())
		.then(buf =>
		{
			return outputFile(output_file, buf)
		})
}

export function generateDownloadMessage(info: Pick<IVersionApiResultRow, 'id' | 'version'>)
{
	return `download Chinese ​(Simplified)​ Language Pack / 中文语言包\nid: ${info.id}\nversion: ${info.version}\n`
}
