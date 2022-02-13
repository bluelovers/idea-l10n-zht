import { lazyCommitFiles } from '../../lib/git/commit';
import { _lazyImportWithDelay } from '../../lib/util/import';
import Bluebird from 'bluebird';

export default Bluebird.mapSeries([
		'./commit-version-map',
		'./commit-link-of-zh-cn',
	] as const, lazyImport)
	.then(() =>
	{
		const list = [
			'./original-plugin',
			'./original-plugin-raw',
			'./plugin-dev-out',
			'./plugin-dev-raw',
			'./lib/static',
			'./test/__snapshots__',
			'./lib/const/link-of-zh-cn.ts',
		] as const;

		return lazyCommitFiles(list, 'build(release): update build', {
			addFlags: ['--all'],
		})
	})
	.catch(() => void 0)
;

function lazyImport(target: string)
{
	return _lazyImportWithDelay(target, __dirname)
}
