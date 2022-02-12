import { crossSpawnGitAsync } from '@git-lazy/spawn';
import { opts } from './_config';
import { ITSArrayListMaybeReadonly, ITSValueOrArrayMaybeReadonly } from 'ts-type/lib/type/base';
import { ISpawnGitAsyncOptions } from '@git-lazy/spawn/lib/types';

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

	return crossSpawnGitAsync('git', [
		'add',
		...addFlags,
		...files,
	], options)
		.then(() =>
		{
			return crossSpawnGitAsync('git', [
				'commit',
				'-m',
				commitMessage,
				...files,
			], options)
		})
		;
}
