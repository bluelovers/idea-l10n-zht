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
		] as const;

		await lazyCommitFiles([
			'./original-plugin',
			'./original-plugin-raw',
		], 'build(original): update original', {
			addFlags: ['--all'],
		}).catch(() => void 0);

		await lazyCommitFiles([
			'./lib/static',
			'./lib/const/link-of-zh-cn.ts',
		], 'build(cache): update cache', {
			addFlags: ['--all'],
		}).catch(() => void 0);

		await lazyCommitFiles([
			'./test/__snapshots__',
		], 'build(test): update snapshots', {
			addFlags: ['--all'],
		}).catch(() => void 0);

		await lazyCommitFiles([
			'./plugin-dev-raw',
		], 'build(release): update dev build files', {
			addFlags: ['--all'],
		}).catch(() => void 0);

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
