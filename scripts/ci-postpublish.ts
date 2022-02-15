import { gitDiffFrom } from 'git-diff-from';
import { __root } from '../test/__root';
import { gitlog } from 'gitlog2';
import Bluebird from 'bluebird';
import micromatch, { not, match } from 'micromatch';
import { updateChangelogByCwd } from '@yarn-tool/changelog';
import { console } from 'debug-color2';
import { crossSpawnGitSync, crossSpawnGitAsync, ISpawnGitAsyncOptions, ISpawnGitSyncOptions } from '@git-lazy/spawn';
import { opts } from '../lib/git/_config';
import { getGitLogs } from '../lib/git/git-logs';

export default Bluebird.resolve((process.env as any).GITHUB_SHA as string)
	.then((from) =>
	{
		from ||= 'origin/master';

		console.dir({
			from,
		});

		//from = '2d01cffc5da15e0a34a40b40ec3b7d0cc7612dda';

		let to = getGitLogs()[0].hash;

		console.log(`input`);

		console.dir({
			from,
			to,
		});

		return gitDiffFrom(from, to, {
			cwd: __root,
		})
	})
	.then(async (info) =>
	{

		const files = not(info.files, [
			'CHANGELOG.md',
			'test/**',
			'.run/**',
			'docs/**',
			'coverage/**',
			'test/**',
			'*.*',
			'.*',
		]);

		//console.dir(files);
		//console.dir(info);

		console.log(`result`);

		const result = {
			from: info.from,
			to: info.to,
			changed: files.length,
		};

		console.dir(result);

		if (info.from === info.to)
		{
			console.error(`git 沒有變化 或 遠端與本地無法比對`)
			return
		}

		if (files.length && micromatch(files, [
			'plugin-dev-out/*.jar',
		]).length)
		{
			if (files.length < 10)
			{
				console.log(`files`);
				console.dir(files);
			}

			await updateChangelogByCwd(__root, {
				type: 'independent',
			});

			await crossSpawnGitAsync('git', [
				'commit',
				'-m',
				`build(changelog): update CHANGELOG`,
				'./CHANGELOG.md',
			], opts);
		}
		else
		{
			console.warn(`編譯版本沒有任何變化`)
		}

		return result
	})
//.tap(console.dir)
;
