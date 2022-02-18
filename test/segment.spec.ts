import { lazyMatchSynonym001, lazyMatchSynonym001Not } from '@novel-segment/assert';
import { processIdeaSegmentText } from '../lib/segment';
import { ITSValueOrArrayMaybeReadonly } from 'ts-type/lib/type/base';

jest.setTimeout(60 * 1000);

type ITestList = [ITSValueOrArrayMaybeReadonly<string>, string][];

/**
 * 檢查是否確實轉換
 * 通過測試不代表轉換符合預期，因為檢查詞必須要正確設定才可以
 */
describe(`segment`, () =>
{

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
		[`全局库`, `导入的项目引用了未知的全局库`],
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
		[`光標`, `從文本光標開始的所有內容`],
		[`標識符`, `不允許在一個模板中混用駝峰拼寫法和小寫標識符`],
		[`骆驼拼写法`, `使用骆驼拼写法样式的方法名，没有 "get" 前缀，第一个字符大写。 例如，属性名称 '_my_property' 被转换为 'MyProperty'。`],
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

	]).forEach(text =>
	{

		test(_handleTitles(text), async () =>
		{

			let actual = await processIdeaSegmentText(text[1]);

			lazyMatchSynonym001Not(actual, [text[0]].flat());
			//expect(actual).not.toContain(text[0])
			expect(actual).toMatchSnapshot();

		});

	});

})

/**
 * 檢查是否發生誤轉換
 */
describe(`should include`, () =>
{

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

	]).forEach(text =>
	{

		test(_handleTitles(text), async () =>
		{

			let actual = await processIdeaSegmentText(text[1]);

			lazyMatchSynonym001(actual, [text[0]].flat());
			//expect(actual).toContain(text[0])
			expect(actual).toMatchSnapshot();

		});

	});

})

function _handleTitles(actual: [ITSValueOrArrayMaybeReadonly<string>, string])
{
	let arr = actual.slice();
	arr[0] = [arr[0]].flat().join('／');
	return arr.join(' - ')
}
