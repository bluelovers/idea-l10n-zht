#!/usr/bin/env node

import { parseArgvDownload } from '../lib/cli/parse-argv-download';
import { _handleArgv, _handleArgvResult } from '../lib/cli/handle-argv';

export default parseArgvDownload()
	.then(_handleArgv)
	.then(_handleArgvResult)
;
