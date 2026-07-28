import React, {type ComponentType} from 'react';
import Link from '@docusaurus/Link';
import Translate from '@docusaurus/Translate';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {
  Code2,
  FileCheck2,
  FileCode2,
  GitBranch,
  PackageOpen,
  Rocket,
  ScrollText,
  SquareTerminal,
  WandSparkles,
} from 'lucide-react';
import styles from './styles.module.css';

type LandingCard = {
  titleId: string;
  title: string;
  descriptionId: string;
  description: string;
  to: string;
  icon: ComponentType<{size?: number; strokeWidth?: number}>;
};

const gettingStarted: LandingCard[] = [
  {
    titleId: 'homepage.cards.installation.title',
    title: 'Install skelc',
    descriptionId: 'homepage.cards.installation.description',
    description: 'Install the Skel compiler and verify your local toolchain.',
    to: '/docs/installation',
    icon: SquareTerminal,
  },
  {
    titleId: 'homepage.cards.quickStart.title',
    title: 'Quick start',
    descriptionId: 'homepage.cards.quickStart.description',
    description: 'Write, validate, and generate code from your first contract.',
    to: '/docs/getting-started',
    icon: Rocket,
  },
  {
    titleId: 'homepage.cards.language.title',
    title: 'Language overview',
    descriptionId: 'homepage.cards.language.description',
    description: 'Learn how Skel models domains, data, and application capabilities.',
    to: '/docs/language',
    icon: FileCode2,
  },
  {
    titleId: 'homepage.cards.contractDesign.title',
    title: 'Contract design',
    descriptionId: 'homepage.cards.contractDesign.description',
    description: 'Design stable boundaries that can evolve across applications.',
    to: '/docs/contract-design',
    icon: GitBranch,
  },
];

const guides: LandingCard[] = [
  {
    titleId: 'homepage.cards.workflow.title',
    title: 'Validation workflow',
    descriptionId: 'homepage.cards.workflow.description',
    description: 'Format and validate contracts locally and in CI.',
    to: '/docs/workflow',
    icon: FileCheck2,
  },
  {
    titleId: 'homepage.cards.syntax.title',
    title: 'Syntax reference',
    descriptionId: 'homepage.cards.syntax.description',
    description: 'Look up declarations, types, annotations, and language rules.',
    to: '/docs/syntax',
    icon: ScrollText,
  },
  {
    titleId: 'homepage.cards.generation.title',
    title: 'Code generation',
    descriptionId: 'homepage.cards.generation.description',
    description: 'Generate Go, TypeScript, Go modules, and public contracts.',
    to: '/docs/generation',
    icon: WandSparkles,
  },
  {
    titleId: 'homepage.cards.editor.title',
    title: 'Editor integration',
    descriptionId: 'homepage.cards.editor.description',
    description: 'Use diagnostics, formatting, and language features in your editor.',
    to: '/docs/editor',
    icon: Code2,
  },
  {
    titleId: 'homepage.cards.vine.title',
    title: 'Vine integration',
    descriptionId: 'homepage.cards.vine.description',
    description: 'Connect generated contracts to Vine applications and runtime types.',
    to: '/docs/vine-integration',
    icon: PackageOpen,
  },
];

function Card({card}: {card: LandingCard}) {
  const Icon = card.icon;
  const localizedPath = useBaseUrl(card.to);

  return (
    <Link className={styles.card} to={localizedPath}>
      <div className={styles.cardVisual}>
        <Icon size={20} strokeWidth={1.8} />
      </div>
      <div className={styles.cardBody}>
        <h3>
          <Translate id={card.titleId}>{card.title}</Translate>
        </h3>
        <p>
          <Translate id={card.descriptionId}>{card.description}</Translate>
        </p>
      </div>
    </Link>
  );
}

function CardGrid({cards}: {cards: LandingCard[]}) {
  return (
    <div className={styles.grid}>
      {cards.map((card) => (
        <Card card={card} key={card.to} />
      ))}
    </div>
  );
}

export default function DeveloperLanding(): React.JSX.Element {
  return (
    <div className={`developer-landing ${styles.landing}`}>
      <header className={styles.intro}>
        <span className={styles.eyebrow}>Skel</span>
        <h1>
          <Translate id="homepage.title">Skel Developers</Translate>
        </h1>
        <p>
          <Translate id="homepage.description">
            Design explicit application contracts and generate reliable,
            type-safe code.
          </Translate>
        </p>
      </header>

      <section className={styles.section}>
        <h2>
          <Translate id="homepage.sections.gettingStarted">
            Getting started
          </Translate>
        </h2>
        <CardGrid cards={gettingStarted} />
      </section>

      <section className={styles.section}>
        <h2>
          <Translate id="homepage.sections.guides">Guides</Translate>
        </h2>
        <CardGrid cards={guides} />
      </section>
    </div>
  );
}
