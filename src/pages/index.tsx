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
              Describe a contract once and generate reliable, type-safe code
            </Translate>
          </h1>
          <p className={styles.lead}>
            <Translate id="homepage.description">
              Describe domain data and application capabilities with Skel, then
              use skelc for validation, formatting, and multi-language code
              generation.
            </Translate>
          </p>
          <div className={styles.actions}>
            <Link className={styles.primaryAction} to="/docs/getting-started">
              <Translate id="homepage.start">Get started with Skel</Translate>
            </Link>
            <Link
              className={styles.secondaryAction}
              href="https://vine.yorun.ai">
              <Translate id="homepage.otherSite">Explore Vine</Translate>
            </Link>
          </div>
        </section>

        <section className={styles.flow} aria-label="Skel toolchain overview">
          <article>
            <span>01</span>
            <h2>Language</h2>
            <p>
              <Translate id="homepage.flow.language">
                Declare domains, data types, and Rpc, Web, Event, and Task
                contracts.
              </Translate>
            </p>
          </article>
          <article>
            <span>02</span>
            <h2>skelc</h2>
            <p>
              <Translate id="homepage.flow.compiler">
                Use the same compiler rules for formatting, validation,
                diagnostics, and editor support.
              </Translate>
            </p>
          </article>
          <article>
            <span>03</span>
            <h2>Generation</h2>
            <p>
              <Translate id="homepage.flow.generation">
                Generate Go, TypeScript, and public Skel artifacts while keeping
                contracts consistent.
              </Translate>
            </p>
          </article>
        </section>
      </main>
    </Layout>
  )
}
