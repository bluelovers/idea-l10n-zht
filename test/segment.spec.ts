import { lazyMatchSynonym001, lazyMatchSynonym001Not } from '@novel-segment/assert';
import { initIdeaSegmentText, processIdeaSegmentText } from '../lib/segment';
import { ITSValueOrArrayMaybeReadonly } from 'ts-type/lib/type/base';
import { _comp } from './lib/_sort_comp';
import { assertTestExpected } from './lib/assertTestExpected';

jest.setTimeout(60 * 1000);

beforeAll(async () => {
	await initIdeaSegmentText()
});

type ITestList = [ITSValueOrArrayMaybeReadonly<string>, string][];

/**
 * 檢查是否確實轉換
 * 通過測試不代表轉換符合預期，因為檢查詞必須要正確設定才可以
 *
 * 轉換結果必須『不包含』指定內容
 */
describe(`segment`, () => {

	/**
	 * 繁體/簡體皆可 但簡體比較能反映真實運作
	 */
	(<ITestList>[
		//[`繁體`, `繁體/簡體皆可 但簡體比較能反映真實運作`],

		[`打印`, `action.Print.text=打印(_P)…\naction.Print.description=打印文件`],
		[`粘貼`, `從剪貼板粘貼`],
		[`剪貼板`, `從剪貼板粘貼`],
		[`選項卡`, `編輯器選項卡`],
		[`選項卡`, `action.close.all.unmodified.editors=關閉未修改選項卡(_U)`],
		[`只讀`, `action.ToggleReadOnlyAttribute.text=切換只讀特性`],
		[`標籤頁`, `關閉組內未固定標籤頁`],
		[`標簽頁`, `關閉組內未固定標簽頁`],
		[`文件夾`, `，右击任何文件夹，`],
		[`文件夾`, `仅报告位於源文件夹下的空目录`],
		[`全局`, `使工具全局可见(&B)`],
		[`全局庫`, `导入的项目引用了未知的全局库`],
		[`服務器`, `以下文件被禁止，因为其中一个文件很可能导致服务器崩溃。\n{0}`],
		[`屏幕`, `action.android.emulator.home.button.text=主屏幕`],
		[`搜索`, `正在搜索受影響的檔案路徑…`],
		[`查找`, `查找下一个/移至下一个匹配项(_N)…`],
		[`宏`, `无法解析宏 ''{1}'' 的形参 ''{0}''`],
		[`宏`, `查看、更改、录制、播放宏`],
		[`形參`, `類型形參 ''{0}'' 不能直接實例化`],
		[`應用程序`, `重新加載應用程序設定`],
		[`字符串`, `在活動編輯器中尋找字符串`],
		[`反方向`, `反方向重複上一次尋找`],
		[`圖像`, `圖像已複製到剪貼簿`],
		[`信息`, `顯示詳細信息`],
		[`數據源`, `外部數據源`],
		[`數據`, `刷新測試管理數據`],
		[`代碼`, `檔案和代碼模板`],
		[`變量`, `在當前範圍內未初始化或不可用的變量將不會顯示`],
		[`類型作為`, `預期布爾類型作為方法 {0} 返回類型`],
		[`布爾`, `預期布爾類型作為方法 {0} 返回類型`],
		[`布爾值`, `首選顯式 '-n' 檢查非空字串。使用 '=' 或 '-ne' 檢查布爾值和整數。`],
		[`運行`, `關閉具有運行進程的工具視窗時:`],
		[`激活`, `激活工具窗口: {0}`],
		[`窗口`, `激活工具窗口: {0}`],
		[`用戶`, `與以下用戶完全同步:`],
		[`項目`, `<html><body>您想在哪裡打開項目 ''{0}''?</body></html>`],
		[`加載`, `導入最適合乾淨項目。導入未被清理的項目時，重新加載過程會忽略包含最新目標的源文件。`],
		[`插件`, `Kotlin 插件有可用的新版本 {0}。<b><a href="#">安裝</a></b>`],
		[`兼容`, `從右到左文本兼容性問題`],
		[`光標`, `从文本光标开始的所有内容`],
		[`標識符`, `不允許在一個模板中混用駝峰拼寫法和小寫標識符`],
		[`駱駝拼寫法`, `使用骆驼拼写法样式的方法名，没有 "get" 前缀，第一个字符大写。 例如，属性名称 '_my_property' 被转换为 'MyProperty'。`],
		[
			`駝峰拼寫法`,
			`<p><a href="https://kotlinlang.org/docs/coding-conventions.html#function-names">建議的命名慣例</a>：必須以小寫字母開頭，使用駝峰拼寫法並且沒有下划線。</p>`,
		],
		[`導出`, `選擇包含導出的檢查結果的目錄`],
		[`導入`, `選擇靜態可導入類`],
		[`緩存`, `沒有緩存，初始編制索引時間會顯著增加`],
		[`倉庫`, `選擇要合併的倉庫`],
		[`常量`, `接口中的常量必須具有初始值設定項`],
		[`界面`, `新的非模式提交界面可用。从工具窗口提交并在编辑器中查看差异。`],
		[`隊列`, `消息隊列連接(彈出視窗)`],
		[`掩碼`, `文件掩码(&F)`],

		[`博文`, `update.snap.message.with.blog.post=IDE 已通过 Snap 更新。<a href=\\\\"{0}\\\\">博文</a>。`],
		[`構建`, `构建专案`],
		[`進程`, `附加到进程`],
		[`調試`, `调试 'Project'`],
		[`常規`, `常规设定`],
		[`優化`, `优化 import`],
		[`插件`, `支援 依赖项 'java:com.google.inject:guice' 的套件当前尚未安装。`],
		[`軟件包`, `解除安装软件包。`],
		[`內存`, `內存檢視`],
		[`刷新`, `刷新文件历史记录`],

		[`階`, `或更高级别时`],

		[`案源`, `search.scope.project.source.files=项目源文件`],
		[`案源`, `search.scope.project.non.source.files=项目非源文件`],

	]).sort((a, b) => {
		return _comp(a[0], b[0])
	}).forEach(text => {

		test(_handleTitles(text), async () => {
			const expected = [text[0]].flat();

			assertTestExpected(expected);

			let actual = await processIdeaSegmentText(text[1]);

			lazyMatchSynonym001Not(actual, expected);
			//expect(actual).not.toContain(text[0])
			expect(actual).toMatchSnapshot();

		});

	});

})

/**
 * 檢查是否發生誤轉換
 * 轉換結果必須『包含』指定內容
 */
describe(`should include`, () => {

	(<ITestList>[

		[`顯示`, `顯示屏幕外圖像`],
		[`頁面`, `打开文件或项目。您也可以通过拖放到欢迎屏幕来打开项目或编辑文件。`],
		[`頁面`, `显示初始屏幕`],
		[`原始碼`, `选择根源代码`],
		[`全域類別庫`, `导入的项目引用了未知的全局库`],
		[`執行巨集`, `查看、更改、录制、播放宏`],
		[`駝峰式命名`, `<option name="切换骆驼拼写法" path="ActionManager" hit="切换骆驼拼写法/蛇形拼写法" />`],

		[`位元`, `不兼容的按位掩码运算`],

		[`導向`, `用于将面向对象的域模型映射到关系资料库的框架。`],

		[`常數`, `闭包使用外部非常量变数`],

		[`宣告`, `导航到上一个声明`],
		[`副檔名`, `找不到档案扩展名 ''{0}'' 的脚本引擎`],
		[`執行緒`, `框架不可用于未挂起的缐程`],
		[`堆疊`, `合并相同的堆栈跟踪`],
		[`運算子`, `操作符置于下一行`],
		[`右鍵選單`, `，然后从上下文菜单中选择“调试器”。`],
		[`物件`, `，对象`],
		[`標頭檔`, `，创建新的 Objective-C 类和头文件`],
		[`標頭檔`, `，创建新的 Objective-C 类和头档案`],
		[`整數型`, `使用非整型表达式 {1}{2} 指定了{0, choice, 0#宽度|1#精度|2#谓词}`],

		[`元素`, `單元素數組`],
		[`元素`, `最大元素數`],

		[`排程器`, `找不到进程调度程序的可用套接字连接埠`],

		[`萬用字元`, `可以使用有界通配符`],
		[`蛇形命名`, `常量和函数时报告使用蛇形拼写法而不是骆驼拼写法的情况`],

		[`執行緒`, `获取线程转储`],

		[`運行時版本`, `about.box.jre=运行时版本: {0} {1}`],
		[`構建`, `about.box.build.number=内部版本号 #{0}`],
		[`軟體套件`, `command.create.package=创建软件包`],
		[`記憶體`, `low.memory.notification.title=内存不足`],
		[`憑證`, `settings.password.internal.error.no.available.credential.store.implementation=内部错误，没有可用的凭据存储实现。`],

		[`背景`, `power.save.mode.on.notification.content=代码洞察和后台任务已禁用。`],
		[`背景`, `progress.window.empty.text=无后台任务`],
		[`背景`, `label.start.search.in.background=在后台开始搜寻`],

		[`模組`, `title.module.sub.group=模块子组`],

		[`應用`, `CFDeploymentEditor.dialog.title.reload.application.settings=重新加载应用程序设置`],
		[`套用`, `plugins.dialog.button=应用变更`],

		[`複`, `，并为重复语言结构设定初始大小。`],
		[`複`, `重复上一条命令`],
		[`複`, `程式码重复分析`],

		[`籤`, `书签名称为空`],

		[`實作`, `find.usages.panel.title.implementing.methods.cap=实现方法`],

		[`註`, `DockerRegistryConfigurable.error.unsupporded.registry=不支持的注册表`],
		[`註`, `dbgp.proxy.ide.unregister.success=IDE 已成功注销`],

		[`注`, `actions.show.injection.points=显示注入点`],
		[`注`, `configurable.clangTidy.min.supported.clangTidy.version=注意: 支援 7.0.0 或更高版本的 Clang-Tidy`],

		[`連字`, `checkbox.ligatures=字体连写`],

		//[`檢`, `checkout.operation.checked.out.new.branch.from=已从 {1} 中签出新分支 {0}`],
		//[`檢`, `branch.checking.out.new.branch.process=正在签出新分支 {0}…`],

		[`縮排`, `checkbox.show.indent.guides=显示缩进参考缐`],

		[`摺疊`, `action.Tree-selectChildExtendSelection.description=展开收起的节点或将子节点添加到选择范围。`],

		[`裝置`, `android.logcat.clear.log.action.tooltip=清除设备上的 logcat 缓冲区`],

		[`自訂`, `android.lint.inspections.clickable.view.accessibility=自定义视图中存在辅助功能`],

		[`螢光筆`, `action.ShowEditorHighlighterTokens.text=显示编辑器荧光笔令牌`],

		[`取色器`, `action.ShowColorPicker.text=显示拾色器`],

		[`存取器`, `encapsulate.fields.accessors.visibility.border.title=访问器可见性`],

		[`數位簽章`, `plugin.invalid.signature.result=''{0}'' 插件的数字签名验证失败并显示以下消息: ''{1}''。`],

		[
			`註`,
			`permission.dialog.call.unavailable=注: 當前的 Java Runtime 不支持音訊/語音聊天，但捆綁的 JetBrains 執行時支援。<a href="/runtime">點擊此處切換執行時</a>`,
		],

		[`註`, `将注解放置到单独的`],

		[`註`, `js.strict.mode.inspection.fix=添加“use strict”杂注`],

		[`開啟`, `action.Android.DeviceExplorer.Help.text=打开设备资源管理器帮助`],

		[`主控台`, `log.monitor.fragment.name=指定要在控制台中显示的日志`],

		[`授權`, `updates.channel.bundled.key=新版本有一个到期日期，不需要许可证密钥。`],

		[`初始設定式`, `inspection.compiler.javac.quirks.anno.array.comma.problem=注解数组初始值设定项中的尾随逗号可能会在某些 Javac 版本(例如 JDK 5 和 JDK 6)中导致编译错误。`],

		[
			`高階語言`,
			`advanced.language.feature=高级语言功能: {0}`
		],

		[`更高`, `或更高级别时`],

		[`進階`, `search.advanced.settings=搜索高级设置`],

		[`複`, `将复合声明转换为多个变量声明。`],

		[`複`, `stash.keep.index.tooltip=如果选中此复选框，已建立索引的变更将保留在索引中。`],

		[`文字游標`, `editor.settings.keep.trailing.spaces.on.caret.line=保留文本光标行中的尾随空格`],

		[`選單`, `action.PopupMenu-selectParent.text=选择父菜单项`],
		[`選單`, `action.PopupMenu-selectChild.text=选择子菜单项`],
		[`選單`, `action.PopupMenu-return.description=打开子菜单或从选定的菜单项中调用操作。`],

		[`選單`, `action.ShowMainMenu.text=显示主菜单`],

		[`上劃線`, `ANN.title.length=上划线长度必须与下划线匹配`],
		[`下劃線`, `ANN.title.length=上划线长度必须与下划线匹配`],

	]).sort((a, b) => {
		return _comp(a[0], b[0])
	}).forEach(text => {

		test(_handleTitles(text), async () => {
			const expected = [text[0]].flat();

			let actual = await processIdeaSegmentText(text[1]);

			assertTestExpected(expected);

			lazyMatchSynonym001(actual, expected);
			//expect(actual).toContain(text[0])
			expect(actual).toMatchSnapshot();

		});

	});

})

function _handleTitles(actual: [ITSValueOrArrayMaybeReadonly<string>, string]) {
	let arr = actual.slice();
	arr[0] = [arr[0]].flat().join('／');
	return arr.join(' - ')
}
