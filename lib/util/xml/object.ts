/**
 * Created by user on 2022/3/4.
 */
import { XMLSerializedAsObject } from 'xmlbuilder2/lib/interfaces';
import { convert } from 'xmlbuilder2';
import { cloneDeep } from 'lodash';

/**
 * XML 序列化基礎類別，提供 XML 字串與物件之間的雙向轉換功能
 * Base class for XML serialization, providing bidirectional conversion between XML string and object
 */
export class XMLSerialized
{
	/** 原始 XML 物件結構 / Raw XML object structure */
	raw: XMLSerializedAsObject;
	/** 是否省略 XML 宣告頭（預設 true） / Whether to omit XML declaration header (default true) */
	_headless: boolean = true;

	/**
	 * @param source - XML 原始字串或 Buffer / Raw XML string or Buffer
	 */
	constructor(source: Buffer | string)
	{
		this.raw = convert(source?.toString(), {
			format: "object",
		}) as XMLSerializedAsObject;
	}

	/**
	 * 將內部 XML 物件深拷貝後回傳
	 * Return a deep copy of the internal XML object
	 * @returns 深拷貝的 XML 物件 / Deep-copied XML object
	 */
	toJSON()
	{
		return cloneDeep(this.raw)
	}

	/**
	 * 將內部物件序列化為格式化的 XML 字串
	 * Serialize internal object to formatted XML string
	 * @returns 格式化的 XML 字串（結尾空白已移除） / Formatted XML string (trailing whitespace removed)
	 */
	toString()
	{
		return convert(this.raw, {
			format: "xml",
			prettyPrint: true,
			headless: this._headless,
			indent: ' ',
		})
			//.replace(/^\<\?xml version="1\.0"\?\>\s*/, '')
			.replace(/\s+$/, '')
	}

}
