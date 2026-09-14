import { currentBranchName } from '@git-lazy/branch';
import { __root } from '../../test/__root';
import { console } from 'debug-color2';

/**
 * 從分支名稱中解析版本資訊
 * Parse version information from branch name
 *
 * 支援兩種分支命名格式：
 * - "v1.2" 或 "v1"（主版本標籤格式）
 * - "releases/v1.2"（releases 前綴格式）
 *
 * Supported branch naming formats:
 * - "v1.2" or "v1" (version tag format)
 * - "releases/v1.2" (releases prefix format)
 *
 * @param branch - 分支名稱字串 / Branch name string
 * @returns 包含版本資訊的物件，或非版本分支的標記 / Object with version info, or marker for non-version branches
 */
export function parseVersionFromBranchName(branch: string)
{
	/**
	 * 正則表達式匹配邏輯：
	 * - 可選的 "releases/" 前綴
	 * - "v" 後接主版本號（必填）
	 * - 可選的 "." 加上次版本號
	 *
	 * Regex matching logic:
	 * - Optional "releases/" prefix
	 * - "v" followed by major version (required)
	 * - Optional "." followed by minor version
	 */
	let m = /^(?:releases\/)?v((\d+)(?:\.(?:\d+))?)$/.exec(branch);

	if (m?.[1])
	{
		return {
			/** 是否為版本分支 / Whether this is a version branch */
			isVersionBranch: true as const,
			/** 完整版本號（如 "1.2" 或 "1"）/ Full version (e.g., "1.2" or "1") */
			version: m[1],
			/** 主版本號 / Major version number */
			series: m[2],
		}
	}

	return {
		/** 是否為版本分支（非版本分支）/ Whether this is a version branch (not a version branch) */
		isVersionBranch: false as const,
	}
}

/**
 * 取得當前 Git 分支的詳細資訊
 * Get detailed information about the current Git branch
 *
 * 整合分支名稱判斷、版本解析等功能，提供統一的分支資訊物件供後續流程使用
 * Integrates branch name detection, version parsing, etc., providing a unified branch info object for downstream workflows
 *
 * @returns 分支資訊物件，包含名稱、是否主分支、版本等欄位 / Branch info object with name, master flag, version fields, etc.
 */
export function getBranchInfo()
{
	const branchName = currentBranchName(__root);

	/** 判斷是否為主分支（master 或 main）/ Check if this is the master branch (master or main) */
	const isMasterBranch = branchName === 'master' || branchName === 'main';

	const {
		version,
		series,
		isVersionBranch,
	} = parseVersionFromBranchName(branchName);

	const data = {
		/** 當前分支名稱 / Current branch name */
		branchName,
		/** 是否為主分支 / Whether this is the master branch */
		isMasterBranch,
		/** 是否為版本分支 / Whether this is a version branch */
		isVersionBranch,
		/** 版本號（僅版本分支有值）/ Version number (only set for version branches) */
		version,
		/** 主版本號（僅版本分支有值）/ Major version (only set for version branches) */
		series,
	};

	/** 輸出分支資訊至控制台以便除錯 / Log branch info to console for debugging */
	console.dir(data);

	return data;
}
