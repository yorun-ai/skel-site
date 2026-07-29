---
slug: /generation/public-contracts
---

# 公共契约

公开契约是 domain 对消费者作出的最小承诺。用 `pub` 标记要公开的声明，再导出精简版 Skel：

```bash
skelc gen skel \
  --pub \
  --skel-in ./skel \
  --skel-out ./pub/skel
```

## 闭包规则

公开声明引用了本 domain 的 data、enum、actor 或 resource，那这些被引用的也都要显式标上 `pub`。skelc 不会偷偷帮你扩大公开面——缺了标记就报错，这样反而更安全。

## 消费方式

消费者在源码里 `import` domain，生成命令中用 `--skel-import domain=PATH` 指向公开 Skel 即可。注意：让消费者直接读生产方的完整私有契约目录可不是好习惯——保持用公开 Skel 做接口。

## 演进规则

- 增加可选字段，比修改或删除已有字段更安全。
- 重命名 symbol、字段、方法或权限码，属于兼容性变化。
- 公开声明改完之后，记得重新生成所有语言产物，并通知消费者。
- 推荐用版本化的 module/package 来分发公开契约，而不是依赖相邻目录的“碰巧能读到”的相对路径。
