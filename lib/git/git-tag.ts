import { versionToParts } from "@lazy-node/semver-part";
import { gitTag } from '@git-lazy/tag';
import { __root } from '../../test/__root';
import { opts } from './_config';
import Bluebird from 'bluebird';
import { join } from 'upath2';

export function updatePluginTag(version: string)
{
	const series = versionToParts(version)[0];

	return Bluebird.mapSeries([
		`v${series}`,
		`v${version}`,
	], tag =>
	{
		return gitTag(tag, {
			cwd: __root,
			forceGitTag: true,
		}, opts)
	})
}

/**
 * changelog 專用 tag
 */
export function updateRepoTag()
{
	return Bluebird
		.resolve(import(join(__root, 'package.json')))
		.then(({
			name, version,
		}) => gitTag(`${name}@${version}`, {
			cwd: __root,
			forceGitTag: true,
		}, opts))
		;
}
