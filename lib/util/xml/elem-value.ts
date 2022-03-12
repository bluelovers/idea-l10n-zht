import { XMLSerializedAsObject } from 'xmlbuilder2/lib/interfaces';
import { isArray } from '@ts-type/is-array';

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

export type IElementObjectInput = IElementObject | XMLSerializedAsObject;

export function _toObject<T extends IElementObjectInput>(elem: string | T): Exclude<T, XMLSerializedAsObject> & IElementObject
{
	if (typeof elem === 'string')
	{
		return {
			'#': elem,
		} as any
	}

	assertElementObject(elem);

	return elem as any
}

export function setElementCDATA<T extends IElementObjectInput>(elem: string | T, value: string): T & {
	'$': string,
}
{
	elem = _toObject(elem);
	delete elem['#'];
	elem['$'] = value;

	return elem as any
}

export function setElementInnerText<T extends IElementObjectInput>(elem: string | T, value: string): T & {
	'#': string,
}
{
	elem = _toObject(elem);
	delete elem['$'];
	elem['#'] = value;

	return elem as any
}

export function existsElementCDATA<T extends IElementObjectInput>(elem: T): elem is T & {
	'$': string,
}
{
	return typeof elem['$']?.length === 'number'
}

export function existsElementInnerText<T extends IElementObjectInput>(elem: T): elem is T & {
	'#': string,
}
{
	return typeof elem['#']?.length === 'number'
}

export function setElementText<T extends IElementObjectInput>(elem: string | T, value: string)
{
	elem = _toObject(elem);

	if (existsElementInnerText(elem))
	{
		return setElementInnerText(elem, value);
	}

	return setElementCDATA(elem, value);
}

export function getElementText<T extends IElementObjectInput>(elem: string | T): string
{
	return elem['$'] ?? elem['#'] ?? elem
}

export function assertElementObject<T extends IElementObject>(elem: unknown): asserts elem is T
{
	if (typeof elem !== 'object' || isArray(elem))
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
