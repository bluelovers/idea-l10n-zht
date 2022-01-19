# README.md

    Jetbrains IntelliJ Chinese (Traditional) Language Pack / 繁體中文語言包

The Chinese Language Pack localizes the UI of IntelliJ IDEA, AppCode, CLion, DataGrip, GoLand, PyCharm, PhpStorm, RubyMine, and WebStorm into Chinese.

中文語言包將為您的 IntelliJ IDEA, AppCode, CLion, DataGrip, GoLand, PyCharm, PhpStorm, RubyMine, 和WebStorm 帶來中文化的界面。

## install

- install from [github](https://github.com/bluelovers/idea-l10n-zht/raw/master/plugin-dev-out/zh.jar)
- install from [jetbrains](https://plugins.jetbrains.com/plugin/18365-chinese-traditional-language-pack-----)

> 注意：請先移除或禁用[官方簡體中文語言包](https://plugins.jetbrains.com/plugin/13710-chinese-simplified-language-pack----)

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

## .properties

透過 [lib/static/lazy.properties](lib/static/lazy.properties) 可無視分詞轉換結果直接取代內容

## 其他

有部分無法透過分詞系統來轉換的則可以透過編輯以下檔案來完善

- lib/segment.ts

## TODO

