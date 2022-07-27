import { currentBranchName } from '@git-lazy/branch';
import { __root } from '../../test/__root';
import { console } from 'debug-color2';

export function parseVersionFromBranchName(branch: string)
{
	let m = /^(?:releases\/)?v((\d+)(?:\.(?:\d+))?)$/.exec(branch);

	if (m?.[1])
	{
		return {
			isVersionBranch: true as const,
			version: m[1],
			series: m[2],
		}
	}

	return {
		isVersionBranch: false as const,
	}
}

export function getBranchInfo()
{
	const branchName = currentBranchName(__root);

	const isMasterBranch = branchName === 'master' || branchName === 'main';

	const {
		version,
		series,
		isVersionBranch,
	} = parseVersionFromBranchName(branchName);

	const data = {
		branchName,
		isMasterBranch,
		isVersionBranch,
		version,
		series,
	};

	console.dir(data);

	return data;
}
