import { ensureDirSync } from 'fs-extra';
import { join } from 'path';
// @ts-ignore
import progressEstimator from 'progress-estimator';
import { findPkgModuleCachePathCore } from 'cache-path/lib/finder/findPkgModuleCachePath';
import { __root } from '../test/__root';
import { MultiBar, Presets, SingleBar } from 'cli-progress';
import { gray, green, yellow } from 'ansi-colors';

export function createProgressEstimator(root: string)
{
	const storagePath = join(findPkgModuleCachePathCore(root), '.progress-estimator');
	ensureDirSync(storagePath);
	return progressEstimator({
		// All configuration keys are optional, but it's recommended to specify a storage location.
		storagePath,
	});
}

export function createMultiBar()
{
	return new MultiBar({
		clearOnComplete: false,
		hideCursor: true,

		barCompleteChar: '\u2588',
		barIncompleteChar: '\u2591',

		format: `${green('{bar}')} ${yellow('{percentage}%')} | ${gray('{duration_formatted}')} | {filename}`,

		barsize: 10,

	}, Presets.shades_classic);
}

export function createSingleBar(total: number, startValue: number, payload?: any)
{
	const bar = new SingleBar({
		clearOnComplete: false,
		hideCursor: true,

		barCompleteChar: '\u2588',
		barIncompleteChar: '\u2591',

		format: `${green('{bar}')} ${yellow('{percentage}%')} | ${gray('{duration_formatted}')} | {filename}`,

		barsize: 10,

	}, Presets.shades_classic);

	bar?.start(total, startValue, payload);

	return bar
}

export const cli_logger = createProgressEstimator(__root);
