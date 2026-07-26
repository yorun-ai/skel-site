import React, {type ReactNode} from 'react'
import Link from '@docusaurus/Link'
import Layout from '@theme/Layout'
import Translate from '@docusaurus/Translate'

import styles from './index.module.css'

export default function Home(): ReactNode {
  return (
    <Layout
      title="Skel"
      description="Describe application contracts and generate type-safe code with skelc.">
      <main className={styles.main}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Skel</p>
          <h1>
            <Translate id="homepage.title">
              描述一次契约，生成可靠的类型安全代码
            </Translate>
          </h1>
          <p className={styles.lead}>
            <Translate id="homepage.description">
              使用 Skel
              描述领域数据和应用能力，通过 skelc 完成校验、格式化和多语言代码生成。
            </Translate>
          </p>
          <div className={styles.actions}>
            <Link className={styles.primaryAction} to="/docs/getting-started">
              <Translate id="homepage.start">开始使用 Skel</Translate>
            </Link>
            <Link
              className={styles.secondaryAction}
              href="https://vine.yorun.ai">
              <Translate id="homepage.otherSite">了解 Vine</Translate>
            </Link>
          </div>
        </section>

        <section className={styles.flow} aria-label="Skel toolchain overview">
          <article>
            <span>01</span>
            <h2>Language</h2>
            <p>
              <Translate id="homepage.flow.language">
                声明 domain、数据类型以及 Rpc、Web、Event 和 Task 契约。
              </Translate>
            </p>
          </article>
          <article>
            <span>02</span>
            <h2>skelc</h2>
            <p>
              <Translate id="homepage.flow.compiler">
                使用同一套编译规则完成格式化、校验、诊断与编辑器支持。
              </Translate>
            </p>
          </article>
          <article>
            <span>03</span>
            <h2>Generation</h2>
            <p>
              <Translate id="homepage.flow.generation">
                生成 Go、TypeScript 和公开 Skel 产物，保持契约一致。
              </Translate>
            </p>
          </article>
        </section>
      </main>
    </Layout>
  )
}
