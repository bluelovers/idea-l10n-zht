import { processIdeaSegmentText } from '../lib/segment';

describe(`segment`, () =>
{
	[
		[`打印`, `action.Print.text=打印(_P)…\naction.Print.description=打印文件`],
	].forEach(text =>
	{

		test(text.join(' - '), async () =>
		{

			let actual = await processIdeaSegmentText(text[1]);

			expect(actual).not.toContain(text[0])
			expect(actual).toMatchSnapshot();

		});

	})

})
