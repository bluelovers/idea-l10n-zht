/**
 * 建構流程的 Git 提交管理腳本
 * Git commit management script for the build pipeline
 *
 * 按順序提交建構過程中產生的各類變更檔案，確保每次建構的變更
 * 能以結構化的方式記錄在 git 歷史中。
 * Commits various artifact changes produced during the build in sequence,
 * ensuring each build's changes are recorded in git history in a structured way.
 */
import { lazyCommitFiles } from '../../lib/git/commit';
import { _lazyImportWithDelay } from '../../lib/util/import';
import Bluebird from 'bluebird';
import { getSourceInfoSync } from '../../lib/build/get-source-info';

/**
 * 先執行版本對應表與簡體中文連結資訊的提交
 * First commit version-map and zh-CN link info changes
 */
export default Bluebird.mapSeries([
		'./commit-version-map',
		'./commit-link-of-zh-cn',
	] as const, lazyImport)
	.then(async () =>
	{
		const __pluginVersion = getSourceInfoSync().pluginMeta.version;

		/**
		 * 提交原始簡體中文插件來源檔
		 * Commit original simplified Chinese plugin source files
		 */
		await lazyCommitFiles([
			'./original-plugin',
			'./original-plugin-raw',
		], `build(original): update original source ( ${__pluginVersion} )`, {
			addFlags: ['--all'],
		}).catch(() => void 0);

		/**
		 * 提交靜態快取檔案（排序後的字典表、同義詞表等）
		 * Commit static cache files (sorted dictionary tables, synonym tables, etc.)
		 */
		await lazyCommitFiles([
			'./lib/static',
		], `build(cache): update static cache`, {
			addFlags: ['--all'],
		}).catch(() => void 0);

		/**
		 * 提交版本資訊快取
		 * Commit version info cache
		 */
		await lazyCommitFiles([
			'./lib/const/link-of-zh-cn.ts',
		], `build(cache): update version info cache ( ${__pluginVersion} )`, {
			addFlags: ['--all'],
		}).catch(() => void 0);

		/**
		 * 提交測試快照檔（確保測試結果與建構版本同步）
		 * Commit test snapshot files (ensure test results are in sync with build version)
		 */
		await lazyCommitFiles([
			'./test/__snapshots__',
		], `build(test): update snapshots ( ${__pluginVersion} )`, {
			addFlags: ['--all'],
		}).catch(() => void 0);

		/**
		 * 提交開發用的原始構建檔案
		 * Commit development raw build files
		 */
		await lazyCommitFiles([
			'./plugin-dev-raw',
		], `build(release): update dev build files ( ${__pluginVersion} )`, {
			addFlags: ['--all'],
		}).catch(() => void 0);

		/**
		 * 提交插件倉庫更新清單
		 * Commit plugin repository update manifest
		 */
		await lazyCommitFiles([
			'./plugin-dev-out/updatePlugins.xml',
		], `build(release): updatePlugins.xml`, {
			addFlags: ['--all'],
		}).catch(() => void 0);

		const list = [
			'./plugin-dev-out',
		] as const;

		/** 提交所有最終構建產物 / Commit all final build artifacts */
		return lazyCommitFiles(list, `build(release): update build ( ${__pluginVersion} )`, {
			addFlags: ['--all'],
		})
	})
	.catch(() => void 0)
;

/**
 * 動態匯入指定腳本（使用延遲載入以避免循環依賴）
 * Dynamically import a script (using delayed import to avoid circular dependencies)
 *
 * @param target - 腳本的相對路徑 / Relative path of the script
 * @returns 腳本模組 / Script module
 */
function lazyImport(target: string)
{
	return _lazyImportWithDelay(target, __dirname)
}
