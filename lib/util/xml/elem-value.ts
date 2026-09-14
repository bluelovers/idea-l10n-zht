import { XMLSerializedAsObject } from 'xmlbuilder2/lib/interfaces';
import { isArray } from '@ts-type/is-array';

/**
 * XML 元素物件結構，用於表示 xmlbuilder2 序列化後的元素
 * XML element object structure, representing an element serialized by xmlbuilder2
 */
export interface IElementObject
{
	/** XML 屬性（以 @ 開頭的 key） / XML attributes (keys starting with @) */
	[key: `@${string}`]: string

	/**
	 * CDATA 內容（xmlbuilder2 的 CDATA 表示方式） / CDATA content (xmlbuilder2 CDATA representation)
	 */
	'$'?: string,
	/**
	 * 元素的 innerText 文字內容 / Element's innerText text content
	 */
	'#'?: string,
}

/**
 * 元素物件的輸入類型，支援純物件或完整的 XML 序列化物件
 * Input type for element objects, supports plain objects or full XML serialized objects
 */
export type IElementObjectInput = IElementObject | XMLSerializedAsObject;

/**
 * 將字串或元素物件統一轉換為 IElementObject 格式
 * Convert string or element object to unified IElementObject format
 * @param elem - 字串或元素物件 / String or element object
 * @returns 規範化的元素物件 / Normalized element object
 */
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

/**
 * 設定元素的 CDATA 內容，移除 innerText（#）屬性
 * Set element's CDATA content, removing innerText (#) property
 * @param elem - 元素物件或字串 / Element object or string
 * @param value - 要設定的 CDATA 值 / CDATA value to set
 * @returns 包含 CDATA 的元素物件 / Element object with CDATA
 */
export function setElementCDATA<T extends IElementObjectInput>(elem: string | T, value: string): T & {
	'$': string,
}
{
	elem = _toObject(elem);
	delete elem['#'];
	elem['$'] = value;

	return elem as any
}

/**
 * 設定元素的 innerText 文字內容，移除 CDATA（$）屬性
 * Set element's innerText text content, removing CDATA ($) property
 * @param elem - 元素物件或字串 / Element object or string
 * @param value - 要設定的文字值 / Text value to set
 * @returns 包含 innerText 的元素物件 / Element object with innerText
 */
export function setElementInnerText<T extends IElementObjectInput>(elem: string | T, value: string): T & {
	'#': string,
}
{
	elem = _toObject(elem);
	delete elem['$'];
	elem['#'] = value;

	return elem as any
}

/**
 * 檢查元素是否包含 CDATA 內容
 * Check if element contains CDATA content
 * @param elem - 元素物件 / Element object
 * @returns 型別收窄為包含 CDATA 的元素 / Type guard for element with CDATA
 */
export function existsElementCDATA<T extends IElementObjectInput>(elem: T): elem is T & {
	'$': string,
}
{
	return typeof elem['$']?.length === 'number'
}

/**
 * 檢查元素是否包含 innerText 文字
 * Check if element contains innerText text
 * @param elem - 元素物件 / Element object
 * @returns 型別收窄為包含 innerText 的元素 / Type guard for element with innerText
 */
export function existsElementInnerText<T extends IElementObjectInput>(elem: T): elem is T & {
	'#': string,
}
{
	return typeof elem['#']?.length === 'number'
}

/**
 * 設定元素文字，自動選擇 innerText 或 CDATA 模式（沿用既有模式）
 * Set element text, automatically choosing innerText or CDATA mode (preserving existing mode)
 * @param elem - 元素物件或字串 / Element object or string
 * @param value - 要設定的文字值 / Text value to set
 * @returns 更新後的元素物件 / Updated element object
 */
export function setElementText<T extends IElementObjectInput>(elem: string | T, value: string)
{
	elem = _toObject(elem);

	if (existsElementInnerText(elem))
	{
		return setElementInnerText(elem, value);
	}

	return setElementCDATA(elem, value);
}

/**
 * 取得元素的文字內容，優先取得 CDATA，其次 innerText，最後回傳原始字串
 * Get element text content, preferring CDATA, then innerText, falling back to original string
 * @param elem - 元素物件或字串 / Element object or string
 * @returns 文字內容 / Text content
 */
export function getElementText<T extends IElementObjectInput>(elem: string | T): string
{
	return elem['$'] ?? elem['#'] ?? elem
}

/**
 * 斷言輸入為合法的元素物件（非陣列的物件）
 * Assert that input is a valid element object (non-array object)
 * @param elem - 要驗證的值 / Value to validate
 */
export function assertElementObject<T extends IElementObject>(elem: unknown): asserts elem is T
{
	if (typeof elem !== 'object' || isArray(elem))
	{
		throw new TypeError()
	}
}

/**
 * 內部方法：設定元素屬性（不處理 key 前綴）
 * Internal method: set element attribute (without key prefix handling)
 * @param elem - 元素物件 / Element object
 * @param key - 屬性名稱（需已包含 @ 前綴） / Attribute name (must include @ prefix)
 * @param value - 屬性值 / Attribute value
 * @returns 更新後的元素物件 / Updated element object
 */
export function _setElementAttr<T extends IElementObject>(elem: T,
	key: string,
	value: string | number | boolean,
): IElementObject
{
	assertElementObject(elem);
	elem[key] = value?.toString();
	return elem
}

/**
 * 設定元素屬性，自動為普通名稱加上 @ 前綴
 * Set element attribute, automatically adding @ prefix to plain names
 * @param elem - 元素物件 / Element object
 * @param key - 屬性名稱（可不帶 @ 前綴） / Attribute name (with or without @ prefix)
 * @param value - 屬性值 / Attribute value
 * @returns 更新後的元素物件 / Updated element object
 */
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
