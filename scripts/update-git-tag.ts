
import { gitTag, gitTagSync, IOptions } from '@git-lazy/tag';
import { findRoot, findRootLazy } from '@yarn-tool/find-root';
import Bluebird from 'bluebird';
import { __plugin_zh_cn_version } from '../lib/const/link-of-zh-cn';

export default Bluebird.resolve()
	.then(() => {
		return findRootLazy()
	})
	.then((rootData) => {
		return gitTag(`v${__plugin_zh_cn_version}`, {
			cwd: rootData.root,
			forceGitTag: true,
		}, {
			printStderr: true,
		})
	})
;
