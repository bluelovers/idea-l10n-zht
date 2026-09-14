/**
 * CI 發佈後處理腳本
 * CI post-publish processing script
 *
 * 在 CI/CD pipeline 發佈後執行，負責：
 * 1. 在 master 分支上生成 updatePlugins.xml 並提交
 * 2. 比對 git 差異，偵測 JAR 檔案是否有變化
 * 3. 若有變化，更新 CHANGELOG 和 publish-tags
 * 4. 將所有變更提交至 git
 *
 * Executed after CI/CD pipeline publish, responsible for:
 * 1. Generating and committing updatePlugins.xml on master branch
 * 2. Comparing git diffs to detect JAR file changes
 * 3. Updating CHANGELOG and publish-tags if changes exist
 * 4. Committing all changes to git
 */
import { gitDiffFrom } from 'git-diff-from';
import { __ROOT } from '../__root';
import { gitlog } from 'gitlog2';
import Bluebird from 'bluebird';
import micromatch, { not, match } from 'micromatch';
import { updateChangelogByCwd } from '@yarn-tool/changelog';
import { console } from 'debug-color2';
import { getGitLogs } from '../lib/git/git-logs';
import { lazyCommitFiles } from '../lib/git/commit';
import { outputFile, outputJSON, readJSON } from 'fs-extra';
import { __file_publish_tags_json } from '../lib/const';
import { array_unique_overwrite } from 'array-hyper-unique';
import { LF } from 'crlf-normalize';
import { getSourceInfoSync } from '../lib/build/get-source-info';
import { getBranchInfo } from '../lib/git/branch-info';
import { updatePublishTags } from '../lib/git/update-publish-tags';
import { _lazyImportCore, _lazyImportWithDelay } from '../lib/util/import';
import { join } from 'path';
import { pathToFileURL } from 'url';

/**
 * 動態匯入指定腳本
 * Dynamically import a specified script
 *
 * @param target - 腳本的相對路徑 / Relative path of the script
 * @returns 腳本模組 / Script module
 */
function lazyImport(target: string)
{
	// @ts-ignore
	const final = new URL(target, import.meta.url).href;

	console.log(`import: ${final}`);

	return _lazyImportCore(import(final))
}

export default Bluebird.resolve((process.env as any).GITHUB_SHA as string)
	.then(async (from) =>
	{
		const { isMasterBranch } = getBranchInfo();

		from ||= 'origin/master';

		console.dir({
			from,
			isMasterBranch,
		});

		/**
		 * master 分支需先更新 updatePlugins.xml
		 * Master branch needs to update updatePlugins.xml first
		 */
		if (isMasterBranch)
		{
			await lazyImport('./jetbrains/create-jetbrains-update-plugins-xml.ts');

			await lazyCommitFiles([
				'./plugin-dev-out/updatePlugins.xml',
			], `build(release): updatePlugins.xml`, {
				addFlags: ['--all'],
			}).catch(() => void 0);
		}

		//from = '2d01cffc5da15e0a34a40b40ec3b7d0cc7612dda';

		const latestLog = getGitLogs()[0]

		let to = latestLog.hash;

		console.log(`input`);

		console.dir({
			from,
			to,
			head: {
				subject: latestLog.subject,
			},
		});

		return Bluebird.props({
			info: gitDiffFrom(from, to, {
				cwd: __ROOT,
			}),
			latestLog,
		})
	})
	.then(async ({
		info,
		latestLog,
	}) =>
	{

		/**
		 * 過濾掉不需要關注的檔案變更：
		 * - CHANGELOG.md、test、docs、coverage 等非建構產物
		 * - 以 . 開頭的隱藏檔和所有副檔名的根目錄檔案
		 *
		 * Filter out file changes that don't need attention:
		 * - CHANGELOG.md, test, docs, coverage etc. (not build artifacts)
		 * - Hidden files starting with . and root-level files with extensions
		 */
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

		/** 檢查 from 和 to 的 hash 是否相同（遠端與本地無差異）/ Check if from and to hashes are the same (no remote vs local difference) */
		const isSameHash = info.from === info.to;
		/** 檢查最新 commit 是否為 release build 類型 / Check if the latest commit is a release build type */
		const isBuildCommit = /^build\(release\): (updatePlugins\.xml|update build)/.test(latestLog.subject);

		const result = {
			from: info.from,
			to: info.to,
			changed: files.length,
			isSameHash,
			isBuildCommit,
		};

		console.dir(result);

		/**
		 * 當 git 沒有差異時，若非 build commit 則直接結束；
		 * 若為 build commit 則嘗試從 commit 的檔案清單中偵測 JAR 變化
		 * When git has no diff, exit directly if not a build commit;
		 * if it is a build commit, try to detect JAR changes from the commit's file list
		 */
		if (isSameHash)
		{
			console.error(`git 沒有變化 或 遠端與本地無法比對差異`)

			if (!isBuildCommit)
			{
				return
			}

			console.yellow.warn(`前次任務可能未正確執行 CHANGELOG，嘗試檢測差異列表`)
		}

		/**
		 * 判斷是否需要更新 CHANGELOG：
		 * 優先使用 diff 的檔案清單，若為空且為 build commit 則使用 commit 的檔案清單
		 *
		 * Determine whether to update CHANGELOG:
		 * Prefer diff file list; if empty and it's a build commit, use the commit's file list
		 */
		let _do = await Promise.resolve().then(() =>
		{
			let _files: string[];

			if (files.length)
			{
				if (includeJar(files))
				{
					_files = files
				}
			}
			else if (isBuildCommit && includeJar(latestLog.files))
			{
				_files = latestLog.files
			}

			if (typeof _files?.length === 'number')
			{
				if (_files.length < 10)
				{
					console.log(`files`);
					console.dir(_files);
				}

				return true
			}

			return false;
		});

		if (_do)
		{
			const { isMasterBranch } = getBranchInfo();

			/** 僅在 master 分支上更新 CHANGELOG / Only update CHANGELOG on master branch */
			if (isMasterBranch)
			{
				await updateChangelogByCwd(__ROOT, {
					type: 'independent',
				});
			}

			const __pluginVersion = getSourceInfoSync().pluginMeta.version;

			/** 更新發佈標籤清單 / Update publish tags list */
			await updatePublishTags();

			await lazyCommitFiles([
				'./CHANGELOG.md',
			], `build(changelog): update CHANGELOG ( ${__pluginVersion} )`).catch(() => void 0);

			await lazyCommitFiles([
				'./lib/const/publish-tags.json',
			], `build(cache): update publish tags`).catch(() => void 0);
		}
		else
		{
			console.warn(`編譯版本沒有任何變化`)
		}

		return result
	})
//.tap(console.dir)
;

/**
 * 檢查檔案清單中是否包含構建產物 JAR 檔案
 * Check if the file list contains build artifact JAR files
 *
 * @param files - 待檢查的檔案路徑陣列 / Array of file paths to check
 * @returns 是否包含 plugin-dev-out 目錄下的 JAR 檔案 / Whether JAR files in plugin-dev-out directory exist
 */
function includeJar(files: string[])
{
	return micromatch(files, [
		'plugin-dev-out/*.jar',
	]).length > 0
}
