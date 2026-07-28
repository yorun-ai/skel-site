import React from 'react'
import Link from '@docusaurus/Link'
import Translate, {translate} from '@docusaurus/Translate'
import useBaseUrl from '@docusaurus/useBaseUrl'
import {useDocsVersion} from '@docusaurus/plugin-content-docs/client'
import {ArrowUpRight} from 'lucide-react'
import {
  contractStages,
  guideGroups,
  skelMechanisms,
  type DocLink,
  type GuideLink as GuideLinkData,
} from '../../data/developerLanding'
import styles from './styles.module.css'

function useDocsPath(): (path: string) => string {
  const {isLast, version} = useDocsVersion()
  const docsBase = isLast
    ? '/docs'
    : version === 'current'
      ? '/docs/next'
      : `/docs/${version}`

  return (path: string) => `${docsBase}${path}`
}

function InlineDocLink({
  docsPath,
  link,
}: {
  docsPath: (path: string) => string
  link: DocLink
}) {
  return (
    <Link to={useBaseUrl(docsPath(link.to))}>
      <Translate id={link.title.id}>{link.title.text}</Translate>
      <span aria-hidden="true">↗</span>
    </Link>
  )
}

function GuideLink({
  docsPath,
  link,
}: {
  docsPath: (path: string) => string
  link: GuideLinkData
}) {
  return (
    <Link className={styles.guideLink} to={useBaseUrl(docsPath(link.to))}>
      <span>
        <strong>
          <Translate id={link.title.id}>{link.title.text}</Translate>
        </strong>
        <small>
          <Translate id={link.description.id}>
            {link.description.text}
          </Translate>
        </small>
      </span>
      <ArrowUpRight aria-hidden="true" size={15} strokeWidth={1.8} />
    </Link>
  )
}

export default function DeveloperLanding(): React.JSX.Element {
  const docsPath = useDocsPath()
  const firstContractPath = useBaseUrl(docsPath('/getting-started'))
  const languagePath = useBaseUrl(docsPath('/language'))
  const generationPath = useBaseUrl(docsPath('/generation'))
  const installationPath = useBaseUrl(docsPath('/installation'))
  const compatibilityPath = useBaseUrl(docsPath('/compatibility'))
  const shortcutsLabel = translate({
    id: 'homepage.a11y.shortcuts',
    message: 'Overview shortcuts',
  })

  return (
    <div className={`developer-landing ${styles.landing}`}>
      <header className={styles.intro}>
        <div className={styles.kicker}>
          <span>Skel</span>
          <span aria-hidden="true">·</span>
          <span>
            <Translate id="homepage.kicker">
              Contract DSL for AI programming governance
            </Translate>
          </span>
        </div>
        <h1>
          <Translate id="homepage.title">Overview</Translate>
        </h1>
        <p className={styles.lede}>
          <Translate id="homepage.description">
            Skel is a contract DSL and compiler for Vine applications. It puts
            domain types, caller identities, permissions, services, events,
            and tasks in one source that skelc can validate and generate.
          </Translate>{' '}
          <strong>
            <Translate id="homepage.description.ai">
              AI-generated changes meet a machine-checkable boundary before
              they enter application code.
            </Translate>
          </strong>
        </p>
        <nav aria-label={shortcutsLabel} className={styles.introLinks}>
          <Link to={firstContractPath}>
            <Translate id="homepage.actions.first">Create the first contract</Translate>
            <span aria-hidden="true">→</span>
          </Link>
          <Link to={languagePath}>
            <Translate id="homepage.actions.language">Read the language model</Translate>
            <span aria-hidden="true">→</span>
          </Link>
          <Link to={generationPath}>
            <Translate id="homepage.actions.generate">Choose an output</Translate>
            <span aria-hidden="true">→</span>
          </Link>
        </nav>
      </header>

      <section className={styles.section}>
        <div className={styles.sectionLead}>
          <p className={styles.sectionIndex}>01</p>
          <div>
            <h2>
              <Translate id="homepage.sections.mechanisms.title">
                What the compiler keeps explicit
              </Translate>
            </h2>
            <p>
              <Translate id="homepage.sections.mechanisms.description">
                Skel leaves algorithms to application code. It fixes the parts
                that domains, generated clients, and Vine runtime must agree on.
              </Translate>
            </p>
          </div>
        </div>

        <div className={styles.mechanisms}>
          {skelMechanisms.map((mechanism, index) => (
            <article key={mechanism.title.id}>
              <div className={styles.mechanismNumber}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <small>
                  <Translate id={mechanism.label.id}>
                    {mechanism.label.text}
                  </Translate>
                </small>
              </div>
              <div className={styles.mechanismBody}>
                <h3>
                  <Translate id={mechanism.title.id}>
                    {mechanism.title.text}
                  </Translate>
                </h3>
                <p>
                  <Translate id={mechanism.description.id}>
                    {mechanism.description.text}
                  </Translate>
                </p>
                <div className={styles.markers}>
                  {mechanism.markers.map((marker) => (
                    <code key={marker}>{marker}</code>
                  ))}
                </div>
                <div className={styles.mechanismLinks}>
                  {mechanism.links.map((link) => (
                    <InlineDocLink
                      docsPath={docsPath}
                      key={link.title.id}
                      link={link}
                    />
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionLead}>
          <p className={styles.sectionIndex}>02</p>
          <div>
            <h2>
              <Translate id="homepage.sections.loop.title">
                From contract to application
              </Translate>
            </h2>
            <p>
              <Translate id="homepage.sections.loop.description">
                Source, validation, generated code, and runtime integration stay
                separate, so each change has a clear review point.
              </Translate>
            </p>
          </div>
        </div>

        <ol className={styles.loopStages}>
          {contractStages.map((stage, index) => (
            <li key={stage.title.id}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div className={styles.stageHeading}>
                <strong>
                  <Translate id={stage.title.id}>{stage.title.text}</Translate>
                </strong>
                <code>{stage.artifact}</code>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionLead}>
          <p className={styles.sectionIndex}>03</p>
          <div>
            <h2>
              <Translate id="homepage.sections.guides.title">
                Read by the job at hand
              </Translate>
            </h2>
            <p>
              <Translate id="homepage.sections.guides.description">
                Start with the contract decision you need to make.
              </Translate>
            </p>
          </div>
        </div>

        <div className={styles.guideGroups}>
          {guideGroups.map((group) => (
            <section key={group.title.id}>
              <h3>
                <Translate id={group.title.id}>{group.title.text}</Translate>
              </h3>
              <div>
                {group.links.map((link) => (
                  <GuideLink
                    docsPath={docsPath}
                    key={link.title.id}
                    link={link}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>

      <aside className={styles.statusNote}>
        <span>
          <Translate id="homepage.status.label">Before 1.0</Translate>
        </span>
        <p>
          <Translate id="homepage.status.description">
            Pin skelc in development and CI, then review generated diffs when
            the compiler or a public contract changes.
          </Translate>{' '}
          <Link to={installationPath}>
            <Translate id="homepage.status.installation">Install skelc</Translate>
          </Link>
          <span aria-hidden="true"> · </span>
          <Link to={compatibilityPath}>
            <Translate id="homepage.status.compatibility">Compatibility</Translate>
          </Link>
        </p>
      </aside>
    </div>
  )
}
