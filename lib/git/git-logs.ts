import { gitlog } from 'gitlog2';
import { __root } from '../../test/__root';

/**
 * 取得 Git 提交歷史記錄
 * Get Git commit history
 *
 * 包裝 gitlog2 函式庫，提供簡化的介面來查詢指定數量的最新提交記錄
 * Wraps the gitlog2 library to provide a simplified interface for querying the latest commit records
 *
 * @param number - 取得的提交記錄數量，預設為 1 / Number of commit records to retrieve, defaults to 1
 * @returns 提交記錄物件陣列 / Array of commit record objects
 */
export function getGitLogs(number?: number)
{
	/** 確保至少取得一筆記錄 / Ensure at least one record is retrieved */
	number ||= 1;
	return gitlog({
		repo: __root,
		cwd: __root,
		number,
		execOptions: {
			/**
			 * 設定較大的 maxBuffer 以防止大型倉庫觸發 git ENOBUFS 錯誤
			 * Set a larger maxBuffer to prevent git ENOBUFS errors on large repositories
			 *
			 * 參考：https://www.cxyzjd.com/article/F_Origin/108589968
			 * Reference: https://www.cxyzjd.com/article/F_Origin/108589968
			 */
			// 防止 git ENOBUFS 錯誤
			// https://www.cxyzjd.com/article/F_Origin/108589968
			maxBuffer: 1024 * 1024 * 100,
		},
	})
}
