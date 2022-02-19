import { gitTag, gitTagSync, IOptions } from '@git-lazy/tag';
import { findRoot, findRootLazy } from '@yarn-tool/find-root';
import Bluebird from 'bluebird';
import { __plugin_zh_cn_version } from '../lib/const/link-of-zh-cn';
import { __root } from '../test/__root';
import { gitlog } from 'gitlog2';
import micromatch, { not, match } from 'micromatch';
import { console } from 'debug-color2';
import { opts } from '../lib/git/_config';
import { getGitLogs } from '../lib/git/git-logs';
import { join } from 'upath2';

export default Bluebird.resolve()
	.then(() =>
	{
		return getGitLogs()
	})
	.then(async (logs) =>
	{
		const commit = logs[0];

		const bool = commit.subject === `build(changelog): update CHANGELOG`;
		const bool2 = match(commit.files, 'CHANGELOG.md').length > 0;

		console.cyan.info(commit.abbrevHash, `${commit.subject}`);
		console.info(`include CHANGELOG: ${bool} , ${bool2}`);
		console.dir(commit.files.length);

		if (bool)
		{
			console.info(`更新 git tag`);

			const { name, version } = await import(join(__root, 'package.json'));

			/**
			 * changelog 專用 tag
			 */
			await gitTag(`${name}@${version}`, {
				cwd: __root,
				forceGitTag: true,
			}, opts);

			return gitTag(`v${__plugin_zh_cn_version}`, {
				cwd: __root,
				forceGitTag: true,
			}, opts)
		}

		console.warn(`略過本次 git tag 更新`)
	})
	.catch((e) => console.error(e))
;
