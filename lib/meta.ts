export function updateMeta(content_new: string)
{
	return content_new
		.replace(/<name>.+<\/name>/, `<name>Chinese (Traditional) Language Pack / 繁體中文語言包</name>`)
		.replace(/<vendor>.+<\/vendor>/, `<vendor>bluelovers</vendor>`)
		.replace(/<description>.+<\/description>/, `<description><![CDATA[The Chinese Language Pack localizes the UI of IntelliJ IDEA, AppCode, CLion, DataGrip, GoLand, PyCharm, PhpStorm, RubyMine, and WebStorm into Chinese.<br><br>中文語言包將為您的 IntelliJ IDEA, AppCode, CLion, DataGrip, GoLand, PyCharm, PhpStorm, RubyMine, 和WebStorm 帶來中文化的界面。<br><br>注意：請先移除或禁用官方簡體中文語言包]]></description>`)
		.replace(/<id>.+<\/id>/, `<id>com.intellij.zh-tw</id>`)
		.replace(/\n+$/, '')
		;
}
