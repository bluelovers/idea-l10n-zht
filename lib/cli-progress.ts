import { ensureDirSync } from 'fs-extra';
import { join } from 'path';
// @ts-ignore
import progressEstimator from 'progress-estimator';
import { findPkgModuleCachePathCore, findPkgModulePathCore } from 'cache-path/lib/finder/findPkgModuleCachePath';

export function createProgressEstimator(root: string)
{
	const storagePath = join(findPkgModuleCachePathCore(root), '.progress-estimator');
	ensureDirSync(storagePath);
	return progressEstimator({
		// All configuration keys are optional, but it's recommended to specify a storage location.
		storagePath,
	});
}
