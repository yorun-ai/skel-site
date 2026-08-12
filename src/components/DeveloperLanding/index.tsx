import React from 'react'
import Link from '@docusaurus/Link'
import Translate, {translate} from '@docusaurus/Translate'
import useBaseUrl from '@docusaurus/useBaseUrl'
import {useDocsVersion} from '@docusaurus/plugin-content-docs/client'
import {
  ArrowRight,
  ArrowUpRight,
  Braces,
  Check,
  CheckCircle2,
  Code2,
  FileCode2,
  Layers3,
  Route,
  ShieldCheck,
  Sparkles,
  SquareTerminal,
  type LucideIcon,
} from 'lucide-react'
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

const mechanismIcons: LucideIcon[] = [
  Layers3,
  ShieldCheck,
  CheckCircle2,
  Code2,
]

const guideIcons: LucideIcon[] = [Sparkles, Route, SquareTerminal]

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
      <ArrowUpRight aria-hidden="true" size={14} strokeWidth={1.8} />
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
      <ArrowUpRight aria-hidden="true" size={16} strokeWidth={1.8} />
    </Link>
  )
}

function CompilerVisual() {
  const visualLabel = translate({
    id: 'homepage.visual.ariaLabel',
    message:
      'A Skel source contract is validated once and compiled into typed Go, TypeScript, and runtime artifacts.',
  })

  return (
    <figure aria-label={visualLabel} className={styles.compilerVisual}>
      <div className={styles.visualToolbar}>
        <div className={styles.fileName}>
          <FileCode2 aria-hidden="true" size={15} strokeWidth={1.8} />
          <code>commerce.order.skel</code>
        </div>
        <span className={styles.validBadge}>
          <Check aria-hidden="true" size={12} strokeWidth={2.4} />
          <Translate id="homepage.visual.validated">Validated</Translate>
        </span>
      </div>

      <div className={styles.sourceCode} aria-hidden="true">
        <div>
          <span className={styles.lineNumber}>1</span>
          <code>
            <span className={styles.codeKeyword}>domain</span>{' '}
            commerce.order
          </code>
        </div>
        <div>
          <span className={styles.lineNumber}>2</span>
          <code />
        </div>
        <div>
          <span className={styles.lineNumber}>3</span>
          <code>
            <span className={styles.codeKeyword}>pub data</span> Order {'{'}
          </code>
        </div>
        <div>
          <span className={styles.lineNumber}>4</span>
          <code>
            {'  '}id: <span className={styles.codeType}>uuid</span>
          </code>
        </div>
        <div>
          <span className={styles.lineNumber}>5</span>
          <code>
            {'  '}status: <span className={styles.codeType}>string</span>
          </code>
        </div>
        <div>
          <span className={styles.lineNumber}>6</span>
          <code>{'}'}</code>
        </div>
      </div>

      <div className={styles.compilerBar}>
        <div className={styles.compilerCommand}>
          <SquareTerminal aria-hidden="true" size={15} strokeWidth={1.8} />
          <div>
            <span>skelc</span>
            <code>check → gen</code>
          </div>
        </div>
        <span className={styles.compilerState}>
          <span aria-hidden="true" />
          <Translate id="homepage.visual.model">Resolved model</Translate>
        </span>
      </div>

      <div className={styles.outputGrid}>
        <div>
          <Braces aria-hidden="true" size={16} strokeWidth={1.8} />
          <span>
            <Translate id="homepage.visual.outputs.go">Go contracts</Translate>
          </span>
        </div>
        <div>
          <Code2 aria-hidden="true" size={16} strokeWidth={1.8} />
          <span>
            <Translate id="homepage.visual.outputs.typescript">
              TypeScript client
            </Translate>
          </span>
        </div>
        <div>
          <Layers3 aria-hidden="true" size={16} strokeWidth={1.8} />
          <span>
            <Translate id="homepage.visual.outputs.schema">
              Domain schema
            </Translate>
          </span>
        </div>
      </div>
    </figure>
  )
}

export default function DeveloperLanding(): React.JSX.Element {
  const docsPath = useDocsPath()
  const firstContractPath = useBaseUrl(docsPath('/getting-started'))
  const languagePath = useBaseUrl(docsPath('/language'))
  const workflowPath = useBaseUrl(docsPath('/workflow'))
  const shortcutsLabel = translate({
    id: 'homepage.a11y.shortcuts',
    message: 'Overview shortcuts',
  })
  const heroTitle = translate({
    id: 'homepage.title',
    message: 'One contract. Every boundary in sync.',
  })
  const heroTitleBreak = Math.max(
    heroTitle.indexOf('，'),
    heroTitle.indexOf('.'),
  )

  return (
    <div className={`developer-landing ${styles.landing}`}>
      <header className={styles.hero}>
        <div className={styles.heroCopy}>
          <h1>
            {heroTitleBreak >= 0 ? (
              <>
                <span>{heroTitle.slice(0, heroTitleBreak + 1)}</span>
                <span>{heroTitle.slice(heroTitleBreak + 1).trimStart()}</span>
              </>
            ) : (
              heroTitle
            )}
          </h1>
          <p className={styles.lede}>
            <Translate id="homepage.description">
              Model domain types, callers, permissions, services, events, and
              tasks in Skel. skelc validates the contract once, then generates
              the typed boundaries each consumer needs.
            </Translate>
          </p>
          <nav aria-label={shortcutsLabel} className={styles.heroActions}>
            <Link className={styles.primaryAction} to={firstContractPath}>
              <Translate id="homepage.actions.first">
                Build your first contract
              </Translate>
              <ArrowRight aria-hidden="true" size={16} strokeWidth={2} />
            </Link>
            <Link className={styles.secondaryAction} to={languagePath}>
              <Translate id="homepage.actions.language">
                Explore the language
              </Translate>
            </Link>
          </nav>
        </div>

        <CompilerVisual />
      </header>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>
            <Translate id="homepage.sections.mechanisms.eyebrow">
              Core capabilities
            </Translate>
          </p>
          <h2>
            <Translate id="homepage.sections.mechanisms.title">
              A stable boundary, end to end
            </Translate>
          </h2>
          <p>
            <Translate id="homepage.sections.mechanisms.description">
              Skel leaves implementation details in application code and keeps
              every cross-language decision explicit, validated, and
              reviewable.
            </Translate>
          </p>
        </div>

        <div className={styles.capabilityGrid}>
          {skelMechanisms.map((mechanism, index) => {
            const MechanismIcon = mechanismIcons[index]

            return (
              <article
                className={styles.capabilityCard}
                key={mechanism.title.id}
              >
                <div className={styles.cardTopline}>
                  <span className={styles.cardIcon}>
                    <MechanismIcon
                      aria-hidden="true"
                      size={20}
                      strokeWidth={1.8}
                    />
                  </span>
                  <span className={styles.cardLabel}>
                    <Translate id={mechanism.label.id}>
                      {mechanism.label.text}
                    </Translate>
                  </span>
                </div>
                <div className={styles.markers} aria-hidden="true">
                  {mechanism.markers.map((marker) => (
                    <code key={marker}>{marker}</code>
                  ))}
                </div>
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
                <div className={styles.cardLinks}>
                  {mechanism.links.map((link) => (
                    <InlineDocLink
                      docsPath={docsPath}
                      key={link.title.id}
                      link={link}
                    />
                  ))}
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section className={`${styles.section} ${styles.workflowSection}`}>
        <div className={styles.workflowHeading}>
          <div className={styles.sectionHeader}>
            <p className={styles.eyebrow}>
              <Translate id="homepage.sections.loop.eyebrow">
                Compiler workflow
              </Translate>
            </p>
            <h2>
              <Translate id="homepage.sections.loop.title">
                A clear review point at every step
              </Translate>
            </h2>
            <p>
              <Translate id="homepage.sections.loop.description">
                Source, validation, generated code, and runtime integration stay
                separate. You can inspect the boundary before it becomes
                application code.
              </Translate>
            </p>
          </div>
          <Link className={styles.textAction} to={workflowPath}>
            <Translate id="homepage.sections.loop.action">
              See the daily workflow
            </Translate>
            <ArrowRight aria-hidden="true" size={15} strokeWidth={2} />
          </Link>
        </div>

        <ol className={styles.workflowGrid}>
          {contractStages.map((stage, index) => (
              <li key={stage.title.id}>
                <div className={styles.stageMeta}>
                  <code>{stage.artifact}</code>
                </div>
                <h3>
                  <span className={styles.stageNumber}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <Translate id={stage.title.id}>{stage.title.text}</Translate>
                </h3>
                <p>
                  <Translate id={stage.description.id}>
                    {stage.description.text}
                  </Translate>
                </p>
                {index < contractStages.length - 1 ? (
                  <ArrowRight
                    aria-hidden="true"
                    className={styles.stageArrow}
                    size={17}
                    strokeWidth={1.7}
                  />
                ) : null}
              </li>
            ))}
        </ol>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>
            <Translate id="homepage.sections.guides.eyebrow">
              Documentation paths
            </Translate>
          </p>
          <h2>
            <Translate id="homepage.sections.guides.title">
              Choose the job in front of you
            </Translate>
          </h2>
          <p>
            <Translate id="homepage.sections.guides.description">
              Start with a working contract, go deeper on boundary design, or
              make the compiler part of delivery.
            </Translate>
          </p>
        </div>

        <div className={styles.guideGroups}>
          {guideGroups.map((group, index) => {
            const GuideIcon = guideIcons[index]

            return (
              <section className={styles.guideGroup} key={group.title.id}>
                <div className={styles.guideGroupHeading}>
                  <span className={styles.guideGroupIcon}>
                    <GuideIcon aria-hidden="true" size={19} strokeWidth={1.8} />
                  </span>
                  <h3>
                    <Translate id={group.title.id}>{group.title.text}</Translate>
                  </h3>
                </div>
                <p>
                  <Translate id={group.description.id}>
                    {group.description.text}
                  </Translate>
                </p>
                <div className={styles.guideLinks}>
                  {group.links.map((link) => (
                    <GuideLink
                      docsPath={docsPath}
                      key={link.title.id}
                      link={link}
                    />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      </section>

    </div>
  )
}
