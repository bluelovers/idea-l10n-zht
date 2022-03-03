import { sortObjectKeys } from 'sort-object-keys2';

export function insertAfterObjectKey<T extends object, K extends string, V extends any>(obj: T,
	key: K,
	value: V,
	targetKey: string,
): asserts obj is T & {
	[k in K]: V
}
{
	let keys = Object.keys(obj);
	const i = keys.indexOf(targetKey);

	// @ts-ignore
	obj[key] = value;

	if (i !== -1)
	{
		keys = keys.filter(k => k !== key);
		keys.splice(i + 1, 0, key);

		sortObjectKeys(obj, {
			keys,
			useSource: true,
		});
	}
}
