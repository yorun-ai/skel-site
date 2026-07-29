---
slug: /troubleshooting
---

# 问题排查

## 找不到 `domain.skel`

目录模式要求在输入目录下直接放一个 `domain.skel`。skelc 只会读当前目录，不会递归进子目录。

## domain 或 import 不一致

确认所有文件声明了相同的 domain，import 放在顶层声明之前，生成命令中 `--skel-import` 的 key 使用的是完整 domain 名。

## 公开依赖报错

公开 service/event 引用的本地 data、enum、actor 或 resource 也需要标上 `pub`。推荐的做法是：要么缩小引用范围，要么显式公开依赖——总之不要绕过检查。

## 生成文件没有被清理

skelc 自动清理的范围很克制：只删 `.skelc-manifest.json` 里记录的、已不再生成且内容没被动过的文件。没进清单的文件、被手工改过的过期生成文件都会被保留。确认不再需要后，手工删掉就行。另外注意：如果手写文件和当前生成的文件刚好同路径，生成时会被覆盖。

## 生成 Go 代码版本不兼容

检查 `skelc version`、生成的 `go.mod` 和应用使用的 Vine 版本。升级后记得重新生成，不要只手动改 require。

## 仍有问题？

用 `--log-format jsonl` 把完整诊断保存下来，附上最小输入、命令、skelc 版本和平台信息，然后提 issue。
