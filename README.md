# README.md

    Jetbrains IntelliJ Chinese (Traditional) Language Pack / 繁體中文語言包

The Chinese Language Pack localizes the UI of IntelliJ IDEA, AppCode, CLion, DataGrip, GoLand, PyCharm, PhpStorm, RubyMine, and WebStorm into Chinese.

中文語言包將為您的 IntelliJ IDEA, AppCode, CLion, DataGrip, GoLand, PyCharm, PhpStorm, RubyMine, 和WebStorm 帶來中文化的界面。

## install

- install from [github](https://github.com/bluelovers/idea-l10n-zht/raw/master/plugin-dev-out/zh.jar) (推薦安裝此版本來得到最新版本)
- install from [jetbrains](https://plugins.jetbrains.com/plugin/18365-chinese-traditional-language-pack-----)

> 注意：請先移除或禁用[官方簡體中文語言包](https://plugins.jetbrains.com/plugin/13710-chinese-simplified-language-pack----)

## dev

請額外自行安裝 typescript@next jest ts-jest ts-node ynpx lerna yarn-tool

或執行 `yarn ci:install`

## 基於分詞系統的替換字詞說明

### [lib/static/synonym.txt](lib/static/synonym.txt)

此檔案放置轉換用詞，格式為 `最終顯示的字詞,替換的字詞`

然後由於每次轉換都是以原始簡體檔案來做轉換，所以替換的字詞請包含簡體

實際添加的內容請直接查看檔案內容做參考

### [lib/static/table.txt](lib/static/table.txt)

此檔案放置分詞系統的字典庫

請參考 

- https://github.com/bluelovers/ws-segment/blob/master/packages/%40novel-segment/postag/lib/postag/ids.ts
- https://github.com/bluelovers/ws-segment/blob/master/packages/novel-segment/test/demo.cache.ts#L97

### [test/segment-check.ts](test/segment-check.ts)

在 [test/temp/*.txt](test/temp) 資料夾底下新增任何副檔名為 .txt 檔案
之後執行此腳本 則可以查看分詞系統分詞後結果  
來了解 為什麼沒有發生預期的轉換

## .properties

透過 [lib/static/lazy.properties](lib/static/lazy.properties) 可無視分詞轉換結果直接取代內容

## 其他

有部分無法透過分詞系統來轉換的則可以透過編輯以下檔案來完善

- lib/segment.ts

- [OBFUSCATE 混淆與曖昧](OBFUSCATE.md) 此檔案放置需要確認或討論的項目

## TODO

- 自動偵測抓取原版簡體最新下載網址

## 已知問題

- `dot-properties-loader` 會將 `label.inactive.timeout.sec= 秒` 轉換為 `label.inactive.timeout.sec=秒` 對於 IDEA 的實際影響則不清楚，照一般來說等號後的空白應該是不會被當作內容值
- 

