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

		[`重命名`, `rename.react.hook.variable.title=重命名状态变量`],

		[`口中`, `action.EditSourceInNewWindow.text=在新窗口中打开源`],
		[`口中`, `action.EditSourceInNewWindow.description=在新窗口打开所选条目的编辑器并使之获得焦点`],

		[
			`文件`,
			`settings.s3.profile.name=配置文件名称:`
		],
		[
			`文件`,
			`export.test.results.output.filename.empty=输出文件名为空`
		],

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

		[`應用`, `应用程序`],
		[`應用`, `tooltip.text.password.will.be.stored.between.application.sessions=密码将存储在应用程序会话之间`],

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

		[`新增`, `button.add.separator=添加分隔符 (&S)`],

		[`重新導向`, `<option name="在重定向运算符后添加空格" hit="在重定向运算符后添加空格" />`],

		[`合併`, `PhpLanguageFeature.coalesce.operator=从 PHP 7.0 起才允许使用合并运算符`],

		[`類型`, `action.TypeHierarchy.Subtypes.text=子类型层次结构`],
		[`類型`, `action.TypeHierarchy.Supertypes.text=父类型层次结构`],

		[`新建`, `notification.title.server.restarted=正在重新建立到服务器的连接`],
		[`新建`, `notification.content.server.restarted=服务器 {0} 没有响应。{1} 正在尝试重新建立与其的连接。某些执行结果可能会丢失。`],

		[`函式`, `array.constructor.too.many.arguments=构造函数数组(Int)的实参过多`],

		[`呼叫`, `equals.called.on.array.display.name=在数组上调用了 'equals()'`],
		[`呼叫`, `extension.point.analyzer.reason.call.not.loop.value=调用不是循环的迭代值`],
		[`呼叫`, `js.convert.parameters.to.object.non.call.usage.will.not.be.updated=不更新非调用用法`],

		[`登入`, `dialog.message.login.empty=登录名为空`],

		[`建立`, `action.create.new.directory.or.package=创建新目录或软件包`],
		[`建立`, `empty.project.generator.description=不带模块的项目。用它来创建自由样式的模块结构。将打开“项目结构”对话框，帮助您构建项目结构。`],

		[`作業`, `preferred.theme.autodetect.selector=与操作系统同步`],

		[`動作`, `title.choose.action.icon=选择操作图标`],

		[`解析`, `could.not.resolve.constructor=无法解析构造函数`],

		[`解構`, `可查看所有可用的代码生成选项。使用此菜单，可以快速生成构造函数/析构函数、getter/setter、各种运算符和实现/重写函数。
在析构声明中添加缺失的组件。`],
		[`解構`, `在析构声明中添加缺失的组件。`],
		[`解構`, `在访问端将析构模式转换为一系列的引用或索引器表达式。`],

		[`建構`, `action.PhpGenerateConstructor.description=创建构造函数。`],

		[`檢視`, `press.completion.shortcut.again.for.more.results=再次按 {0} 可查看更多结果`],

		[`產生器`, `typescript.validation.generators.overload=重载签名无法被声明为生成器`],

		[`來源`, `javascript.validation.message.file.should.be.under.source.root=对象位于源根目录外的文件中，某些功能不可用`],
		[
			`資源根`,
			`action.Groovy.CheckResources.Rebuild.description=为资源根中的所有 Groovy 文件运行编译器，以检查编译问题`
		],
		[`資源根`, `icon.modules.testResourcesRoot.tooltip=测试资源根`],
		[`資源根`, `resource.root.path.component.title=资源根`],

		[`表單`, `error.form.file.is.invalid=窗体文件无效`],

		[`導覽列`, `action.EditorToggleShowBreadcrumbs.description=在当前编辑器中切换显示路径导航栏`],
		[`欄位`, `python.quick.fix.refactoring.set.default.value=您可以使用 {0} 导航字段和复选框。在选中该复选框的情况下，<ide/> 会将默认值内联到其他调用方，或将其设置为新参数的默认值。签名预览有助于您了解区别。现在，将默认值设置为 0。`],
		[`導覽列`, `action.ViewMembersInNavigationBar.text=导航栏中的成员`],

		[`遞迴`, `recursive.property.accessor=递归属性访问器`],

		/**
		 * @fixme
		 */
		//[`程式`, `运行程序`],
		//[`程序`, `terminating.process.progress.kill=终止进程`],

		[`連接埠`, `error.no.debug.listen.port=未指定的监听端口`],

		[`合併行`, `action.EditorJoinLines.text=连接行`],

		[`連線`, `string.buffer.to.string.in.concatenation.display.name=连接中的 'StringBuilder.toString()'`],
		[`連線`, `status.connected=已连接到目标 VM, 地址: ''{0}''`],

		[`主控台`, `action.IdeScriptingConsole.description=打开 IDE 脚本控制台`],

		[`相依`, `there.are.not.selected.module.dependencies.of.the.module.br.b.0.b=没有选择模块的模块依赖项: <br><b>{0}</b>`],

		[
			`重設`,
			`action.reset.font.size=重置为 {0}pt`
		],

		[
			`傾印`,
			`go.core.dump.dialog.specify.core.dump.validation.message=指定核心转储`
		],

		[
			`全螢幕`,
			`action.ToggleZenMode.description=同時切換免打擾和全屏模式`
		],

		[
			`區域`,
			`inspection.redundant.explicit.variable.type.description=可以省略局部变量的显式类型`
		],

		[
			`記憶體`,
			`附加内存代理`
		],

		[
			`記憶體`,
			`debug.memory.view.process=内存视图`
		],

		[
			`記憶體`,
			`in.memory.storage.presentable.name=内存存储`
		],

		[
			`記憶體`,
			`action.DatabaseView.ForceUnloadModel.text=强制从内存中卸载模型`
		],

		[
			`複`,
			`action.Github.Sync.Fork.description=相对于来源变基 GitHub 复刻仓库`
		],

		[
			`框`,
			`tooltip.close.search.bar.escape=关闭搜索栏(Esc 键)`
		],

		[
			`列`,
			`navigation.bar=导航栏`
		],
		[
			`列`,
			`checkbox.show.tool.window.bars=显示工具窗口栏`
		],
		[
			`列`,
			`show.status.bar=显示状态栏`
		],
		[
			`列`,
			`PhpDebugConfigurable.zero.configuration.install.toolbar.instruction=浏览器工具栏或小书签。`
		],
		[
			`列`,
			`python.sdk.installing.windows.warning=Windows 可能需要您批准后才能安装 Python。请检查任务栏。`
		],

		[
			`側邊列`,
			`action.RemoveStripeButton.text=从边栏中移除`
		],

		[
			`捲軸`,
			`滚动条`
		],
		[
			`捲軸`,
			`checkbox.show.editor.preview.popup=悬停在滚动栏上时显示代码透镜`
		],

		[
			`小工具`,
			`此意图会用微件包围所选组合代码。`
		],

		[
			`發送`,
			`action.CIDR.Interactive.SendIncludesToCling.text=将包含的标头发送到 Cling`
		],

		[
			`發送`,
			`action.SendEventLogStatistics.description=将事件日志文件发送到 QA 服务器`
		],

		[
			`追蹤`,
			`action.Vcs.CherryPick.description=所选提交由不同的 VCS 跟踪`
		],

		[
			`醒目提示`,
			`options.general.color.descriptor.highlighted.folding.border=文本//包含高亮显示的折叠文本`
		],

		[
			`醒目提示`,
			`options.java.attribute.descriptor.inline.parameter.hint.highlighted=内联提示//参数//高亮`
		],

		[
			`醒目提示`,
			`group.customfiletype.syntax.highlighting=语法高亮显示`
		],

		[
			`程式引數`,
			`cmake.macro.program.arguments.description=当前 CMake 运行配置的程序实参`
		],

		[
			`重定基底`,
			`action.hg4idea.pull.rebase.tooltip=将变更集变基到作为目标的分支提示`
		],

		[
			`參照`,
			`javascript.validation.message.this.referenced.from.static.context=在 static 上下文中引用了 'this'`
		],

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
