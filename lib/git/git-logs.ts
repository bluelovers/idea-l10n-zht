import { gitlog } from 'gitlog2';
import { __root } from '../../test/__root';

export function getGitLogs(number?: number)
{
	number ||= 1;
	return gitlog({
		repo: __root,
		cwd: __root,
		number,
		execOptions: {
			// 防止 git ENOBUFS 錯誤
			// https://www.cxyzjd.com/article/F_Origin/108589968
			maxBuffer: 1024 * 1024 * 100,
		},
	})
}
