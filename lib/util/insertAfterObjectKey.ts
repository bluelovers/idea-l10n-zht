import { sortObjectKeys } from 'sort-object-keys2';

/**
 * 在物件的指定 key 後方插入新屬性，維持屬性順序
 * Insert a new property after a specified key in an object, maintaining property order
 * @param obj - 目標物件 / Target object
 * @param key - 要插入的新屬性名稱 / New property name to insert
 * @param value - 要插入的新屬性值 / New property value to insert
 * @param targetKey - 要在其後方插入的目標屬性名稱 / Target property name to insert after
 */
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
