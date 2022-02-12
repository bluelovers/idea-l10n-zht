import { lazyCommitFiles } from '../../lib/git/commit';

export default lazyCommitFiles('./lib/const/link-of-zh-cn.ts', 'build(cache): update link-of-zh-cn.ts')
	.catch(() => void 0)
;
