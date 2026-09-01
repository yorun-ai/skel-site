---
slug: /workflow
---

# 日常工作流

推荐的本地和 CI 操作顺序：

```bash
skelc format --skel-in ./skel
skelc check --skel-in ./skel
```

`format` 统一文本形态，`check` 验证语义。格式化会原地写文件，建议先在干净工作树或者可审查的分支上执行。

## CI 示例

```bash
skelc format --skel-in ./skel
git diff --exit-code -- ./skel
skelc check --skel-in ./skel
```

这样，未格式化的契约不会进入主分支。生成代码的 CI 还应该重新生成并检查 diff，确保源码、skelc 版本和派生产物三者一致。

## 失败处理

优先修复同一根因下最早的那条诊断，同时用一次运行处理多个独立问题。机器读取日志的方式见[诊断与自动化](/docs/diagnostics)。
