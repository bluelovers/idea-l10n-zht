import { ITSValueOrArrayMaybeReadonly } from 'ts-type/lib/type/base';
import { getCjkName, zhDictCompare } from '@novel-segment/util';

const _map = new Map<string, string>();

export function _comp(a: ITSValueOrArrayMaybeReadonly<string>, b: ITSValueOrArrayMaybeReadonly<string>)
{
	const aa = [a].flat()[0];
	const bb = [b].flat()[0];

	const c1 = _map.get(aa) ?? (() =>
	{
		const s = getCjkName(aa);
		_map.set(aa, s);
		return s
	})();

	const c2 = _map.get(bb) ?? (() =>
	{
		const s = getCjkName(bb);
		_map.set(bb, s);
		return s
	})();

	return zhDictCompare(c1, c2)
}
