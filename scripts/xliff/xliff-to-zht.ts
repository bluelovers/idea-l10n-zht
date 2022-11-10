import { async as FastGlob } from "@bluelovers/fast-glob/bluebird";
import { join } from 'upath2';
import { __plugin_dev_output_dir, __plugin_downloaded_dir } from '../../lib/const';
import { handleXLIFF, handleXLIFFFile, openXLIFFFile } from '../../lib/build/xliff/handle-xliff';
import { outputFile } from "fs-extra";
import Bluebird from 'bluebird';

const cwd = join(__plugin_downloaded_dir, 'xliff');
const target_out = join(__plugin_dev_output_dir, 'xliff');

export default FastGlob<string>([
	'*.zh-cn.xliff',
	//'*intellij.zh-cn.xliff',
], {
	cwd,
}).mapSeries(xliff_file => {
	return handleXLIFFFile(xliff_file, cwd)
		.tap(result => {

			const new_file = join(target_out, xliff_file.replace('.zh-cn.xliff', '.xliff'));
			const new_dir = new_file.replace('.xliff', '');

			const old_dir = join(cwd, xliff_file.replace('.zh-cn.xliff', ''));

			return Promise.all([
				outputFile(new_file, result.obj.toString()),
				Bluebird.each(result.obj.splitFiles(), (row) =>
				{
					return outputFile(join(new_dir, `${row.name}.xliff`), row.xml)
				}),
				Bluebird.each(openXLIFFFile(xliff_file, cwd).splitFiles(), (row) =>
				{
					return outputFile(join(old_dir, `${row.name}.xliff`), row.xml)
				}),
			])
		})
	;
})
