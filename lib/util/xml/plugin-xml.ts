import { XMLSerialized } from './object';
import { XMLSerializedAsObject } from 'xmlbuilder2/lib/interfaces';
import { getElementText, setElementCDATA } from './elem-value';
import { versionToParts } from '@lazy-node/semver-part';

export class PluginXml extends XMLSerialized
{

	get root()
	{
		return this.raw['idea-plugin'] as XMLSerializedAsObject
	}

	get version()
	{
		return this.root['version'] as string
	}

	set version(value: string)
	{
		this.root['version'] = value
	}

	get locale()
	{
		return this.root['locale'] as string
	}

	set locale(value: string)
	{
		this.root['locale'] = 'zh-TW';
		this.root['extensions']['languageBundle']['@locale'] = 'zh-TW';
	}

	get name()
	{
		return this.root['name'] as string
	}

	set name(value: string)
	{
		this.root['name'] = value
		/**
		 * https://youtrack.jetbrains.com/issue/IJPL-149950/2024.2-eap-force-ui-lang-as-chinese-simplified#focus=Comments-27-9923808.0-0
		 */
		this.root['extensions']['languageBundle']['@displayName'] = value;
	}

	get id()
	{
		return this.root['id'] as string
	}

	set id(value: string)
	{
		this.root['id'] = value
	}

	get description(): string
	{
		return getElementText(this.root['description'] as XMLSerializedAsObject)
	}

	set description(value: string)
	{
		this.root['description'] = setElementCDATA({}, value) as any
	}

	get changeNnotes(): string
	{
		return getElementText(this.root['change-notes'] as XMLSerializedAsObject)
	}

	set changeNnotes(value: string)
	{
		this.root['change-notes'] = setElementCDATA({}, value) as any
	}

	removeUntilBuild()
	{
		delete this.root['idea-version']['@until-build'];
	}

	versionSinceBuild(series?: boolean): string
	{
		const versionOrSeries: string = this.root['idea-version']['@since-build'];
		if (series)
		{
			return versionToParts(versionOrSeries)[0]
		}
		return versionOrSeries
	}

}
