import { gitTag, gitTagSync, IOptions } from '@git-lazy/tag';
import { findRoot, findRootLazy } from '@yarn-tool/find-root';
import Bluebird from 'bluebird';
import { __plugin_zh_cn_version } from '../lib/const/link-of-zh-cn';
import { __root } from '../test/__root';
import { gitlog } from 'gitlog2';
import micromatch, { not, match } from 'micromatch';

export default Bluebird.resolve()
	.then(() =>
	{
		return gitlog({
			repo: __root,
			cwd: __root,
			number: 1,
			execOptions: {
				// 防止 git ENOBUFS 錯誤
				// https://www.cxyzjd.com/article/F_Origin/108589968
				maxBuffer: 1024 * 1024 * 100,
			},
		})
	})
	.then((logs) =>
	{
		if (match(logs[0].files, 'CHANGELOG.md').length)
		{
			return gitTag(`v${__plugin_zh_cn_version}`, {
				cwd: __root,
				forceGitTag: true,
			}, {
				printStderr: true,
			})
		}

		console.warn(`略過本次 git tag 更新`)
	})
	.catch(() => void 0)
;
