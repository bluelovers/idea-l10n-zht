import yargs from 'yargs';
import isInteractive from 'is-interactive';

/**
 * 解析下載指令的命令列參數
 * Parse command-line arguments for the download command
 *
 * 定義所有可用的命令列選項及其別名、型別與預設值，
 * 用於控制 IDE 語言包的下載行為
 * Defines all available CLI options with aliases, types, and defaults
 * to control IDE language pack download behavior
 *
 * @returns 解析後的命令列參數物件 / Parsed command-line arguments object
 */
export function parseArgvDownload()
{
	return yargs()
		.version(false)
		.option('series', {
			alias: ['s'],
			desc: `IDE 版本系列`,
			/** 字串型別，接受版本系列名稱 / String type, accepts version series name */
			string: true,
		})
		.option('version', {
			alias: ['v'],
			desc: `IDE 版本`,
			/** 字串型別，接受具體版本號 / String type, accepts specific version number */
			string: true,
		})
		.option('force', {
			alias: ['f'],
			desc: `忽略已存在下載檔案`,
			/** 布林型別，強制覆蓋已存在的檔案 / Boolean type, force overwrite existing files */
			boolean: true,
		})
		.option('all', {
			alias: ['A'],
			desc: `額外顯示非該系列最新版本`,
			/** 布林型別，顯示所有版本而非僅限最新系列 / Boolean type, show all versions not just latest series */
			boolean: true,
		})
		.option('source', {
			desc: `下載後作為語言包版本控制模式`,
			/** 布林型別，啟用語言包版本控制模式 / Boolean type, enable language pack version control mode */
			boolean: true,
		})
		.option('disable-interactive', {
			desc: `禁用互動式詢問介面`,
			/**
			 * 布林型別，禁用互動式提示。
			 * 預設在非互動環境（如 CI/CD）中自動啟用
			 * Boolean type, disable interactive prompts.
			 * Defaults to enabled in non-interactive environments (e.g., CI/CD)
			 */
			boolean: true,
			default: !isInteractive(),
		})
		.parseAsync()
}
