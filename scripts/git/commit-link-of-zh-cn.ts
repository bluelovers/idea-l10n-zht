/**
 * 提交簡體中文版連結資訊的變更
 * Commit changes to the zh-CN link information
 *
 * 當 link-of-zh-cn.ts（包含簡體中文版的下載連結與版本資訊）有變更時，
 * 自動建立 git commit。
 * When link-of-zh-cn.ts (containing zh-CN download links and version info) changes,
 * automatically create a git commit.
 *
 * @see 錯誤靜默處理 - commit 失敗不中斷 pipeline / Error silently ignored - commit failure does not break the pipeline
 */
import { lazyCommitFiles } from '../../lib/git/commit';

export default lazyCommitFiles('./lib/const/link-of-zh-cn.ts', 'build(cache): update link-of-zh-cn.ts')
	.catch(() => void 0)
;
