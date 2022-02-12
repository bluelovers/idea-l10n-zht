import fetch from 'cross-fetch';
import { Response } from 'node-fetch';
import { outputFile } from 'fs-extra';

export function downloadPlugin(link: string, output_file: string)
{
	return fetch(link)
		.then((res) => (res as any as Response).buffer())
		.then(buf =>
		{
			return outputFile(output_file, buf)
		})
}
