/**
 * Zip 操作工具函式集
 * Zip operation utility functions
 *
 * 提供與 JSZip 相關的共用操作，避免在多個模組中重複實作相同的 zip 讀寫邏輯。
 * Provides shared JSZip-related operations to avoid duplicating zip read/write logic across modules.
 */
import JSZip from 'jszip';
import { PluginXml } from './xml/plugin-xml';
import { copySync, outputFile, readFile } from 'fs-extra';
import { console } from 'debug-color2';
import { basename } from 'upath2';

/**
 * 從 ZIP 或 JAR 檔案中讀取 plugin.xml 並回傳 PluginXml 解析結果
 * Read plugin.xml from a ZIP or JAR file and return parsed PluginXml result
 *
 * 設計邏輯：
 * - 插件資訊（版本號、ID 等）統由此函式讀取，確保單一事實來源
 * - 避免在多處重複 JSZip.loadAsync → file('META-INF/plugin.xml') → PluginXml 的流程
 * - 回傳的 PluginXml 物件可直接存取 version、id、locale 等屬性
 *
 * Design logic:
 * - Plugin metadata (version, ID, etc.) is read through this function, ensuring single source of truth
 * - Avoids duplicating JSZip.loadAsync → file('META-INF/plugin.xml') → PluginXml flow in multiple places
 * - Returned PluginXml object can directly access version, id, locale and other properties
 *
 * @param zipFilePath - ZIP 或 JAR 檔案的路徑 / Path to the ZIP or JAR file
 * @returns PluginXml 解析結果 / Parsed PluginXml result
 * @throws 當 ZIP 內無 META-INF/plugin.xml 時拋出異常 / Throws when META-INF/plugin.xml is missing from ZIP
 */
export async function readPluginInfoFromZip(zipFilePath: string): Promise<PluginXml>
{
	const zip = await JSZip.loadAsync(await readFile(zipFilePath));

	const pluginXmlBuf = await zip.file('META-INF/plugin.xml').async('nodebuffer');

	return new PluginXml(pluginXmlBuf);
}

/**
 * 從 ZIP 檔案中提取指定路徑的檔案並寫入到輸出路徑
 * Extract a file at a given path from a ZIP file and write it to the output path
 *
 * 設計邏輯：
 * - 通用的 ZIP 內檔提取函式，支援巢狀結構（如從外部 ZIP 中提取 JAR）
 * - 與 readPluginInfoFromZip 的差異：此函式回傳原始 Buffer，適合提取二進位檔（JAR、ZIP 等）
 * - readPluginInfoFromZip 專門解析 plugin.xml，此函式則處理任意檔案
 *
 * Design logic:
 * - General-purpose ZIP file extraction, supporting nested structures (e.g., extracting JAR from outer ZIP)
 * - Differs from readPluginInfoFromZip: this returns raw Buffer, suitable for binary files (JAR, ZIP, etc.)
 * - readPluginInfoFromZip specifically parses plugin.xml, while this handles any file
 *
 * @param zipFilePath - 外層 ZIP 檔案路徑 / Outer ZIP file path
 * @param innerFilePath - ZIP 內要提取的檔案路徑（如 'ml-llm/lib/ml-llm.jar'）/ Path of file inside ZIP (e.g. 'ml-llm/lib/ml-llm.jar')
 * @returns 提取的檔案 Buffer / Extracted file Buffer
 * @throws 當 ZIP 內找不到指定檔案時拋出異常 / Throws when specified file is not found in ZIP
 */
export async function extractFileFromZip(zipFilePath: string, innerFilePath: string): Promise<Buffer>
{
	const zip = await JSZip.loadAsync(await readFile(zipFilePath));

	const file = zip.file(innerFilePath);

	if (!file)
	{
		throw new Error(`File '${innerFilePath}' not found in ${basename(zipFilePath)}`);
	}

	return file.async('nodebuffer');
}

/**
 * 複製插件 ZIP 並從中提取指定檔案到目標目錄
 * Copy plugin ZIP and extract a specified file to the target directory
 *
 * 設計邏輯：
 * - 整合「複製 ZIP + 提取內部檔案」的完整流程，避免呼叫端重複此組合操作
 * - 複製原始 ZIP 保留完整來源，同時提取特定檔案供後續使用
 * - 適用於從 IDE 安裝目錄提取內建插件（如 ml-llm）的場景
 *
 * Design logic:
 * - Integrates the complete flow of "copy ZIP + extract inner file" to avoid callers duplicating this combination
 * - Copies the original ZIP to preserve the full source, while extracting specific files for subsequent use
 * - Suitable for extracting built-in plugins (e.g., ml-llm) from IDE installation directories
 *
 * @param sourceZipPath - 來源 ZIP 檔案路徑 / Source ZIP file path
 * @param outputZipPath - ZIP 複製的目標路徑 / Destination path for the copied ZIP
 * @param innerFilePath - ZIP 內要提取的檔案路徑 / Path of file inside ZIP to extract
 * @param extractedOutputPath - 提取檔案的輸出路徑 / Output path for the extracted file
 */
export async function copyPluginZipAndExtractFile(
	sourceZipPath: string,
	outputZipPath: string,
	innerFilePath: string,
	extractedOutputPath: string,
)
{
	/** 複製原始 ZIP 到目標目錄，保留完整來源 / Copy original ZIP to target directory, preserving full source */
	copySync(sourceZipPath, outputZipPath);

	/**
	 * 從 ZIP 中提取指定檔案（如 JAR）並寫入目標路徑
	 * Extract specified file (e.g., JAR) from ZIP and write to target path
	 */
	const buf = await extractFileFromZip(sourceZipPath, innerFilePath);
	await outputFile(extractedOutputPath, buf);

	console.success(`已複製 ${basename(sourceZipPath)} 並提取 ${basename(extractedOutputPath)}`);
}
