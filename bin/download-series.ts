#!/usr/bin/env node

import { parseArgvDownload } from '../lib/cli/parse-argv-download';
import { _handleArgv, _handleArgvResult } from '../lib/cli/handle-argv';

export default parseArgvDownload()
	.then(async _ => {

		await import('../scripts/fetch-latest-version-of-zh-cn').then(m => m.default);

		return _;
	})
	.then(_handleArgv)
	.then(_handleArgvResult)
;
