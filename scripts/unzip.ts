/**
 * 解壓縮已下載的語言包 ZIP 檔案
 * Extract the downloaded language pack ZIP file
 *
 * 解壓縮 zh（中文）語言包，作為 build pipeline 中的解壓縮步驟。
 * Extracts the zh (Chinese) language pack as part of the build pipeline.
 */
import { createMultiBar } from '../lib/cli-progress';
import { unzipLang } from '../lib/build/unzip';

export default unzipLang('zh');
