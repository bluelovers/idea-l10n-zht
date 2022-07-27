import { internalDownload } from '../lib/cli/internalDownload';
import Bluebird from 'bluebird';
import { currentBranchName } from '@git-lazy/branch';
import { __root } from '../test/__root';

export default Bluebird.resolve()
	.then(() =>
	{
		let name = currentBranchName(__root);

		if (name?.length > 0)
		{
			let m = /^v(\d+)(?:\.(?:\d+))?$/.exec(name);

			return internalDownload(m?.[1])
		}

		return internalDownload()
	})
;
