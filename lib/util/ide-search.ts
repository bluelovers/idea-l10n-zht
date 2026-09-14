/**
 * JetBrains IDE 安裝目錄搜尋工具
 * JetBrains IDE installation directory search utility
 *
 * 提供跨 Toolbox / Programs / JetBrains 共用目錄 / 版本目錄的 IDE 搜尋功能，
 * 避免在多個腳本中重複實作相同的目錄搜尋邏輯。
 * Provides cross-Toolbox / Programs / JetBrains shared directory / versioned directory IDE search functionality,
 * avoiding duplication of directory search logic across multiple scripts.
 */
import { join } from 'upath2';
import { homedir } from 'os';
import { existsSync } from 'node:fs';
import { async as FastGlob } from '@bluelovers/fast-glob/bluebird';

/**
 * IDE 安裝資訊，用於定義搜尋路徑的三種安裝方式
 * IDE installation info, defining three installation path search strategies
 */
export interface IIdeInstallInfo
{
	/** Toolbox 安裝路徑名稱 / Toolbox install directory name */
	toolbox: string;
	/** 基礎目錄名稱（用於 Programs 目錄下的版本搜尋）/ Base directory name (for version search under Programs) */
	base: string;
	/** Programs 安裝路徑名稱 / Programs install directory name */
	programs: string;
}

/**
 * 搜尋結果，包含找到的 IDE 目錄與插件檔案路徑
 * Search result containing the found IDE directory and plugin file path
 */
export interface IIdeSearchResult
{
	/** 找到的 IDE 安裝目錄路徑 / Found IDE installation directory path */
	ideDir: string;
	/** 插件檔案相對路徑（相對於 ideDir）/ Plugin file path (relative to ideDir) */
	pluginFilePath: string;
}

/**
 * searchIdePluginFile 的選項參數
 * Options parameter for searchIdePluginFile
 */
export interface ISearchIdePluginFileOptions
{
	/**
	 * IDE 清單，定義各 IDE 的安裝路徑名稱
	 * IDE list defining installation path names for each IDE
	 *
	 * 未提供時使用預設清單（IntelliJ IDEA、WebStorm、PyCharm）
	 * When not provided, uses default list (IntelliJ IDEA, WebStorm, PyCharm)
	 */
	ideMap?: IIdeInstallInfo[];

	/**
	 * 是否搜尋 JetBrains 共用目錄（AppData/Local/JetBrains/）
	 * Whether to search JetBrains shared directory (AppData/Local/JetBrains/)
	 *
	 * 預設為 false，僅在需要搜尋 JetBrains 共用目錄下的插件時啟用
	 * （如 ml-llm.zip 位於 WebStorm2026.2/plugins/ 下）
	 *
	 * Defaults to false; enable only when searching for plugins under
	 * the JetBrains shared directory (e.g., ml-llm.zip under WebStorm2026.2/plugins/)
	 */
	searchJetBrainsDir?: boolean;
}

/**
 * 預設 IDE 清單：IntelliJ IDEA、WebStorm、PyCharm
 * Default IDE list: IntelliJ IDEA, WebStorm, PyCharm
 */
const DEFAULT_IDE_MAP: IIdeInstallInfo[] = [
	{ toolbox: 'IntelliJ IDEA Ultimate', base: 'IntelliJIdea', programs: 'IntelliJ IDEA' },
	{ toolbox: 'WebStorm', base: 'WebStorm', programs: 'WebStorm' },
	{ toolbox: 'PyCharm Professional', base: 'PyCharm', programs: 'PyCharm' },
];

/**
 * 在 JetBrains 安裝目錄中搜尋指定插件檔案
 * Search for a specified plugin file in JetBrains installation directories
 *
 * 設計邏輯：
 * - 此函式封裝了 IDE 目錄搜尋的複雜度，支援四階段搜尋：
 *   1. Toolbox 安裝目錄
 *   2. Programs 基礎目錄（不含版本後綴）
 *   3. Programs 版本目錄（含版本後綴，如 WebStorm2024.1）
 *   4. JetBrains 共用目錄（如 AppData/Local/JetBrains/WebStorm2026.2）
 * - 透過選項物件 `{ ideMap? }` 支援未來擴充參數
 * - 回傳結構化的搜尋結果，呼叫端可決定如何使用
 *
 * Design logic:
 * - This function encapsulates IDE directory search complexity, supporting four-phase search:
 *   1. Toolbox installation directory
 *   2. Programs base directory (without version suffix)
 *   3. Programs versioned directory (with version suffix, e.g., WebStorm2024.1)
 *   4. JetBrains shared directory (e.g., AppData/Local/JetBrains/WebStorm2026.2)
 * - Uses options object `{ ideMap? }` to support future parameter extensions
 * - Returns structured search result for caller to decide how to use
 *
 * @param pluginRelativePath - 插件檔案相對路徑（如 'plugins/localization-zh/lib/localization-zh.jar'）/ Plugin file relative path
 * @param options - 搜尋選項物件 / Search options object
 * @param options.ideMap - IDE 清單（可選，預設包含 IntelliJ IDEA / WebStorm / PyCharm）/ IDE list (optional, defaults to IntelliJ IDEA / WebStorm / PyCharm)
 * @param options.searchJetBrainsDir - 是否搜尋 JetBrains 共用目錄（預設 false）/ Whether to search JetBrains shared directory (default false)
 * @returns 搜尋結果，未找到時回傳 null / Search result, or null if not found
 */
export async function searchIdePluginFile(
	pluginRelativePath: string,
	options: ISearchIdePluginFileOptions = {},
): Promise<IIdeSearchResult | null>
{
	const ideMap = options.ideMap ?? DEFAULT_IDE_MAP;

	const homeDir = homedir();
	const jetBrainsDir = join(homeDir, 'AppData/Local', 'JetBrains');
	const toolboxDir = join(jetBrainsDir, 'Toolbox');

	/**
	 * 第一階段：搜尋 JetBrains Toolbox 安裝目錄
	 * Phase 1: Search JetBrains Toolbox installation directories
	 */
	for (const ide of ideMap)
	{
		const temp = join(toolboxDir, ide.toolbox);

		if (existsSync(join(temp, pluginRelativePath)))
		{
			return { ideDir: temp, pluginFilePath: pluginRelativePath };
		}
	}

	const programsDir = join(homeDir, 'AppData/Local', 'Programs');

	/**
	 * 第二階段：搜尋 Programs 基礎目錄（不含版本後綴）
	 * Phase 2: Search Programs base directories (without version suffix)
	 */
	for (const ide of ideMap)
	{
		const temp = join(programsDir, ide.programs);

		if (existsSync(join(temp, pluginRelativePath)))
		{
			return { ideDir: temp, pluginFilePath: pluginRelativePath };
		}
	}

	/**
	 * 第三階段：搜尋 Programs 版本目錄（含版本後綴，如 WebStorm2024.1）
	 * Phase 3: Search Programs versioned directory-name entries (e.g., WebStorm2026.2)
	 *
	 * 以 ideMap 中的 programs 名稱加上 FastGlob 萬用字元，
	 * 準確匹配「{idename}{version}」格式的目錄名稱（如 WebStorm2026.2），
	 * 而非無差別搜尋所有目錄。
	 *
	 * Uses the programs name from ideMap with FastGlob wildcard to precisely
	 * match directory names in "{idename}{version}" format (e.g., WebStorm2026.2),
	 * rather than indiscriminately searching all directories.
	 */
	for (const ide of ideMap)
	{
		const dirs = await FastGlob<string>([`${ide.programs}*`], {
			cwd: programsDir,
			onlyFiles: false,
			suppressErrors: true,
		});

		for (const dir of dirs)
		{
			/** 跳過基礎目錄名稱本身（已在第二階段搜尋過）/ Skip the base directory name itself (already searched in Phase 2) */
			if (dir === ide.programs)
			{
				continue;
			}

			const temp = join(programsDir, dir);

			if (existsSync(join(temp, pluginRelativePath)))
			{
				return { ideDir: temp, pluginFilePath: pluginRelativePath };
			}
		}
	}

	/**
	 * 第四階段：搜尋 JetBrains 共用目錄（如 AppData/Local/JetBrains/WebStorm2026.2）
	 * Phase 4: Search JetBrains shared directory (e.g., AppData/Local/JetBrains/WebStorm2026.2)
	 *
	 * 需設定 searchJetBrainsDir: true 才會執行，
	 * 因為此目錄為非標準安裝路徑，僅特定插件（如 ml-llm）位於此處。
	 *
	 * Only executes when searchJetBrainsDir: true is set,
	 * as this is a non-standard install path; only certain plugins (e.g., ml-llm) are located here.
	 */
	if (options.searchJetBrainsDir)
	{
		for (const ide of ideMap)
		{
			const dirs = await FastGlob<string>([`${ide.base}*`], {
				cwd: jetBrainsDir,
				onlyFiles: false,
				suppressErrors: true,
			});

			for (const dir of dirs)
			{
				const temp = join(jetBrainsDir, dir);

				if (existsSync(join(temp, pluginRelativePath)))
				{
					return { ideDir: temp, pluginFilePath: pluginRelativePath };
				}
			}
		}
	}

	return null;
}
