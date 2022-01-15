export function updateMeta(content_new: string)
{
	return content_new
		.replace(/<name>.+<\/name>/, `<name>Chinese (Traditional) Language Pack / 繁體中文語言包</name>`)
		.replace(/<vendor>.+<\/vendor>/, `<vendor>bluelovers</vendor>`)
		.replace(/<description>.+<\/description>/, `<description><![CDATA[Jetbrains IntelliJ Chinese (Traditional) Language Pack / 繁體中文語言包<p>The Chinese Language Pack localizes the UI of IntelliJ IDEA, AppCode, CLion, DataGrip, GoLand, PyCharm, PhpStorm, RubyMine, and WebStorm into Chinese.</p><p>中文語言包將為您的 IntelliJ IDEA, AppCode, CLion, DataGrip, GoLand, PyCharm, PhpStorm, RubyMine, 和WebStorm 帶來中文化的界面。</p><h2>install</h2><ul><li>install from <a href="https://github.com/bluelovers/idea-l10n-zht/raw/master/plugin-dev-out/zh.jar" target="_blank">github</a></li><li>install from <a href="https://plugins.jetbrains.com/plugin/18365-chinese-traditional-language-pack-----">jetbrains</a></li></ul><blockquote><p>注意：請先移除或禁用<a href="https://plugins.jetbrains.com/plugin/13710-chinese-simplified-language-pack----" target="_blank">官方簡體中文語言包</a></p></blockquote>]]></description>`)
		.replace(/<id>.+<\/id>/, `<id>com.intellij.zh-tw</id>`)
		.replace(/\n+$/, '')
		;
}
