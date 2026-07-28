---
slug: /workflow
---

# 日常工作流

推荐的本地与 CI 顺序是：

```bash
skelc format --skel-in ./skel
skelc check --skel-in ./skel
```

`format` 统一文本形态，`check` 验证语义。格式化会原地写文件，应先在干净工作树或可审查分支执行。

## CI 示例

```bash
skelc format --skel-in ./skel
git diff --exit-code -- ./skel
skelc check --skel-in ./skel
```

这样可以阻止未格式化契约进入主分支。生成代码的 CI 还应重新生成并检查 diff，确保源码、编译器版本和派生产物一致。

## 失败处理

优先修复同一根因下最早的诊断，但可以在一次运行中查看并处理多个独立问题。机器读取日志见[诊断与自动化](/docs/diagnostics)。
