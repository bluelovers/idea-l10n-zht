import { lazyCommitFiles } from '../../lib/git/commit';
import { _lazyImportWithDelay } from '../../lib/util/import';
import Bluebird from 'bluebird';

export default Bluebird.mapSeries([
		'./commit-version-map',
		'./commit-link-of-zh-cn',
	] as const, lazyImport)
	.then(async () =>
	{
		const { __plugin_zh_cn_version } = await import('../../lib/const/link-of-zh-cn');

		await lazyCommitFiles([
			'./original-plugin',
			'./original-plugin-raw',
		], `build(original): update original source ( ${__plugin_zh_cn_version} )`, {
			addFlags: ['--all'],
		}).catch(() => void 0);

		await lazyCommitFiles([
			'./lib/static',
		], `build(cache): update static cache`, {
			addFlags: ['--all'],
		}).catch(() => void 0);

		await lazyCommitFiles([
			'./lib/const/link-of-zh-cn.ts',
		], `build(cache): update version info cache ( ${__plugin_zh_cn_version} )`, {
			addFlags: ['--all'],
		}).catch(() => void 0);

		await lazyCommitFiles([
			'./test/__snapshots__',
		], `build(test): update snapshots ( ${__plugin_zh_cn_version} )`, {
			addFlags: ['--all'],
		}).catch(() => void 0);

		await lazyCommitFiles([
			'./plugin-dev-raw',
		], `build(release): update dev build files ( ${__plugin_zh_cn_version} )`, {
			addFlags: ['--all'],
		}).catch(() => void 0);

		const list = [
			'./plugin-dev-out',
		] as const;

		return lazyCommitFiles(list, `build(release): update build ( ${__plugin_zh_cn_version} )`, {
			addFlags: ['--all'],
		})
	})
	.catch(() => void 0)
;

function lazyImport(target: string)
{
	return _lazyImportWithDelay(target, __dirname)
}
