import { internalDownload } from '../lib/cli/internalDownload';
import Bluebird from 'bluebird';
import { getBranchInfo } from '../lib/git/branch-info';

export default Bluebird.resolve()
	.then(() =>
	{
		const { series } = getBranchInfo();

		return internalDownload(series)
	})
;
