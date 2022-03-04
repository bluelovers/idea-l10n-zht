/**
 * Created by user on 2022/3/4.
 */
import { XMLSerializedAsObject } from 'xmlbuilder2/lib/interfaces';
import { convert } from 'xmlbuilder2';
import { cloneDeep } from 'lodash';

export class XMLSerialized
{
	raw: XMLSerializedAsObject;
	_headless: boolean = true;

	constructor(source: Buffer | string)
	{
		this.raw = convert(source?.toString(), {
			format: "object",
		}) as XMLSerializedAsObject;
	}

	toJSON()
	{
		return cloneDeep(this.raw)
	}

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
