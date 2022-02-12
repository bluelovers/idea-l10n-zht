import { crossSpawnGitAsync } from '@git-lazy/spawn';
import { opts } from './_config';

const list = [
	'./original-plugin',
	'./original-plugin-raw',
	'./plugin-dev-out',
	'./plugin-dev-raw',
	'./lib/static',
	'./test/__snapshots__',
	'./lib/const/link-of-zh-cn.ts',
] as const;

export default crossSpawnGitAsync('git', [
	'add',
	'--all',
	...list,
], opts)
	.then(() =>
	{
		return crossSpawnGitAsync('git', [
			'commit',
			'-m',
			'build(release): update build',
			...list,
		], opts)
	})
;
