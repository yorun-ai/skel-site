export type LocalizedCopy = {
  id: string
  text: string
}

export type DocLink = {
  title: LocalizedCopy
  to: string
}

export type ContractStage = {
  title: LocalizedCopy
  description: LocalizedCopy
  artifact: string
}

export type SkelMechanism = {
  label: LocalizedCopy
  title: LocalizedCopy
  description: LocalizedCopy
  markers: string[]
  links: DocLink[]
}

export type GuideLink = DocLink & {
  description: LocalizedCopy
}

export type GuideGroup = {
  title: LocalizedCopy
  description: LocalizedCopy
  links: GuideLink[]
}

export const contractStages: ContractStage[] = [
  {
    title: {id: 'homepage.loop.declare.title', text: 'Declare'},
    description: {
      id: 'homepage.loop.declare.description',
      text: 'Write the domain boundary once in readable Skel.',
    },
    artifact: '.skel',
  },
  {
    title: {id: 'homepage.loop.check.title', text: 'Check'},
    description: {
      id: 'homepage.loop.check.description',
      text: 'Validate the local input and stop invalid contracts early.',
    },
    artifact: 'skelc check',
  },
  {
    title: {id: 'homepage.loop.generate.title', text: 'Generate'},
    description: {
      id: 'homepage.loop.generate.description',
      text: 'Produce deterministic artifacts for each consumer.',
    },
    artifact: 'skelc gen',
  },
  {
    title: {id: 'homepage.loop.integrate.title', text: 'Integrate'},
    description: {
      id: 'homepage.loop.integrate.description',
      text: 'Wire the generated boundary into Vine and tests.',
    },
    artifact: 'Vine + tests',
  },
]

export const skelMechanisms: SkelMechanism[] = [
  {
    label: {id: 'homepage.mechanisms.domain.label', text: 'Domain'},
    title: {
      id: 'homepage.mechanisms.domain.title',
      text: 'One model owns the shared vocabulary',
    },
    description: {
      id: 'homepage.mechanisms.domain.description',
      text: 'Domain names, imports, data, enums, and configuration form one resolved model instead of a set of unrelated server and client types.',
    },
    markers: ['domain', 'import', 'data', 'enum', 'config'],
    links: [
      {
        title: {id: 'homepage.links.languageModel', text: 'Language Model'},
        to: '/language',
      },
      {
        title: {id: 'homepage.links.typesData', text: 'Types & Data'},
        to: '/types-and-data',
      },
    ],
  },
  {
    label: {id: 'homepage.mechanisms.access.label', text: 'Access'},
    title: {
      id: 'homepage.mechanisms.access.title',
      text: 'Callers and permissions are contract data',
    },
    description: {
      id: 'homepage.mechanisms.access.description',
      text: 'Actors name callers and entry transports. Resources, actions, checks, and require expressions keep authorization intent beside the capability it protects.',
    },
    markers: ['actor', 'via', 'resource', 'require', 'auth'],
    links: [
      {
        title: {id: 'homepage.links.actorsAccess', text: 'Actors & Access'},
        to: '/actors-and-access',
      },
      {
        title: {id: 'homepage.links.permissions', text: 'Permission Model'},
        to: '/permissions',
      },
    ],
  },
  {
    label: {id: 'homepage.mechanisms.validation.label', text: 'Validation'},
    title: {
      id: 'homepage.mechanisms.validation.title',
      text: 'Invalid boundaries stop before generation',
    },
    description: {
      id: 'homepage.mechanisms.validation.description',
      text: 'skelc checks names, types, imports, public closure, actor transports, permission paths, decorators, and reference cycles in one diagnostic model.',
    },
    markers: ['format', 'check', 'diagnostics', 'public closure'],
    links: [
      {
        title: {id: 'homepage.links.workflow', text: 'Daily Workflow'},
        to: '/workflow',
      },
      {
        title: {id: 'homepage.links.diagnostics', text: 'Diagnostics & CI'},
        to: '/diagnostics',
      },
    ],
  },
  {
    label: {id: 'homepage.mechanisms.generation.label', text: 'Generation'},
    title: {
      id: 'homepage.mechanisms.generation.title',
      text: 'Every target comes from the same model',
    },
    description: {
      id: 'homepage.mechanisms.generation.description',
      text: 'Go contracts, TypeScript clients, public Skel, and runtime schema share the same resolved declarations. Managed outputs stay deterministic and reviewable.',
    },
    markers: ['Go', 'TypeScript', 'public Skel', 'Domain Schema'],
    links: [
      {
        title: {id: 'homepage.links.generation', text: 'Generation Guide'},
        to: '/generation',
      },
      {
        title: {id: 'homepage.links.publicContracts', text: 'Public Contracts'},
        to: '/generation/public-contracts',
      },
    ],
  },
]

export const guideGroups: GuideGroup[] = [
  {
    title: {id: 'homepage.guides.learn', text: 'Learn'},
    description: {
      id: 'homepage.guides.learn.description',
      text: 'Build a complete contract, then learn the language beneath it.',
    },
    links: [
      {
        title: {id: 'homepage.guides.first.title', text: 'First Contract'},
        description: {
          id: 'homepage.guides.first.description',
          text: 'Write, check, and generate one complete domain.',
        },
        to: '/getting-started',
      },
      {
        title: {id: 'homepage.guides.language.title', text: 'Language Model'},
        description: {
          id: 'homepage.guides.language.description',
          text: 'Understand how Skel divides contract responsibilities.',
        },
        to: '/language',
      },
      {
        title: {id: 'homepage.guides.syntax.title', text: 'Syntax Index'},
        description: {
          id: 'homepage.guides.syntax.description',
          text: 'Look up declarations, types, and naming rules.',
        },
        to: '/syntax',
      },
    ],
  },
  {
    title: {id: 'homepage.guides.design', text: 'Design'},
    description: {
      id: 'homepage.guides.design.description',
      text: 'Model stable types, callers, and authorization boundaries.',
    },
    links: [
      {
        title: {id: 'homepage.guides.types.title', text: 'Types & Data'},
        description: {
          id: 'homepage.guides.types.description',
          text: 'Choose stable scalar, collection, and data shapes.',
        },
        to: '/types-and-data',
      },
      {
        title: {id: 'homepage.guides.access.title', text: 'Actors & Access'},
        description: {
          id: 'homepage.guides.access.description',
          text: 'Model callers, credentials, and entry transports.',
        },
        to: '/actors-and-access',
      },
      {
        title: {id: 'homepage.guides.permissions.title', text: 'Permission Model'},
        description: {
          id: 'homepage.guides.permissions.description',
          text: 'Define permission codes and parameterized checks.',
        },
        to: '/permissions',
      },
    ],
  },
  {
    title: {id: 'homepage.guides.ship', text: 'Ship'},
    description: {
      id: 'homepage.guides.ship.description',
      text: 'Make checks and generation part of everyday delivery.',
    },
    links: [
      {
        title: {id: 'homepage.guides.workflow.title', text: 'Daily Workflow'},
        description: {
          id: 'homepage.guides.workflow.description',
          text: 'Format, check, and reproduce generation in CI.',
        },
        to: '/workflow',
      },
      {
        title: {id: 'homepage.guides.generation.title', text: 'Generation Guide'},
        description: {
          id: 'homepage.guides.generation.description',
          text: 'Choose Go, TypeScript, module, or public output.',
        },
        to: '/generation',
      },
      {
        title: {id: 'homepage.guides.vine.title', text: 'Vine Integration'},
        description: {
          id: 'homepage.guides.vine.description',
          text: 'Connect generated contracts to the Vine runtime.',
        },
        to: '/vine-integration',
      },
      {
        title: {
          id: 'homepage.guides.editor.title',
          text: 'Editor & Highlighting',
        },
        description: {
          id: 'homepage.guides.editor.description',
          text: 'Set up VS Code or add Skel highlighting to a web UI.',
        },
        to: '/editor',
      },
    ],
  },
]
