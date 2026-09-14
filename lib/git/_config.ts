
import { __root } from '../../test/__root';

/**
 * Git 指令共用選項設定
 * Shared options for Git command execution
 *
 * 所有 Git 操作共用的基礎配置，確保一致的執行環境與錯誤處理行為
 * Base configuration shared by all Git operations to ensure consistent execution environment and error handling behavior
 */
export const opts = {
	/** Git 指令的工作目錄 / Working directory for Git commands */
	cwd: __root,
	/** 指令失敗時是否拋出異常 / Whether to throw an error when command fails */
	throwError: true,
	/** 是否將 stderr 輸出至控制台 / Whether to print stderr to console */
	printStderr: true,
	/** 子程序的標準輸入輸出配置 / stdio configuration for child process */
	stdio: 'inherit',
} as const;
