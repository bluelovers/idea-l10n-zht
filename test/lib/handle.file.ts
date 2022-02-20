import { readFile } from 'fs-extra';
import { join } from 'upath2';
import { handleText } from '../../lib/handleText';

if (typeof jest !== 'undefined')
{
	jest.setTimeout(60 * 1000);
}

export async function handleFile(file: string, cwd: string)
{
	const text = await readFile(join(cwd, file)).then(m => m.toString());

	const actual = await handleText(text, {
		file,
	});

	return {
		text,
		actual,
	}
}
