import yargs from 'yargs';
import isInteractive from 'is-interactive';

export function parseArgvDownload()
{
	return yargs
		.version(false)
		.option('series', {
			alias: ['s'],
			desc: `IDE 版本系列`,
			string: true,
		})
		.option('version', {
			alias: ['v'],
			desc: `IDE 版本`,
			string: true,
		})
		.option('force', {
			alias: ['f'],
			desc: `忽略已存在下載檔案`,
			boolean: true,
		})
		.option('all', {
			alias: ['A'],
			desc: `額外顯示非該系列最新版本`,
			boolean: true,
		})
		.option('source', {
			boolean: true,
		})
		.option('disable-interactive', {
			boolean: true,
			default: !isInteractive(),
		})
		.parseAsync()
}
