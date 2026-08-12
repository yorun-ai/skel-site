---
slug: /files-and-imports
---

# 文件与导入

skelc 的输入接受单个 `.skel` 文件，或代表一个 domain 的目录。实际项目用目录：声明按职责拆开，但仍然属于同一个契约。

## 每个文件都先声明 Domain

```skel
domain commerce.order
```

同一次输入加载的所有文件必须声明同一个 domain。目录模式下必须包含 `domain.skel`，而且这个文件只能放 domain 声明和可选的 `@desc`：

```skel title="skel/domain.skel"
@desc("订单领域契约")
domain commerce.order
```

其余声明放到其他文件：

```text
skel/
├── domain.skel
├── model.skel
├── permissions.skel
└── service.skel
```

skelc 按文件名顺序读取可见的 `.skel` 文件，隐藏文件、子目录和其他扩展名会被忽略。文件顺序只影响诊断与输出的稳定顺序，不影响声明之间的可见性。

## 导入其他 Domain

`import` 写在 domain 之后、顶层声明之前：

```skel
domain commerce.order

import identity.user
import commerce.catalog as catalog

data Order {
    buyer: user.UserSummary
    items: list<catalog.ProductRef>
}
```

没有 `as` 的时候，domain 的最后一段就是引用前缀：`identity.user` 用 `user`。当两个 domain 的末段同名，或者某个类型使用很频繁，显式设置别名就行。

`import` 表达的是逻辑依赖，不包含文件系统路径。`skelc check` 和语言服务器只校验当前输入，跨 domain 符号保持未解析，因此检查时只需提供源文件：

```bash
skelc check --skel-in ./order/skel
```

生成阶段会校验完整的 import 图。按下面的示例，通过可重复的 `--skel-import` 提供物理路径。每个映射指向的契约必须声明与映射键相同的 domain；你需要提供完整的传递依赖图，domain 之间的循环导入会被拒绝。

## 分开管理语言包路径

Skel 路径用于解析契约类型，生成的 Go 或 TypeScript 还需要自己的包映射：

```bash
skelc gen go-module \
  --skel-in ./order/skel \
  --skel-import identity.user=./user/pub/skel \
  --go-import identity.user=example.com/contracts/user \
  --go-out ./order/skeled \
  --go-module example.com/contracts/order
```

| 名称 | 示例 | 用途 |
| --- | --- | --- |
| Domain | `identity.user` | Skel 身份与兼容性 |
| 源码映射 | `identity.user=./user/pub/skel` | skelc 输入加载 |
| 包映射 | `identity.user=example.com/contracts/user` | 生成代码的 import |

仓库目录结构不要写进 domain 名。文件移动或构建环境变化时，domain 应该保持稳定。

## 依赖公共契约

消费方应该读取生产方生成的公共 Skel，而不是完整的内部源码。跨 domain 引用会受到公共边界约束，私有声明不会意外漏到另一个 domain 里去。

接下来阅读[类型与数据](/docs/types-and-data)，生成可导入契约的话参考[公共契约](/docs/generation/public-contracts)。
