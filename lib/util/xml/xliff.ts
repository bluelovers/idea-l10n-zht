import { XMLSerialized } from './object';
import { XMLSerializedAsObject, XMLSerializedAsObjectArray } from 'xmlbuilder2/lib/interfaces';
import { ITSTypeAndStringLiteral } from 'ts-type';
import { arrayChunkSplit } from 'array-chunk-split';

export enum EnumTranslationState
{
	NEEDS_TRANSLATION = 'needs-translation',
	TRANSLATED = 'translated',
	FINA = 'final',
}

export enum EnumTranslationApproved
{
	YES = 'yes',
	NO = 'no',
}

export interface ITransUnit
{
	'@id': `${number}`,
	'@resname': string,
	'@approved': ITSTypeAndStringLiteral<EnumTranslationApproved>,
	'@translate': ITSTypeAndStringLiteral<EnumTranslationApproved>,
	source: string,
	target: {
		'@state': ITSTypeAndStringLiteral<EnumTranslationState>,
		'#': string
	},
	note: {
		'@from': 'Crowdin',
		'@priority': `${number}`,
		'#': string
	}
}

export interface ICrowdinXLIFFXmlFile
{
	'@id': `${number}`;
	/**
	 * filename
	 */
	'@original': string;
	'@source-language': string | 'en',
	'@target-language': string | 'zh-CN' | 'zh-TW';
	'@datatype': 'plaintext';
	'@project-id': `${number}`;

	body: {
		'trans-unit': ITransUnit | ITransUnit[]
	};

}

export class CrowdinXLIFFXml extends XMLSerialized
{
	override raw: XMLSerializedAsObject & {
		xliff: XMLSerializedAsObject & {
			file: ICrowdinXLIFFXmlFile[] | ICrowdinXLIFFXmlFile
		}
	};

	constructor(source: Buffer | string)
	{
		super(source);
		this._headless = false;
	}

	get root()
	{
		return this.raw['xliff'] as XMLSerializedAsObject
	}

	get files()
	{
		return this.root['file'] as any as ICrowdinXLIFFXmlFile[]
	}

	override toString(): string
	{
		return super.toString()
			.replace(/^\<\?xml version="1\.0"\?\>/, '<?xml version="1.0" encoding="UTF-8"?>')
	}

	chunkFiles(maxChunkLength: number = 15)
	{
		return arrayChunkSplit([this.files].flat(), maxChunkLength)
	}

	splitFiles(maxChunkLength: number = 15)
	{
		return this._splitFiles(this.chunkFiles(maxChunkLength))
	}

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
