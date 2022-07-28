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
			desc: `下載後作為語言包版本控制模式`,
			boolean: true,
		})
		.option('disable-interactive', {
			desc: `禁用互動式詢問介面`,
			boolean: true,
			default: !isInteractive(),
		})
		.parseAsync()
}
