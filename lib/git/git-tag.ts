import { versionToParts } from "@lazy-node/semver-part";
import { gitTag } from '@git-lazy/tag';
import { __root } from '../../test/__root';
import { opts } from './_config';
import Bluebird from 'bluebird';
import { join } from 'upath2';
import { crossSpawnGitAsync } from '@git-lazy/spawn';
import { pathToFileURL } from 'node:url';

/**
 * 更新插件版本的 Git 標籤
 * Update plugin version Git tags
 *
 * 同時建立主版本號標籤（如 v1）與完整版本號標籤（如 v1.2.3），
 * 確保兩者都指向同一個 commit，方便追蹤版本發布歷史
 * Creates both a major version tag (e.g., v1) and a full version tag (e.g., v1.2.3),
 * ensuring both point to the same commit for easy release history tracking
 *
 * @param version - 完整版本號，如 "1.2.3" / Full version string, e.g. "1.2.3"
 * @param push - 是否同步推送到遠端倉庫 / Whether to push to remote repository
 * @returns 依序建立的標籤操作結果陣列 / Array of tag creation results in sequence
 */
export function updatePluginTag(version: string, push?: boolean)
{
	/** 從版本號中提取主版本號作為系列標籤 / Extract major version number for series tag */
	const series = versionToParts(version)[0];

	/**
	 * 依序建立主版本標籤和完整版本標籤
	 * Sequentially create major version tag and full version tag
	 *
	 * 使用 Bluebird.mapSeries 確保標籤按順序建立，避免並發衝突
	 * Uses Bluebird.mapSeries to ensure tags are created sequentially to avoid concurrency conflicts
	 */
	return Bluebird.mapSeries([
		`v${series}`,
		`v${version}`,
	], async (tag) =>
	{
		/** 建立 Git 標籤，若已存在則強制覆蓋 / Create Git tag, force overwrite if already exists */
		const ret = await gitTag(tag, {
			cwd: __root,
			forceGitTag: true,
		}, opts);

		/**
		 * 若指定了 push，將標籤強制推送到遠端
		 * If push is specified, force push tag to remote
		 *
		 * 使用 --force 是因為版本更新可能需要重新指向新的 commit
		 * Uses --force because version updates may need to point to a new commit
		 */
		if (push)
		{
			await crossSpawnGitAsync('git', [
				'push',
				'origin',
				'--force',
				`refs/tags/${tag}`,
			], opts)
		}

		return ret;
	})
}

/**
 * 建立 Changelog 專用的發佈標籤
 * Create a publish tag for changelog purposes
 *
 * 以 "套件名稱@版本號" 格式建立標籤，用於在 changelog 中定位特定版本的發佈點
 * Creates a tag in "package@version" format, used to locate specific release points in changelog
 *
 * @returns 標籤建立的操作結果 / Tag creation operation result
 */
export function updateRepoTag()
{
	return Bluebird
		/**
		 * 動態匯入 package.json 取得套件名稱與版本號
		 * Dynamically import package.json to get package name and version
		 *
		 * 使用 pathToFileURL 轉換路徑以確保跨平台相容性（Windows 路徑需轉為 file:// URL）
		 * Uses pathToFileURL to convert path for cross-platform compatibility (Windows paths need file:// URL)
		 */
		.resolve(import(pathToFileURL(join(__root, 'package.json')).href))
		.then(({
			name, version,
		}) => gitTag(`${name}@${version}`, {
			cwd: __root,
			forceGitTag: true,
		}, opts))
		;
}
