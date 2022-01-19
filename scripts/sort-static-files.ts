import { loadFile as loadFileSynonym } from "@novel-segment/sort-synonym";
import { stringifyHandleDictLinesList } from "@novel-segment/util-compare";
import { __dict_properties_lazy, __dict_synonym_txt, __dict_table_txt } from '../lib/const';
import { outputFile, writeFile } from 'fs-extra';
import { LF } from 'crlf-normalize';
import { loadFile as loadFileTable } from '@novel-segment/sort-dict-table';
import DotProperties from 'dot-properties-loader';
import { basename } from 'path';

export default Promise.all([
	loadFileTable(__dict_table_txt)
		.then(list =>
		{
			const lines = stringifyHandleDictLinesList(list);

			return writeFile(__dict_table_txt, lines.join(LF) + LF)
				.then(() => console.log(`sort ${basename(__dict_table_txt)}`))
		}),
	loadFileSynonym(__dict_synonym_txt)
		.then(list =>
		{
			const lines = stringifyHandleDictLinesList(list);

			return writeFile(__dict_synonym_txt, lines.join(LF) + LF)
				.then(() => console.log(`sort ${basename(__dict_synonym_txt)}`))
		}),
	Promise.resolve()
		.then(() =>
		{

			const LAZY_PROPERTIES = new DotProperties({
				file: __dict_properties_lazy,
			});

			const LAZY_PROPERTIES_KEYS = Object.keys(LAZY_PROPERTIES.tree).sort();

			const dp = new DotProperties({
				source: '',
			});

			LAZY_PROPERTIES_KEYS.forEach(key =>
			{
				dp.set(key, LAZY_PROPERTIES.get(key) as any);
			});

			let text = dp.stringify({
				latin1: false,
				keySep: '=',
			});

			return outputFile(__dict_properties_lazy, text + LF)
				.then(() => console.log(`sort ${basename(__dict_properties_lazy)}`))
		}),
])
