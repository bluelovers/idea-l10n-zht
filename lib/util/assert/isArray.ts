import { ITSArrayListMaybeReadonly } from 'ts-type/lib/type/base';

export function isArray<T extends ITSArrayListMaybeReadonly<any>>(value: T | unknown): value is T
{
	return Array.isArray(value)
}
