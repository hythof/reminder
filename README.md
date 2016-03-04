# why
一箇所で何でも検索できる何かが欲しい

##「何でもの」定義
- 後で見たいと思ったもの
- 自分がオーナーシップを持つものに限る

##「検索項目」の定義
- フリーワード
- タグ

##「検索表示内容」の定義
- 見出し
- サムネイル(text or image)

##「検索結果の表示順」の定義
- 評価値順



# how
- WebサーバとWebブラウザで実現
- 更新はstorageを直接触る
- PC間同期はgit

browser : chrome
api     : golang server
storage : plain text file

(1)インデックス取得
  browser    api    storage
  |--------->|      |
  |          |<---->|
  |<---------|      |
1.1 http get
1.2 file read
1.3 index json

(2)バイナリ取得
  browser    api    storage
  |--------->|      |
  |          |<---->|
  |<---------|      |
1.1 http get
1.2 file read
1.3 mp3 / mp4 / pdf



# who
- me



# security
- スタンドアローンで動作



# privacy
- 一部コンテンツはgpgで暗号化



# testing
- 単体テスト
- 負荷テスト(テキストで1G、バイナリで100G)



# monitoring
- スタンドアローンのため不要



# TODO
[] バイナリの表示対応
[] Javascriptで全文検索
[] UX頑張る
