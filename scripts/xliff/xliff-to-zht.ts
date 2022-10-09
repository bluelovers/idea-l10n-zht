import { async as FastGlob } from "@bluelovers/fast-glob/bluebird";
import { join } from 'upath2';
import { __plugin_dev_output_dir, __plugin_downloaded_dir } from '../../lib/const';
import { handleXLIFF, handleXLIFFFile } from '../../lib/build/xliff/handle-xliff';
import { outputFile } from "fs-extra";

const cwd = join(__plugin_downloaded_dir, 'xliff');
const target_out = join(__plugin_dev_output_dir, 'xliff');

export default FastGlob([
	'*.zh-cn.xliff',
	//'*intellij.zh-cn.xliff',
], {
	cwd,
}).mapSeries(xliff_file => {
	return handleXLIFFFile(xliff_file, cwd)
		.then(result => {
			return outputFile(join(target_out, xliff_file.replace('.zh-cn.xliff', '.xliff')), result.obj.toString())
		})
	;
})
