//@noUnusedParameters:false

import { textIncludeCJK } from '../lib/util/include-cjk';

describe(`cjk`, () =>
{

	test.skip(`textIncludeCJK`, () =>
	{
		expect(textIncludeCJK("切換書簽 7")).toBeTruthy();
		expect(textIncludeCJK("Kotlin")).toBeFalsy();
	});

})
