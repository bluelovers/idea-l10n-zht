import { lazyCommitFiles } from '../../lib/git/commit';

export default lazyCommitFiles('./lib/const/version-map.json', 'build(cache): update version-map')
	.catch(() => void 0)
;
