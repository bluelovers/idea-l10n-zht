export interface IElementObject
{
	[key: `@${string}`]: string

	/**
	 * CDATA
	 */
	'$'?: string,
	/**
	 * innerText
	 */
	'#'?: string,
}

export function _toObject(elem: string | object): IElementObject
{
	if (typeof elem === 'string')
	{
		return {
			'#': elem,
		}
	}

	assertElementObject(elem);

	return elem as any
}

export function setElementCDATA(elem: string | object, value: string): IElementObject
{
	elem = _toObject(elem);
	delete elem['#'];
	elem['$'] = value;

	return elem as any
}

export function setElementText(elem: string | object, value: string): IElementObject
{
	elem = _toObject(elem);
	delete elem['$'];
	elem['#'] = value;

	return elem as any
}

export function getElementText(elem: string | object): string
{
	return elem['$'] ?? elem['#'] ?? elem
}

export function assertElementObject<T extends IElementObject>(elem: unknown): asserts elem is T
{
	if (typeof elem !== 'object' || Array.isArray(elem))
	{
		throw new TypeError()
	}
}

export function _setElementAttr<T extends IElementObject>(elem: T,
	key: string,
	value: string | number | boolean,
): IElementObject
{
	assertElementObject(elem);
	elem[key] = value?.toString();
	return elem
}

export function setElementAttr<T extends IElementObject>(elem: T,
	key: string,
	value: string | number | boolean,
): IElementObject
{
	if (key !== '#' && key !== '$' && !key.startsWith('@'))
	{
		key = `@${key}`;
	}

	return _setElementAttr(elem, key, value)
}
