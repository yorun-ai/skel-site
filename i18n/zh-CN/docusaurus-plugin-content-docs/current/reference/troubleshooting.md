---
slug: /troubleshooting
---

# 排障

## 找不到 `domain.skel`

目录模式必须在输入目录直接包含 `domain.skel`。skelc 不递归读取子目录。

## domain 或 import 不一致

确认所有文件声明相同 domain，import 位于顶层声明之前，生成命令中的 `--skel-import` key 使用完整 domain 名。

## 公开依赖报错

公开 service/event 引用的本地 data、enum、actor 或 resource 也需要 `pub`。缩小引用或显式公开依赖，不要绕过检查。

## 生成文件没有被清理

skelc 只会自动删除 `.skelc-manifest.json` 中记录、已不再生成且内容未被修改的文件。未纳入清单的文件和被手工修改的过期生成文件都会保留；确认不再需要后可手工删除。若手写文件与当前生成文件同路径，生成时仍会被覆盖。

## 生成 Go 代码版本不兼容

检查 `skelc version`、生成 `go.mod` 和应用使用的 Vine 版本。升级后重新生成，不要只手改 require。

## 仍无法定位

使用 `--log-format jsonl` 保存完整诊断，记录最小输入、命令、skelc 版本和平台信息，再提交 issue。
