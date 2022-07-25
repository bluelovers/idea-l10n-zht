#!/usr/bin/env node

import { _lazyImportCore } from '../lib/util/import';
import { _handleBuild } from '../lib/cli/handle-build';

export default _lazyImportCore(import('./download-series'))
	.then(_handleBuild)
;
