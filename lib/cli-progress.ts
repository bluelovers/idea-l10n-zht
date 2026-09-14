import { ensureDirSync } from 'fs-extra';
import { join } from 'path';
// @ts-ignore
import progressEstimator from 'progress-estimator';
import { findPkgModuleCachePathCore } from 'cache-path/lib/finder/findPkgModuleCachePath';
import { __root } from '../test/__root';
import { MultiBar, Presets, SingleBar } from 'cli-progress';
import { gray, green, yellow } from 'ansi-colors';

/**
 * 建立 progress-estimator 進度追蹤器
 * Create progress-estimator progress tracker
 *
 * 使用模組快取路徑作為進度資料的儲存位置，
 * 確保不同專案實例之間的進度資料不會互相干擾
 * Uses the module cache path as storage location for progress data,
 * ensuring progress data between different project instances does not interfere with each other
 *
 * @param root - 專案根目錄路徑（用於定位模組快取路徑）/ Project root path (used to locate module cache path)
 * @returns progress-estimator 實例 / progress-estimator instance
 */
export function createProgressEstimator(root: string)
{
	/**
	 * 組合模組快取路徑與進度追蹤器專屬子目錄
	 * Combine module cache path with progress-tracker-specific subdirectory
	 */
	const storagePath = join(findPkgModuleCachePathCore(root), '.progress-estimator');

	/** 確保儲存目錄存在 / Ensure storage directory exists */
	ensureDirSync(storagePath);

	return progressEstimator({
		// All configuration keys are optional, but it's recommended to specify a storage location.
		storagePath,
	});
}

/**
 * 建立多列進度條（用於同時追蹤多個翻譯任務）
 * Create multi-line progress bar (for tracking multiple translation tasks simultaneously)
 *
 * 使用 ANSI 色彩與 Unicode 方塊字元顯示進度，
 * 適用於批量翻譯外掛時同時顯示多個任務的進度
 * Uses ANSI colors and Unicode block characters to display progress,
 * suitable for showing multiple task progress simultaneously during batch plugin translation
 *
 * @returns 配置完成的 MultiBar 實例 / Configured MultiBar instance
 */
export function createMultiBar()
{
	return new MultiBar({
		clearOnComplete: false,
		hideCursor: true,

		/** 完成區段使用實心方塊 / Completed section uses solid block */
		barCompleteChar: '\u2588',
		/** 未完成區段使用半透明方塊 / Incomplete section uses light block */
		barIncompleteChar: '\u2591',

		/** 進度條格式：綠色進度條 + 黃色百分比 + 灰色時間 + 檔案名稱 / Progress bar format: green bar + yellow percentage + gray time + filename */
		format: `${green('{bar}')} ${yellow('{percentage}%')} | ${gray('{duration_formatted}')} | {filename}`,

		/** 進度條寬度（字元數）/ Progress bar width (character count) */
		barsize: 10,

	}, Presets.shades_classic);
}

/**
 * 建立單列進度條並立即啟動
 * Create single-line progress bar and start immediately
 *
 * 適用於追蹤單一翻譯任務的進度
 * Suitable for tracking progress of a single translation task
 *
 * @param total - 進度條總量 / Total value for the progress bar
 * @param startValue - 初始值 / Initial value
 * @param payload - 附加資料（如檔案名稱）/ Additional data (e.g., filename)
 * @returns 已啟動的 SingleBar 實例 / Started SingleBar instance
 */
export function createSingleBar(total: number, startValue: number, payload?: any)
{
	const bar = new SingleBar({
		clearOnComplete: false,
		hideCursor: true,

		/** 完成區段使用實心方塊 / Completed section uses solid block */
		barCompleteChar: '\u2588',
		/** 未完成區段使用半透明方塊 / Incomplete section uses light block */
		barIncompleteChar: '\u2591',

		/** 進度條格式：綠色進度條 + 黃色百分比 + 灰色時間 + 檔案名稱 / Progress bar format: green bar + yellow percentage + gray time + filename */
		format: `${green('{bar}')} ${yellow('{percentage}%')} | ${gray('{duration_formatted}')} | {filename}`,

		/** 進度條寬度（字元數）/ Progress bar width (character count) */
		barsize: 10,

	}, Presets.shades_classic);

	bar?.start(total, startValue, payload);

	return bar
}

/**
 * 全域 CLI 進度追蹤器實例
 * Global CLI progress tracker instance
 *
 * 使用 __root 初始化，供整個翻譯流程共用
 * Initialized with __root, shared across the entire translation workflow
 */
export const cli_logger = createProgressEstimator(__root);
