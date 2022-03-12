import { XMLSerialized } from './object';
import { XMLSerializedAsObject, XMLSerializedAsObjectArray } from 'xmlbuilder2/lib/interfaces';
import { ITSTypeAndStringLiteral } from 'ts-type';

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
	'@approved': ITSTypeAndStringLiteral<EnumTranslationApproved>,
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

interface ICrowdinXLIFFXmlFile
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

}
