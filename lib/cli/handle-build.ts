import { ITSResolvable } from 'ts-type';
import { _handleArgvResult } from './handle-argv';
import { basename } from 'upath2';
import { unzipLang } from '../build/unzip';
import { convertLang } from '../build/to-zht';
import { replaceProperties } from '../build/properties-replace';
import { packPluginJar } from '../build/pack-plugin-jar';

/**
 * 建構結果的型別，為 _handleArgvResult 回傳值的解析後型別
 * Build result type, which is the resolved return type of _handleArgvResult
 */
export type IArgvBuild = Awaited<ReturnType<typeof _handleArgvResult>>;

/**
 * 執行語言包的完整建構流程
 * Execute the complete build pipeline for a language pack
 *
 * 建構步驟依序為：解壓縮 → 簡中轉繁中 → 替換 properties → 打包 JAR
 * Build steps in order: unzip → convert SC to TC → replace properties → pack JAR
 *
 * @param result - 可解析的建構參數，包含語言包檔案路徑等資訊 / Resolvable build parameters including language pack file path info
 * @returns 建構完成的 Promise / Promise resolving when build is complete
 */
export function _handleBuild(result: ITSResolvable<IArgvBuild>)
{
	return Promise.resolve(result)
		.then(async (result) =>
		{

			/** 若未指定名稱，從檔案路徑提取不含副檔名的基礎名稱 / If name not specified, extract basename without extension from file path */
			const name = result.name ?? basename(result.file, '.zip');

			/** 第一步：解壓縮語言包 ZIP 檔案 / Step 1: Unzip language pack ZIP file */
			await unzipLang(name);
			/** 第二步：將簡體中文轉換為繁體中文 / Step 2: Convert Simplified Chinese to Traditional Chinese */
			await convertLang(name);
			/** 第三步：替換 properties 檔案中的翻譯內容 / Step 3: Replace translation content in properties files */
			await replaceProperties(name);
			/** 第四步：將翻譯後的檔案打包為 IntelliJ 插件 JAR / Step 4: Pack translated files into IntelliJ plugin JAR */
			await packPluginJar(name);

		})
}
