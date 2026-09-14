import { XMLSerialized } from './object';
import { XMLSerializedAsObject } from 'xmlbuilder2/lib/interfaces';
import { getElementText, setElementCDATA } from './elem-value';
import { versionToParts } from '@lazy-node/semver-part';

/**
 * IntelliJ IDEA 插件 XML（plugin.xml）解析器，提供對插件中繼資料的讀寫功能
 * IntelliJ IDEA plugin XML (plugin.xml) parser, providing read/write capabilities for plugin metadata
 */
export class PluginXml extends XMLSerialized
{

	/**
	 * 取得 idea-plugin 根節點
	 * Get the idea-plugin root node
	 */
	get root()
	{
		return this.raw['idea-plugin'] as XMLSerializedAsObject
	}

	/**
	 * 取得插件版本號
	 * Get plugin version
	 * @returns 版本號字串 / Version string
	 */
	get version()
	{
		return this.root['version'] as string
	}

	/**
	 * 設定插件版本號
	 * Set plugin version
	 * @param value - 新版本號 / New version string
	 */
	set version(value: string)
	{
		this.root['version'] = value
	}

	/**
	 * 取得插件語言區域設定
	 * Get plugin locale
	 * @returns 語言區域代碼 / Locale code
	 */
	get locale()
	{
		return this.root['locale'] as string
	}

	/**
	 * 設定語言區域為繁體中文，同時更新 locale 與 languageBundle 的 @locale 屬性
	 * Set locale to Traditional Chinese, updating both locale and languageBundle @locale attribute
	 * @param value - 語言區域值（設定後會被強制為 'zh-TW'） / Locale value (forced to 'zh-TW' after setting)
	 */
	set locale(value: string)
	{
		this.root['locale'] = 'zh-TW';
		this.root['extensions']['languageBundle']['@locale'] = 'zh-TW';
	}

	/**
	 * 取得插件顯示名稱
	 * Get plugin display name
	 * @returns 插件名稱字串 / Plugin name string
	 */
	get name()
	{
		return this.root['name'] as string
	}

	/**
	 * 設定插件顯示名稱，同步更新 languageBundle 的 displayName
	 * Set plugin display name, syncing with languageBundle displayName
	 * @param value - 新的顯示名稱 / New display name
	 */
	set name(value: string)
	{
		this.root['name'] = value
		/**
		 * 必須同步更新 languageBundle displayName，否則 IDEA 2024.2+ EAP 會
		 * 強制使用系統語言作為插件名稱顯示（參見 IJPL-149950）
		 * Must sync languageBundle displayName, otherwise IDEA 2024.2+ EAP will
		 * force system language for plugin name display (see IJPL-149950)
		 * https://youtrack.jetbrains.com/issue/IJPL-149950/2024.2-eap-force-ui-lang-as-chinese-simplified#focus=Comments-27-9923808.0-0
		 */
		this.root['extensions']['languageBundle']['@displayName'] = value;
	}

	/**
	 * 取得插件識別碼
	 * Get plugin ID
	 * @returns 插件 ID 字串 / Plugin ID string
	 */
	get id()
	{
		return this.root['id'] as string
	}

	/**
	 * 設定插件識別碼
	 * Set plugin ID
	 * @param value - 新的插件 ID / New plugin ID
	 */
	set id(value: string)
	{
		this.root['id'] = value
	}

	/**
	 * 取得插件描述文字（從 CDATA 或 innerText 中提取）
	 * Get plugin description text (extracted from CDATA or innerText)
	 * @returns 插件描述字串 / Plugin description string
	 */
	get description(): string
	{
		return getElementText(this.root['description'] as XMLSerializedAsObject)
	}

	/**
	 * 設定插件描述文字，以 CDATA 格式寫入
	 * Set plugin description text, written in CDATA format
	 * @param value - 新的描述文字 / New description text
	 */
	set description(value: string)
	{
		this.root['description'] = setElementCDATA({}, value) as any
	}

	/**
	 * 取得變更紀錄（從 CDATA 或 innerText 中提取）
	 * Get change notes (extracted from CDATA or innerText)
	 * @returns 變更紀錄字串 / Change notes string
	 */
	get changeNnotes(): string
	{
		return getElementText(this.root['change-notes'] as XMLSerializedAsObject)
	}

	/**
	 * 設定變更紀錄，以 CDATA 格式寫入
	 * Set change notes, written in CDATA format
	 * @param value - 新的變更紀錄 / New change notes
	 */
	set changeNnotes(value: string)
	{
		this.root['change-notes'] = setElementCDATA({}, value) as any
	}

	/**
	 * 移除 until-build 屬性，使插件不綁定特定 IDE 版本上限
	 * Remove until-build attribute so the plugin is not capped to a specific IDE version
	 */
	removeUntilBuild()
	{
		delete this.root['idea-version']['@until-build'];
	}

	/**
	 * 取得插件相容的 IDE 起始版本，可選擇只回傳系列版本
	 * Get the IDE version the plugin is compatible with, optionally returning only the series version
	 * @param series - 若為 true 則只回傳主版本號（如 "2024"），否則回傳完整版本 / If true, return only major version (e.g. "2024"), otherwise return full version
	 * @returns IDE 版本字串 / IDE version string
	 */
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
