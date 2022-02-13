import { crossSpawnGitAsync } from '@git-lazy/spawn';
import { opts } from './_config';
import { ITSArrayListMaybeReadonly, ITSValueOrArrayMaybeReadonly } from 'ts-type/lib/type/base';
import { ISpawnGitAsyncOptions } from '@git-lazy/spawn/lib/types';
import { console } from 'debug-color2';

export function lazyCommitFiles(files: ITSValueOrArrayMaybeReadonly<string>, commitMessage: string, config?: {
	addFlags?: ITSArrayListMaybeReadonly<string>,
	options?: ISpawnGitAsyncOptions,
})
{
	files = [files].flat();
	config ??= {};

	const options: ISpawnGitAsyncOptions = {
		...opts,
		...config.options,
	};

	const addFlags = config.addFlags ?? [];

	let args = [
		'add',
		...addFlags,
		...files,
	];

	console.cyan.info('git', ...args);

	return crossSpawnGitAsync('git', args, options)
		.then(() =>
		{
			args = [
				'commit',
				'-m',
				commitMessage,
				...files,
			];

			console.cyan.info('git', ...args);

			return crossSpawnGitAsync('git', args, options)
		})
		;
}
