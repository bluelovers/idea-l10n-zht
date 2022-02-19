import { join } from 'upath2';
import { pathExists, readFile } from 'fs-extra';
import { matcher } from 'micromatch';
import { array_unique_overwrite } from 'array-hyper-unique';

export type IPaths = [string, ...string[]];

export interface IOptionsMergePaths
{
	ignore?: string[],
}

export const defaultIgnore = [
	//'search/**/*',
	//'intentionDescriptions/**/*',
	//'postfixTemplates/**/*',
] as const;

export function mergePaths(dirs: string[], options?: IOptionsMergePaths)
{
	const isMatch = matcher('**/*', {
		ignore: options?.ignore ?? defaultIgnore,
	});

	dirs = array_unique_overwrite(dirs);

	const getPath = async (...paths: IPaths) =>
	{
		const file = join(...paths);

		if (isMatch(file))
		{
			for (const dir of dirs)
			{
				const fullpath = join(dir, file);

				if (await pathExists(fullpath))
				{
					return fullpath
				}
			}

			throw new Error(file)
		}
	};

	const readPathFile = (...paths: IPaths) => getPath(...paths).then(file => file?.length && readFile(file));

	return {
		getPath,
		readPathFile,
		isMatch,
	}
}
