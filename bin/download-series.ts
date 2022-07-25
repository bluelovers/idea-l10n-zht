#!/usr/bin/env node

import { argvDownload } from '../lib/cli/argv-download';
import { _handleArgv, _handleArgvResult } from '../lib/cli/handle-argv';

export default argvDownload()
	.then(_handleArgv)
	.then(_handleArgvResult)
;
