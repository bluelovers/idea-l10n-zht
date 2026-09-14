/**
 * 提交版本對應表的變更
 * Commit changes to the version map
 *
 * 當版本對應表 (version-map.json) 有變更時，自動建立 git commit，
 * commit message 遵循 Conventional Commits 格式。
 * When the version map (version-map.json) has changes, automatically create a git commit
 * with a commit message following the Conventional Commits format.
 *
 * @see 錯誤靜默處理 - commit 失敗不中斷 pipeline / Error silently ignored - commit failure does not break the pipeline
 */
import { lazyCommitFiles } from '../../lib/git/commit';

export default lazyCommitFiles('./lib/const/version-map.json', 'build(cache): update version-map')
	.catch(() => void 0)
;
