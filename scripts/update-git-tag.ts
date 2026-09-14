/**
 * 根據最新提交更新 Git 標籤 (Git Tag)
 * Update Git tags based on the latest commit
 *
 * 判斷最新的 commit 是否為 changelog 或 release 相關提交，
 * 若是則更新對應的 Git 標籤（master 分支同時更新 repo 標籤）。
 * Checks whether the latest commit is related to changelog or release,
 * and updates corresponding Git tags if so (repo tag updated on master branch).
 */
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

		/**
		 * 判斷是否需要更新標籤：
		 * - commit subject 符合 changelog 或 publish tags 的更新模式
		 * - 或者在版本分支上且為 release build 提交
		 * Determine whether to update tags:
		 * - commit subject matches changelog or publish tags update pattern
		 * - OR on a version branch with a release build commit
		 */
		const bool = /^(?:build\(changelog\): update CHANGELOG|build\(cache\): update publish tags)/.test(commit.subject) || isVersionBranch && commit.subject.startsWith(`build(release): update build`);
		const bool2 = match(commit.files, 'CHANGELOG.md').length > 0;

		console.cyan.info(commit.abbrevHash, `${commit.subject}`);
		console.info(`include CHANGELOG: ${bool} , ${bool2}`);
		console.dir(commit.files.length);

		if (bool)
		{
			console.info(`更新 git tag`);

			/**
			 * master 分支需同時更新 repo 級別的標籤（供整體專案識別最新版本）
			 * Master branch also needs repo-level tag update (for identifying latest version of the whole project)
			 */
			if (isMasterBranch)
			{
				await updateRepoTag();
			}

			return updatePluginTag(__pluginVersion, true)
		}

		console.warn(`略過本次 git tag 更新`)
	})
	.catch((e) => console.error(e))
;
