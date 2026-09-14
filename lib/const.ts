import { join } from 'upath2';
import { __root } from '../test/__root';

/**
 * original-plugin
 *
 * 已下載原始外掛的壓縮包存放目錄（ZIP 檔案）
 * Directory for storing downloaded original plugin archives (ZIP files)
 *
 * 用於暫存從 JetBrains Marketplace 下載的外掛壓縮檔
 * Used to temporarily store plugin archives downloaded from JetBrains Marketplace
 */
export const __plugin_downloaded_dir = join(__root, 'original-plugin');

/**
 * original-plugin-raw
 *
 * 已解壓縮的原始外掛目錄
 * Directory for uncompressed original plugins
 *
 * 從 __plugin_downloaded_dir 解壓縮後的外掛檔案存放處
 * Stores plugin files after extraction from __plugin_downloaded_dir
 */
export const __plugin_downloaded_dir_unzip = join(__root, 'original-plugin-raw');

/**
 * original-plugin/other-plugins
 *
 * 非語言包插件存放目錄（如 ml-llm 等內建插件）
 * Directory for non-language-pack plugins (e.g., ml-llm and other built-in plugins)
 *
 * 從 IDE 安裝目錄提取的非語言包插件 JAR 檔案存放於此
 * Stores non-language-pack plugin JAR files extracted from IDE installation directories
 */
export const __plugin_other_plugins_dir = join(__plugin_downloaded_dir, 'other-plugins');

/**
 * plugin-dev-raw
 *
 * 開發用原始外掛素材目錄（未經翻譯修改的原始檔案）
 * Development raw plugin source directory (unmodified original files)
 *
 * 存放用於本地化翻譯的原始外掛檔案
 * Stores original plugin files used for localization translation
 */
export const __plugin_dev_raw_dir = join(__root, 'plugin-dev-raw');

/**
 * plugin-dev-out
 *
 * 開發用外掛輸出目錄（翻譯完成後的外掛檔案）
 * Development plugin output directory (translated plugin files)
 *
 * 翻譯流程完成後，整合的外掛檔案會輸出至此目錄
 * After translation process completes, integrated plugin files are output to this directory
 */
export const __plugin_dev_output_dir = join(__root, 'plugin-dev-out');

/**
 * plugin-dev-overwrite
 *
 * 開發用外掛覆寫目錄（用於覆蓋特定檔案的自訂翻譯）
 * Development plugin overwrite directory (custom translations for specific file overrides)
 *
 * 此目錄中的檔案會覆蓋對應的預設翻譯，用於修正或自訂特定外掛的翻譯內容
 * Files in this directory override corresponding default translations, used to fix or customize specific plugin translations
 */
export const __plugin_dev_overwrite_dir = join(__root, 'plugin-dev-overwrite');

/**
 * lib/static/table.txt
 *
 * 中文分詞斷詞詞典表（用於 novel-segment 斷詞處理）
 * Chinese word segmentation dictionary table (for novel-segment word breaking)
 *
 * 載入此詞典可提升中文斷詞準確度，確保翻譯詞彙的一致性
 * Loading this dictionary improves Chinese word segmentation accuracy and ensures translation terminology consistency
 */
export const __dict_table_txt = join(__root, 'lib/static/table.txt');

/**
 * lib/static/synonym.txt
 *
 * 同義詞詞典（用於中文字詞替換與統一用語）
 * Synonym dictionary (for Chinese word replacement and terminology unification)
 *
 * 定義同義詞映射關係，確保翻譯中使用統一的用語
 * Defines synonym mappings to ensure consistent terminology in translations
 */
export const __dict_synonym_txt = join(__root, 'lib/static/synonym.txt');

/**
 * lib/static/lazy.properties
 *
 * 延遲載入的屬性字典檔（含預設翻譯對照）
 * Lazy-loaded properties dictionary file (with default translation mappings)
 *
 * 儲存常用的翻譯對照表，供翻譯流程中快速查詢
 * Stores common translation lookup tables for quick reference during translation process
 */
export const __dict_properties_lazy = join(__root, 'lib/static/lazy.properties');

/**
 * lib/const/version-map.json
 *
 * 外掛版本對應映射檔（記錄各 IDE 版本對應的外掛版本號）
 * Plugin version mapping file (records plugin version numbers for each IDE version)
 *
 * 用於自動化流程中判斷應使用哪個外掛版本進行翻譯打包
 * Used in automation workflows to determine which plugin version to use for translation packaging
 *
 * @deprecated 於 2024 版之後，JetBrains 不再更新獨立版語言包，改為內建語言包，所以需要手動提取語言包
 */
export const __file_version_map_json = join(__root, 'lib/const/version-map.json');

/**
 * lib/const/publish-tags.json
 *
 * 發佈標籤設定檔（記錄可發佈的 Git 標籤列表）
 * Publish tags configuration file (records list of publishable Git tags)
 *
 * 用於 CI/CD 流程中觸發自動發佈的標籤判斷
 * Used in CI/CD workflows to trigger automatic publishing based on tag detection
 */
export const __file_publish_tags_json = join(__root, 'lib/const/publish-tags.json');

/**
 * 外掛版本列舉（目前僅支援 latest 版本）
 * Plugin version enum (currently only supports latest version)
 */
export const enum EnumVersion
{
	/** 最新版本 / Latest version */
	latest = 'latest',
}

/**
 * plugin-dev-raw/zh/META-INF/plugin.xml
 *
 * 開發中外掛的 plugin.xml 元資料路徑
 * plugin.xml metadata path for the plugin under development
 *
 * 用於讀取及修改正在開發中的外掛 XML 元資料
 * Used for reading and modifying the XML metadata of the plugin under development
 */
export const __file_plugin_dev_meta_xml = join(__plugin_dev_raw_dir, 'zh', 'META-INF/plugin.xml');

/**
 * original-plugin-raw/zh/META-INF/plugin.xml
 *
 * 原始已解壓縮外掛的 plugin.xml 元資料路徑
 * plugin.xml metadata path for the uncompressed original plugin
 *
 * 用於讀取原始外掛的元資料，作為翻譯整合的參考基準
 * Used for reading the original plugin's metadata as a reference baseline for translation integration
 */
export const __file_plugin_src_meta_xml = join(__plugin_downloaded_dir_unzip, 'zh', 'META-INF/plugin.xml');
