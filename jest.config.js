// @ts-check

const { basename, extname, dirname } = require('path');

/**
 * // @type { import('@jest/types').Config.InitialOptions }
 * @type { import('ts-jest').InitialOptionsTsJest }
 */
let jestConfig = {

}

/**
 * @param {string} name
 * @returns {string}
 * @private
 */
function _requireResolve(name)
{
	let result;

	try
	{
		// @ts-ignore
		const { requireResolveExtra, requireResolveCore } = require('@yarn-tool/require-resolve');

		const paths = [
			requireResolveExtra('@bluelovers/tsdx').result,
			requireResolveExtra('tsdx').result,
		].filter(Boolean);

		result = requireResolveCore(name, {
			includeGlobal: true,
			includeCurrentDirectory: true,
			paths,
		})
	}
	catch (e)
	{

	}

	result = result || require.resolve(name);

	console.info('[require.resolve]', name, '=>', result)

	return result
}

let _ok = true;

try
{
	if (!jestConfig.preset)
	{

		let result = require('@yarn-tool/ws-find-up-paths').findUpPathsWorkspaces([
			'jest-preset.js',
			'jest.config.js',
		], {
			ignoreCurrentPackage: true,
			onlyFiles: true,
		}).result;

		if (result)
		{
			let name = basename(result, extname(result))

			switch (name)
			{
				case 'jest-preset':
					jestConfig.preset = dirname(result);
					break;
				default:
					jestConfig = {
						...require(result),
						jestConfig,
					};
					break;
			}

			_ok = false;
		}
	}
}
catch (e)
{

}

try
{
	if (_ok && !jestConfig.preset)
	{
		let result = _requireResolve('@bluelovers/jest-config/package.json');
		if (result)
		{
			jestConfig.preset = dirname(result);
			_ok = false;
		}
	}
}
catch (e)
{

}

if (_ok && !jestConfig.preset)
{
	jestConfig.preset = '@bluelovers/jest-config';
	_ok = false;
}

console.info(`jest.config.preset: ${jestConfig.preset}`);

module.exports = jestConfig
