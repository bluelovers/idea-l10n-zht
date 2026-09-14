import { join } from 'upath2';
import { pathExists, readFile } from 'fs-extra';
import { matcher } from 'micromatch';
import { array_unique_overwrite } from 'array-hyper-unique';

/**
 * 路徑片段元組類型（至少包含一個路徑片段）
 * Tuple type for path segments (must contain at least one segment)
 */
export type IPaths = [string, ...string[]];

/**
 * 合併路徑的選項介面
 * Options interface for mergePaths
 */
export interface IOptionsMergePaths
{
	/** 需忽略的 glob 模式陣列 / Array of glob patterns to ignore */
	ignore?: string[],
}

/**
 * 預設忽略的目錄模式（目前已全部停用）
 * Default ignore patterns for directories (currently all disabled)
 *
 * 這些目錄在早期翻譯流程中曾被排除，
 * 目前保留作為歷史參考
 * These directories were excluded in earlier translation workflows,
 * retained now as historical reference
 */
export const defaultIgnore = [
	//'search/**/*',
	//'intentionDescriptions/**/*',
	//'postfixTemplates/**/*',
] as const;

/**
 * 合併多個外掛目錄的路徑解析工具
 * Path resolution utility for merging multiple plugin directories
 *
 * 提供在多個來源目錄中查找檔案的能力，支援 glob 模式過濾。
 * 主要用於本地化流程中，從多個外掛版本目錄合併檔案路徑
 * Provides ability to search for files across multiple source directories with glob pattern filtering.
 * Primarily used in the localization workflow to merge file paths from multiple plugin version directories
 *
 * @param dirs - 要搜尋的目錄路徑陣列（會自動去重）/ Array of directory paths to search (auto-deduplicated)
 * @param options - 合併選項，可指定忽略模式 / Merge options, can specify ignore patterns
 * @returns 包含 getPath、readPathFile、isMatch 的工具物件 / Utility object containing getPath, readPathFile, isMatch
 */
export function mergePaths(dirs: string[], options?: IOptionsMergePaths)
{
	/**
	 * 建立 glob 匹配器，套用預設或自訂的忽略模式
	 * Create glob matcher with default or custom ignore patterns
	 */
	const isMatch = matcher('**/*', {
		ignore: options?.ignore ?? defaultIgnore,
	});

	/**
	 * 去除目錄陣列中的重複項，確保不會重複搜尋相同目錄
	 * Deduplicate directory array to avoid searching the same directory twice
	 */
	dirs = array_unique_overwrite(dirs);

	/**
	 * 從多個目錄中查找第一個存在的檔案路徑
	 * Find the first existing file path across multiple directories
	 *
	 * 按照 dirs 陣列的順序逐一檢查，返回第一個找到的完整路徑
	 * Checks directories in order of the dirs array, returns the first full path found
	 *
	 * @param paths - 要查找的相對路徑片段 / Relative path segments to search for
	 * @returns 找到的完整檔案路徑，若未匹配則返回 undefined / Full file path if found, or undefined if not matched
	 */
	const getPath = async (...paths: IPaths) =>
	{
		const file = join(...paths);

		/**
		 * 只有在 glob 模式匹配時才進行檔案搜尋
		 * Only search for files when the glob pattern matches
		 */
		if (isMatch(file))
		{
			/**
			 * 逐一檢查每個目錄，返回第一個存在的檔案完整路徑
			 * Check each directory in order, return the full path of the first existing file
			 */
			for (const dir of dirs)
			{
				const fullpath = join(dir, file);

				if (await pathExists(fullpath))
				{
					return fullpath
				}
			}

			/**
			 * 所有目錄均未找到該檔案時拋出錯誤
			 * Throw error when file is not found in any directory
			 */
			throw new Error(file)
		}
	};

	/**
	 * 查找並讀取檔案內容的便捷方法
	 * Convenience method to find and read file contents
	 *
	 * @param paths - 要讀取的相對路徑片段 / Relative path segments to read
	 * @returns 檔案內容，若未匹配則返回 false / File contents, or false if not matched
	 */
	const readPathFile = (...paths: IPaths) => getPath(...paths).then(file => file?.length && readFile(file));

	return {
		/** 查找檔案路徑的函式 / Function to find file path */
		getPath,
		/** 查找並讀取檔案的函式 / Function to find and read file */
		readPathFile,
		/** glob 模式匹配器 / Glob pattern matcher */
		isMatch,
	}
}
