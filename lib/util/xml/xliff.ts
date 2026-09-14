import { XMLSerialized } from './object';
import { XMLSerializedAsObject, XMLSerializedAsObjectArray } from 'xmlbuilder2/lib/interfaces';
import { ITSTypeAndStringLiteral } from 'ts-type';
import { arrayChunkSplit } from 'array-chunk-split';

/**
 * 翻譯狀態列舉，用於標記 XLIFF 翻譯單元的處理進度
 * Enum for translation state, used to track the progress of XLIFF translation units
 */
export enum EnumTranslationState
{
	NEEDS_TRANSLATION = 'needs-translation',
	TRANSLATED = 'translated',
	FINA = 'final',
}

/**
 * 翻譯核准狀態列舉，用於標記翻譯是否已被核准
 * Enum for translation approval status, indicating whether a translation has been approved
 */
export enum EnumTranslationApproved
{
	YES = 'yes',
	NO = 'no',
}

/**
 * XLIFF 翻譯單元結構，代表一個待翻譯或已翻譯的字串條目
 * XLIFF translation unit structure, representing a string entry to be translated or already translated
 */
export interface ITransUnit
{
	/** 翻譯單元的唯一識別碼 / Unique identifier for the translation unit */
	'@id': `${number}`,
	/** 資源名稱，通常為原始字串的 key / Resource name, typically the key of the original string */
	'@resname': string,
	/** 翻譯核准狀態 / Translation approval status */
	'@approved': ITSTypeAndStringLiteral<EnumTranslationApproved>,
	/** 翻譯核准狀態（與 approved 相同用途，Crowdin 雙重欄位） / Translation approval status (same as approved, Crowdin dual field) */
	'@translate': ITSTypeAndStringLiteral<EnumTranslationApproved>,
	/** 原始來源字串（英文） / Original source string (English) */
	source: string,
	/** 翻譯目標字串及其狀態 / Translated target string with its state */
	target: {
		/** 翻譯狀態 / Translation state */
		'@state': ITSTypeAndStringLiteral<EnumTranslationState>,
		/** 翻譯後的文字內容 / Translated text content */
		'#': string
	},
	/** 來自 Crowdin 的註解資訊 / Annotation information from Crowdin */
	note: {
		/** 註解來源（固定為 Crowdin） / Annotation source (always "Crowdin") */
		'@from': 'Crowdin',
		/** 優先順序數值 / Priority number */
		'@priority': `${number}`,
		/** 註解文字內容 / Annotation text content */
		'#': string
	}
}

/**
 * Crowdin XLIFF XML 檔案結構，代表一個語言包的翻譯檔案
 * Crowdin XLIFF XML file structure, representing a single translation file in a language pack
 */
export interface ICrowdinXLIFFXmlFile
{
	/** 檔案的唯一識別碼 / Unique identifier for the file */
	'@id': `${number}`;
	/**
	 * 原始檔案名稱路徑 / Original file path
	 */
	'@original': string;
	/** 來源語言代碼（通常為英文） / Source language code (typically English) */
	'@source-language': string | 'en',
	/** 目標語言代碼（簡體中文或繁體中文） / Target language code (Simplified or Traditional Chinese) */
	'@target-language': string | 'zh-CN' | 'zh-TW',
	/** 資料類型（固定為純文字） / Data type (always plaintext) */
	'@datatype': 'plaintext';
	/** 專案識別碼 / Project identifier */
	'@project-id': `${number}`;

	/** 翻譯單元的容器，包含一個或多個翻譯項目 / Container for translation units, containing one or more translation entries */
	body: {
		'trans-unit': ITransUnit | ITransUnit[]
	};

}

/**
 * Crowdin XLIFF XML 解析器，提供對 XLIFF 翻譯檔案的讀取、分割與序列化功能
 * Crowdin XLIFF XML parser, providing read, split, and serialization capabilities for XLIFF translation files
 */
export class CrowdinXLIFFXml extends XMLSerialized
{
	/** 原始 XML 物件結構，包含 xliff 根節點與檔案陣列 / Raw XML object structure, containing xliff root node and file array */
	override raw: XMLSerializedAsObject & {
		xliff: XMLSerializedAsObject & {
			file: ICrowdinXLIFFXmlFile[] | ICrowdinXLIFFXmlFile
		}
	};

	/**
	 * @param source - XLIFF XML 的原始字串或 Buffer / Raw string or Buffer of the XLIFF XML
	 */
	constructor(source: Buffer | string)
	{
		super(source);
		this._headless = false;
	}

	/** 取得 XLIFF 根節點（xliff 元素） / Get the XLIFF root node (xliff element) */
	get root()
	{
		return this.raw['xliff'] as XMLSerializedAsObject
	}

	/** 取得所有翻譯檔案陣列 / Get array of all translation files */
	get files()
	{
		return this.root['file'] as any as ICrowdinXLIFFXmlFile[]
	}

	/**
	 * 序列化為 XML 字串，並確保 UTF-8 編碼宣告
	 * Serialize to XML string, ensuring UTF-8 encoding declaration
	 * @returns 包含 UTF-8 編碼的 XML 字串 / XML string with UTF-8 encoding
	 */
	override toString(): string
	{
		return super.toString()
			.replace(/^\<\?xml version="1\.0"\?\>/, '<?xml version="1.0" encoding="UTF-8"?>')
	}

	/**
	 * 將翻譯檔案分割為多個區塊，用於處理大量翻譯時限制每次提交的大小
	 * Split translation files into chunks, used to limit batch size when processing large volumes of translations
	 * @param maxChunkLength - 每個區塊的最大檔案數量（預設 15） / Maximum number of files per chunk (default 15)
	 * @returns 分割後的檔案區陣列 / Array of file chunk arrays
	 */
	chunkFiles(maxChunkLength: number = 15)
	{
		return arrayChunkSplit([this.files].flat(), maxChunkLength)
	}

	/**
	 * 將翻譯檔案分割並轉換為可序列化的資料格式
	 * Split translation files and convert to serializable data format
	 * @param maxChunkLength - 每個區塊的最大檔案數量（預設 15） / Maximum number of files per chunk (default 15)
	 * @returns 帶有編號名稱的分割檔案資料陣列 / Array of split file data with numbered names
	 */
	splitFiles(maxChunkLength: number = 15)
	{
		return this._splitFiles(this.chunkFiles(maxChunkLength))
	}

	/**
	 * 內部方法：將區塊資料轉換為帶有命名的物件陣列
	 * Internal method: convert chunk data to named object array
	 * @param chunk - 檔案區陣列 / Array of file chunks
	 */
	_splitFiles(chunk: ICrowdinXLIFFXmlFile[][])
	{
		return chunk.map((files, i) =>
		{
			return {
				name: i.toString().padStart(3, '0'),
				...this._toFakeData(files),
			}
		})
	}

	/**
	 * 內部方法：根據指定檔案重建 fake raw 結構
	 * Internal method: rebuild fake raw structure based on specified files
	 * @param file - 要使用的翻譯檔案或檔案陣列 / Translation file or array of files to use
	 * @returns 重建後的 raw 物件 / Reconstructed raw object
	 */
	_fakeRawByFiles(file: ICrowdinXLIFFXmlFile[] | ICrowdinXLIFFXmlFile)
	{
		return {
			...this.raw,
			xliff: {
				...this.raw['xliff'],
				file,
			},
		}
	}

	/**
	 * 內部方法：將翻譯檔案轉換為帶有 ID、raw 結構和 XML 字串的完整資料物件
	 * Internal method: convert translation file to complete data object with ID, raw structure, and XML string
	 * @param file - 要使用的翻譯檔案或檔案陣列 / Translation file or array of files to use
	 * @returns 包含 id、raw、xml 三個欄位的資料物件 / Data object containing id, raw, and xml fields
	 */
	_toFakeData(file: ICrowdinXLIFFXmlFile[] | ICrowdinXLIFFXmlFile)
	{
		const id = Array.isArray(file) ? file.flat().map(file => file['@id']) : [file['@id']];

		const raw = this._fakeRawByFiles(file);

		return {
			id,
			raw,
			xml: this.toString.call({
				_headless: this._headless,
				raw,
			}),
		}
	}

}
