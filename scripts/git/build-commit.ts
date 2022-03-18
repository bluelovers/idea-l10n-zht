import { lazyCommitFiles } from '../../lib/git/commit';
import { _lazyImportWithDelay } from '../../lib/util/import';
import Bluebird from 'bluebird';

export default Bluebird.mapSeries([
		'./commit-version-map',
		'./commit-link-of-zh-cn',
	] as const, lazyImport)
	.then(async () =>
	{
		const list = [
			'./plugin-dev-out',
			'./plugin-dev-raw',
		] as const;

		await lazyCommitFiles([
			'./original-plugin',
			'./original-plugin-raw',
		], 'build(original): update original', {
			addFlags: ['--all'],
		});

		await lazyCommitFiles([
			'./lib/static',
			'./lib/const/link-of-zh-cn.ts',
		], 'build(cache): update cache', {
			addFlags: ['--all'],
		});

		await lazyCommitFiles([
			'./test/__snapshots__',
		], 'build(test): update snapshots', {
			addFlags: ['--all'],
		});

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
