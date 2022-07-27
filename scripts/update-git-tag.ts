import { gitTag, gitTagSync, IOptions } from '@git-lazy/tag';
import Bluebird from 'bluebird';
import { __root } from '../test/__root';
import micromatch, { not, match } from 'micromatch';
import { console } from 'debug-color2';
import { opts } from '../lib/git/_config';
import { getGitLogs } from '../lib/git/git-logs';
import { join } from 'upath2';
import { updatePluginTag, updateRepoTag } from '../lib/git/git-tag';
import { getSourceInfoSync } from '../lib/build/get-source-info';
import { getBranchInfo } from '../lib/git/branch-info';

export default Bluebird.resolve()
	.then(() =>
	{
		return getGitLogs()
	})
	.then(async (logs) =>
	{
		const { isMasterBranch, isVersionBranch } = getBranchInfo();

		const __pluginVersion = getSourceInfoSync().pluginMeta.version;

		const commit = logs[0];

		const bool = /^(?:build\(changelog\): update CHANGELOG|build\(cache\): update publish tags)/.test(commit.subject) || isVersionBranch && commit.subject.startsWith(`build(release): update build`);
		const bool2 = match(commit.files, 'CHANGELOG.md').length > 0;

		console.cyan.info(commit.abbrevHash, `${commit.subject}`);
		console.info(`include CHANGELOG: ${bool} , ${bool2}`);
		console.dir(commit.files.length);

		if (bool)
		{
			console.info(`更新 git tag`);

			if (isMasterBranch)
			{
				await updateRepoTag();
			}

			return updatePluginTag(__pluginVersion)
		}

		console.warn(`略過本次 git tag 更新`)
	})
	.catch((e) => console.error(e))
;
