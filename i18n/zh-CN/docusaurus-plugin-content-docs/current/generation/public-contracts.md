---
slug: /generation/public-contracts
---

# 公共契约

公开契约是 domain 对消费者作出的最小承诺。用 `pub` 标记声明，再导出精简 Skel：

```bash
skelc gen skel \
  --pub \
  --skel-in ./skel \
  --skel-out ./pub/skel
```

## 闭包规则

公开声明引用的本 domain data、enum、actor 或 resource 也必须显式 `pub`。skelc 不会静默扩大公开面；缺少标记会报错。

## 消费方式

消费者在源码中 `import` domain，并在生成命令中用 `--skel-import domain=PATH` 指向公开 Skel。不要让消费者读取生产方的完整私有契约目录。

## 演进规则

- 增加可选字段通常比修改或删除字段安全。
- 重命名 symbol、字段、方法或权限码属于兼容性变化。
- 修改公开声明后重新生成所有语言产物并通知消费者。
- 用版本化 module/package 传播公开契约，不依赖相邻目录的偶然路径。
