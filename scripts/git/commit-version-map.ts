import { crossSpawnGitAsync } from '@git-lazy/spawn';
import { opts } from './_config';

export default crossSpawnGitAsync('git', [
	'add',
	'./lib/const/version-map.json',
], opts)
	.then(() =>
	{
		return crossSpawnGitAsync('git', [
			'commit',
			'-m',
			'build(cache): update version-map',
			'./lib/const/version-map.json',
		], opts)
	})
	.catch(() => void 0)
;
