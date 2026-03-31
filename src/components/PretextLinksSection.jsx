const VIRAL_SHOWCASE_DEMOS = [
  [
    'Dragon parting text like water',
    'The viral obstacle-wrap demo that made people stop and look twice.',
    'https://pretext-playground.builderz.dev',
  ],
  [
    'Fluid smoke rendered as typographic ASCII',
    'A kinetic smoke field where every frame is rebuilt through text.',
    'https://somnai-dreams.github.io/fluid-smoke',
  ],
  [
    'Wireframe torus through a character grid',
    'A 3D-feeling text experiment that pushes Pretext beyond standard UI layout.',
    'https://somnai-dreams.github.io/wireframe-torus',
  ],
  [
    'Multi-column editorial with animated orbs at 60fps',
    'A strong reference for magazine-style flow around moving obstacles.',
    'https://somnai-dreams.github.io/editorial-engine',
  ],
]

const INTERACTIVE_DEMOS = [
  [
    'SnakeCase Text',
    'Fun typography play that shows how expressive custom text motion can get.',
    'https://snakecase-text.vercel.app',
  ],
  [
    'Pretext Breaker',
    'Game-style text that breaks and collides like a brick breaker.',
    'https://pretext-breaker.netlify.app',
  ],
  [
    'Splat Editor',
    'Text layout reacts to splat objects in a playful editor workflow.',
    'https://pretext-stuff.solarise.dev/splat-editor',
  ],
  [
    'Webcam Matrix ASCII',
    'MediaPipe-driven live obstacles using your face, hands, and body.',
    'https://text-reflow.vercel.app',
  ],
  [
    'Simple Pretext Demo',
    'A straightforward demo that highlights why Pretext feels different from DOM layout.',
    'https://replit.com',
  ],
  [
    'Textflow',
    'A clean interactive textflow example that stays close to real product use.',
    'https://sebland.com/textflow',
  ],
  [
    'Pretext Playground',
    'A grab bag of interactive effects for quick inspiration.',
    'https://unwindkit.com/pretext-playground',
  ],
  [
    'Soft Cartography',
    'Cartography-style generative layouts built from flowing text.',
    'https://hilma-nine.vercel.app/soft-cartography',
  ],
]

const CORE_LINKS = [
  ['GitHub', 'Main repository for the library.', 'https://github.com/chenglou/pretext'],
  ['Official Demos', 'Primary demos from Cheng Lou.', 'https://chenglou.me/pretext'],
  ['Community Demos', 'A broader collection of community-made experiments.', 'https://somnai-dreams.github.io/pretext-demos'],
  ['NPM', 'Package install page for @chenglou/pretext.', 'https://www.npmjs.com/package/@chenglou/pretext'],
  ['Original Tweet', 'Where the conversation started spreading widely.', 'https://x.com/_chenglou'],
  ['Kirupa Podcast', 'A longer-form discussion around the ideas and direction.', 'https://www.youtube.com/watch?v=BfgqoBz8VWw'],
  ['Dev.to deep-dive', 'Context and explanation around what people often miss in the demos.', 'https://dev.to'],
  ['Original research', 'Lower-level text-layout research that feeds into the library.', 'https://github.com/chenglou/text-layout'],
]

export function PretextLinksSection() {
  return (
    <section className="rounded-[28px] border border-[#d6c39a] bg-white/72 p-5 shadow-[0_24px_80px_rgba(108,73,37,0.08)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-700">
        References
      </p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
        Demos, Inspiration, And Core Links
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
        These are the demos worth studying when you want to understand what
        makes Pretext feel different. The first group shows the viral
        showcase-style work. The second group is useful for smaller focused
        experiments. The last group points to the library itself and the
        original material behind it.
      </p>

      <LinksGroup
        className="mt-6"
        eyebrow="The Viral Showcase Demos"
        items={VIRAL_SHOWCASE_DEMOS}
      />
      <LinksGroup
        className="mt-6"
        eyebrow="Interactive Single Demos & Experiments"
        items={INTERACTIVE_DEMOS}
      />
      <LinksGroup
        className="mt-6"
        eyebrow="Core Links"
        items={CORE_LINKS}
      />
    </section>
  )
}

function LinksGroup({ className = '', eyebrow, items }) {
  return (
    <div className={className}>
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
        {eyebrow}
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {items.map(([label, text, href]) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noreferrer"
            className="min-w-0 rounded-[18px] border border-stone-200 bg-stone-50 px-4 py-4 text-sm text-slate-700 transition hover:border-amber-300 hover:bg-amber-50"
          >
            <span className="block text-base font-semibold text-slate-900">
              {label}
            </span>
            <span className="mt-2 block leading-6 text-slate-600">{text}</span>
            <span className="mt-3 block break-words text-xs leading-5 text-slate-500">
              {href.replace(/^https?:\/\//, '')}
            </span>
          </a>
        ))}
      </div>
    </div>
  )
}
