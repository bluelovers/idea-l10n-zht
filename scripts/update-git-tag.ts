import { gitTag, gitTagSync, IOptions } from '@git-lazy/tag';
import Bluebird from 'bluebird';
import { __root } from '../test/__root';
import micromatch, { not, match } from 'micromatch';
import { console } from 'debug-color2';
import { opts } from '../lib/git/_config';
import { getGitLogs } from '../lib/git/git-logs';
import { join } from 'upath2';
import { updatePluginTag, updateRepoTag } from '../lib/git/git-tag';

export default Bluebird.resolve()
	.then(() =>
	{
		return getGitLogs()
	})
	.then(async (logs) =>
	{
		const { __plugin_zh_cn_series, __plugin_zh_cn_version } = await import('../lib/const/link-of-zh-cn');

		const commit = logs[0];

		const bool = commit.subject.startsWith(`build(changelog): update CHANGELOG`);
		const bool2 = match(commit.files, 'CHANGELOG.md').length > 0;

		console.cyan.info(commit.abbrevHash, `${commit.subject}`);
		console.info(`include CHANGELOG: ${bool} , ${bool2}`);
		console.dir(commit.files.length);

		if (bool)
		{
			console.info(`更新 git tag`);

			const { name, version } = await import(join(__root, 'package.json'));

			await updateRepoTag();

			return updatePluginTag(__plugin_zh_cn_version)
		}

		console.warn(`略過本次 git tag 更新`)
	})
	.catch((e) => console.error(e))
;
