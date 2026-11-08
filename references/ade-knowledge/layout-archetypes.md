# Layout Archetypes — Composition Escape Routes

**Purpose:** use structural alternatives to avoid repeating the same generic page composition. These IDs describe possible structures, not templates, required counts or universal best practices.

Read `docs/ai-guides/preset-reference-escape-routing.md` first. A structured product profile's `compositionEscapes` is the first source for task-specific alternatives. This historical H/F/S/N/R vocabulary is supplemental.

## Selection protocol

Before choosing a pattern, state:
1. the primary user task and the page's role;
2. the content and real product evidence available;
3. the interaction and responsive constraints;
4. what the structure needs to make easy to understand or complete.

Select an archetype only when its intent and content prerequisites fit. If no option qualifies, compose a task-first layout without forcing an archetype. Do not rotate patterns merely for visual variety. Do not manufacture images, claims, metrics, quotes, logos or product functionality to make a pattern look complete.

## 1. Hero and entry structures

| ID | Structure | Appropriate when | Content required | Risks and checks |
|---|---|---|---|---|
| H1 | Split / asymmetric | A clear proposition and a meaningful visual or interactive object should be understood together. | A concise proposition and a relevant visual, product image or actual interface. | Choose column proportions from text length and object shape. Balanced 50/50 can be valid. Prevent visual overlap with copy and controls; floating details must explain a real feature or state. |
| H2 | Typographic / editorial | The message, title, authored work or point of view is itself the primary content. | Strong, accurate copy and useful context. An image is optional, not forbidden. | Display scale must not harm reading, translation, responsive wrapping or screen-reader hierarchy. |
| H3 | Full-bleed media | Place, atmosphere, campaign imagery or a visual story is central to the user's first decision. | Licensed or supplied imagery/video with a meaningful subject and contextual alternative. | Check text contrast in all crops, loading states, mobile crops and reduced-motion fallback. Do not use a background image as the only source of information. |
| H4 | Bento / modular hero | Several capabilities or evidence items need unequal emphasis and can be explained independently. | Real feature content, product examples or verified facts that justify each cell. | Avoid identical cards disguised as bento. Cell count and sizes follow content; every cell should answer a different useful question. |
| H5 | Product-scale object | One recognizable physical or digital product should dominate the decision. | A real, recognizable product visual with accurate scale, details and variants. | Never use a giant placeholder that obscures what is being sold. Confirm crop, alt text, mobile framing and product authenticity. |
| H6 | Search / filter first | Finding a result is the primary task, as in property, travel, catalogue or data discovery. | Real searchable content, meaningful filters and clear search semantics. | Show only the inputs needed to begin; use progressive disclosure for advanced options. There is no universal maximum field count. Avoid empty filters and controls that do not affect results. |
| H7 | Marquee / ticker | A moving sequence communicates a genuinely continuous stream, event identity or a relevant set of topics. | Meaningful repeated content and a non-motion alternative. | Not a default hero. Provide pause/stop controls where required, honor `prefers-reduced-motion`, prevent distraction and never hide essential content in movement. |
| H8 | Editorial index | The user needs to scan and choose among projects, stories, services or destinations. | Real titles, labels, grouping and ordering that help selection. | Rows need clear interaction states and accessible names. Hover is not the only feedback; support keyboard and touch. |
| H9 | Narrative / chapter | The product, place or authored work benefits from an evidence-backed sequence of stories. | Real chapters, process, milestones or authored material with a clear narrative order. | Do not invent a brand origin story. Scroll progression must not hijack navigation or conceal the next action. |

## 2. Feature and explanation structures

| ID | Structure | Appropriate when | Content required | Risks and checks |
|---|---|---|---|---|
| F1 | Bento feature matrix | Features differ in importance and each has its own useful proof or example. | Distinct feature statements and real examples or visuals. | Unequal cells should express hierarchy, not decoration. Remove cells with no information. |
| F2 | Alternating story rows | A sequence of capabilities, steps or product details is easier to compare one at a time. | Each row needs its own meaningful explanation and relevant media. | Do not alternate image placement mechanically. On mobile preserve semantic reading order. |
| F3 | Numbered process | The user must understand a genuine sequence or procedure. | Accurate steps, prerequisite and outcome for each step. | Do not turn unrelated features into fake process steps. Explain branches and exceptions where relevant. |
| F4 | Tabs / segmented panels | A small set of related views can be compared without showing all content at once. | Clear labels and a useful default panel; all panels should be meaningful. | Ensure keyboard semantics, focus, panel relationships and discoverability. Do not hide essential information behind tabs without reason. |
| F5 | Comparison | A user is making a choice between products, plans, states or approaches. | Comparable attributes with consistent units and verified facts. | Avoid asymmetric or invented comparisons. Provide a narrow-screen accessible alternative. |
| F6 | Sticky narrative / scroll-linked visual | A long explanation benefits from keeping a short context visible while related content changes. | Ordered sections and visuals that genuinely map to each section. | Avoid scroll hijacking, excessive sticky height, mobile dead zones and motion-only meaning. A normal stacked layout must remain complete. |

## 3. Evidence and trust structures

| ID | Structure | Appropriate when | Content required | Risks and checks |
|---|---|---|---|---|
| S1 | Testimonials / quotation set | Trust depends on real first-hand experience from identified sources. | Genuine quotes, permission, source identity and context. | Never fabricate a quote, name, role or rating. If unavailable, omit or use an evidenced case explanation. |
| S2 | Metrics / quantified proof | A decision depends on a meaningful measured result. | Verified values, units, timeframe, method and source. | Never invent counts, conversion lifts or performance numbers. Distinguish estimate, sample and live measurement. |
| S3 | Case study | A real example demonstrates problem, action and outcome. | Verifiable brief, role, intervention, outcome and limitations. | Do not turn aspiration into a result. State attribution and measurement limits. |
| S4 | Logo proof / integrations | Users need to know real clients, partners, platforms or integrations. | Permission to show identity and an accurate relationship description. | Never invent customer logos or imply an integration/endorsement that does not exist. |

If no proof is available, use transparent product explanation, a demo, documentation or process evidence instead of synthetic social proof.

## 4. Navigation structures

| ID | Structure | Appropriate when | Content required | Risks and checks |
|---|---|---|---|---|
| N1 | Compact top navigation | The site has a small, stable set of primary destinations. | Clear IA and one primary action, if one exists. | Do not force all destinations into the header. Support narrow screens, keyboard and visible current location. |
| N2 | Floating / compact navigation | A contextual action or small set of destinations should remain available while scrolling. | A small and stable navigation set; a meaningful reason to float it. | Blur/pill styling is optional, not part of the archetype. Avoid covering content or focus and verify contrast over every backdrop. |
| N3 | Side navigation | The product has many destinations, persistent workspace context or hierarchical navigation. | Grouped IA and clear current section. | Show the user's current place, support collapse state accessibly and transform for small screens. |

## 5. Footer structures

| ID | Structure | Appropriate when | Content required | Risks and checks |
|---|---|---|---|---|
| R1 | Wordmark / brand close | A strong brand sign-off reinforces a completed narrative and the wordmark is genuine. | Correct brand identity and required utility/legal links elsewhere. | Never let large typography hide accessibility, contact, privacy or legal links. |
| R2 | Multi-column link footer | Users need grouped secondary navigation, contact, policies or resources. | Real destinations and meaningful link groups. | Do not pad empty columns or invent social links. Prioritize mobile scanning and clear group headings. |

## 6. Mapping is a shortlist, not a command

The old niche-to-archetype matrix is a historical shortlist only. A healthcare landing page may use H1 only if it has a relevant visual and a clear service proposition; H6 may be better when finding a clinic is the main task. A developer dashboard may need N3 + a table-first workbench rather than any marketing hero. A portfolio may use H8 when project discovery matters more than a large display headline.

Use the structured profile's `compositionEscapes` first. Then treat these archetypes as possible building blocks. Do not copy the old matrix as a fixed niche-to-layout mapping.

## 7. Required composition note

When a named archetype materially affects the page, record:
- chosen ID and the specific task it supports;
- content evidence that makes it eligible;
- rejected alternative(s) and why they are weaker;
- responsive and interaction transformation;
- accessibility/reduced-motion checks;
- content or evidence that is missing.

A pattern is complete only when its real content and interaction work, not when it resembles a reference screenshot.
