import { crossSpawnGitAsync } from '@git-lazy/spawn';
import { opts } from './_config';
import { ITSArrayListMaybeReadonly, ITSValueOrArrayMaybeReadonly } from 'ts-type/lib/type/base';
import { ISpawnGitAsyncOptions } from '@git-lazy/spawn/lib/types';
import { console } from 'debug-color2';

/**
 * 將指定檔案加入 Git 暫存區並提交
 * Add specified files to Git staging area and commit
 *
 * 執行兩階段操作：先 git add 將檔案加入暫存區，再 git commit 提交變更。
 * 這種分離設計允許在 add 和 commit 之間保留彈性（如自訂 addFlags）
 * Performs two-stage operation: first git add to stage files, then git commit to commit changes.
 * This separation design allows flexibility between add and commit (e.g., custom addFlags)
 *
 * @param files - 要提交的檔案路徑，支援陣列或單一字串 / File paths to commit, supports array or single string
 * @param commitMessage - 提交訊息 / Commit message
 * @param config - 可選的附加設定 / Optional additional configuration
 * @param config.addFlags - git add 的額外參數陣列 / Additional flags for git add
 * @param.config.options - 覆蓋預設的 spawn 選項 / Override default spawn options
 * @returns 兩階段操作完成的 Promise / Promise that resolves when both stages complete
 */
export function lazyCommitFiles(files: ITSValueOrArrayMaybeReadonly<string>, commitMessage: string, config?: {
	addFlags?: ITSArrayListMaybeReadonly<string>,
	options?: ISpawnGitAsyncOptions,
})
{
	/** 統一處理檔案路徑格式，確保為陣列 / Normalize file path format to array */
	files = [files].flat();
	config ??= {};

	/**
	 * 合併預設選項與自訂選項
	 * Merge default options with custom options
	 *
	 * 自訂選項會覆蓋預設選項，允許對特定提交調整設定
	 * Custom options override defaults, allowing per-commit configuration adjustments
	 */
	const options: ISpawnGitAsyncOptions = {
		...opts,
		...config.options,
	};

	const addFlags = config.addFlags ?? [];

	/**
	 * 第一階段：將檔案加入 Git 暫存區
	 * Stage 1: Add files to Git staging area
	 *
	 * 組裝 git add 指令參數，包含自訂的 addFlags 和目標檔案
	 * Assemble git add command arguments, including custom addFlags and target files
	 */
	let args = [
		'add',
		...addFlags,
		...files,
	];

	console.cyan.info('git', ...args);

	return crossSpawnGitAsync('git', args, options)
		.then(() =>
		{
			/**
			 * 第二階段：提交暫存區的變更
			 * Stage 2: Commit staged changes
			 *
			 * 使用 -m 參數直接指定提交訊息，並附帶檔案清單作為參照
			 * Uses -m flag to specify commit message directly, with file list as reference
			 */
			args = [
				'commit',
				'-m',
				commitMessage,
				...files,
			];

			console.cyan.info('git', ...args);

			return crossSpawnGitAsync('git', args, options)
		})
		;
}
