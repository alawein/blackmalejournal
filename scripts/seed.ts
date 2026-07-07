// scripts/seed.ts
// Run with: npx tsx scripts/seed.ts
// Requires SUPABASE_SERVICE_ROLE_KEY in .env.local to bypass RLS.
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// ── Articles ──────────────────────────────────────────────────────────────────

const articles = [
  // HEALTH (3)
  {
    title: 'The Discipline of Iron: Why Every Man Needs a Physical Practice',
    slug: 'discipline-of-iron-physical-practice',
    lens: 'health',
    tags: ['fitness', 'discipline', 'sovereignty'],
    excerpt:
      'Most men approach fitness as aesthetics. We approach it as politics. The body is a site of resistance, and every rep is a vote for or against your own liberation.',
    body: `The gym is not neutral territory. When Frederick Douglass wrote about the moment he fought back against the overseer Covey, he noted that the physical confrontation changed something fundamental in him — gave him a sense of his own manhood that no sermon or book could provide. That is the truth about physical training that the fitness industry will never sell you: the iron builds more than muscle. It builds the self.

There is a long tradition in the African diaspora of understanding the body as contested ground. The plantation deliberately targeted physical vitality — overwork, inadequate nutrition, the deliberate destruction of the male body as a warning. The response, when possible, was to reclaim that body. To run faster. To lift heavier. To endure more. Not as performance for the master, but as private knowledge of one's own capacity.

That tradition belongs to us. Every man reading this exists downstream of men who survived by staying physically capable. The question is whether we honor that inheritance or let it go soft.

**What a Physical Practice Actually Does**

A serious physical practice — not three days a week when you feel like it, but a systematic, progressive commitment — restructures your relationship with discomfort. Most modern life is engineered to remove discomfort entirely. One-click delivery. Temperature-controlled everything. Frictionless entertainment. The body that never pushes against resistance becomes the mind that never pushes against resistance.

Stoic philosophy understood this. Marcus Aurelius trained for physical hardship deliberately, not because the emperor of Rome needed to be in fighting shape, but because he understood that comfort corrupts judgment. The man who has never voluntarily suffered cannot be trusted with difficulty.

**The Protocol**

Here is a non-negotiable minimum: four sessions per week, each containing some combination of heavy compound lifts, conditioning work, and deliberate recovery. That is the floor. The ceiling is whatever your life can sustain without breaking the other disciplines.

Track everything. Not for Instagram. For yourself. The log becomes a record of what you are capable of. On the days you do not feel it, the log tells the truth about who you have been, and who you are building toward.

Do not let this be optional.`,
    featured: true,
    access_tier: 'free',
    author: 'The Chairman',
    cover_image: '/placeholders/article.svg',
    published_at: '2026-03-01T09:00:00Z',
  },
  {
    title: 'Iron Mind: The Mental Discipline That Makes the Physical Possible',
    slug: 'iron-mind-mental-discipline',
    lens: 'health',
    tags: ['mindset', 'discipline', 'mental-health'],
    excerpt:
      'You cannot build the body without first building the mind that will sustain it. The men who quit do not lack strength — they lack the mental architecture to use it.',
    body: `Every man who has ever trained seriously has encountered the moment where the body still has reserves and the mind sends the abort signal. That moment is the actual workout. Everything before it was warm-up.

Mental discipline is not a personality trait. It is not something you have or do not have. It is a practice, exactly like physical training — something you build through progressive overload, not through inspiration or willpower as a finite resource.

**Structure Over Motivation**

Motivation is a feeling. Discipline is a system. The man who trains only when motivated will train inconsistently. The man who has structured his life so that training happens regardless of how he feels will train consistently, and consistency is the only variable that matters at the macro level.

This means: same time each day. Same sequence. Minimal decisions before you start. The cognitive load of deciding whether to train is often greater than the load of the training itself. Remove the decision. The session happens.

**The Internal Voice**

Learn to identify the voice that says stop when stopping is not necessary. That voice is not wisdom. It is the accumulated comfort-seeking of every soft option you have taken in the past. Every time you listen to it when you should not, you teach it that it works. Every time you override it, you teach your mind that it cannot be trusted to quit you prematurely.

This is the work. Not the sets and reps. The relationship with that voice.`,
    featured: false,
    access_tier: 'basic',
    author: 'The Chairman',
    cover_image: '/placeholders/article.svg',
    published_at: '2026-02-15T09:00:00Z',
  },
  {
    title: 'Fasting as a Political Act: Reclaiming Control Over Your Own Body',
    slug: 'fasting-political-act-body-control',
    lens: 'health',
    tags: ['fasting', 'health', 'sovereignty', 'discipline'],
    excerpt:
      'The food system was not designed with your health in mind. Fasting is not a diet trend — it is a daily assertion that you, not the market, control your body.',
    body: `In 1965, the Student Nonviolent Coordinating Committee organized a fast in solidarity with imprisoned civil rights workers. In 1981, Bobby Sands led the Maze Prison hunger strike. Fasting as a form of protest runs through political history not because hunger is comfortable but because the deliberate control of one's own consumption — in the face of a system designed to manage that consumption for its own benefit — is a radical act.

I am not asking you to hunger strike. I am asking you to consider what a 16-hour fast, done consistently, says about your relationship with the food-industrial complex.

**What the System Wants**

The processed food industry spent decades engineering products specifically to override your body's satiety signals. High fructose corn syrup, refined seed oils, engineered textures and flavor combinations that never appear in nature — all of it designed to make you consume more than you need, more reliably than you would without intervention.

Fasting resets the relationship. When you have gone 18 hours without food, you learn what actual hunger feels like — not boredom, not stress, not the Pavlovian response to a food advertisement. Actual hunger. And then you choose when to respond to it.

**The Physiology**

At around 12 to 14 hours of fasting, the body begins to shift from glucose metabolism toward fat oxidation. By 18 to 24 hours, autophagy — the cellular cleanup process that may be among the most powerful anti-aging interventions we have access to — ramps up meaningfully.

A 16:8 protocol (16 hours fasted, 8-hour eating window) is the minimum viable practice. Eat your last meal by 8pm. Break your fast at noon. Drink water, black coffee, or plain tea in the window. That is the entire intervention. Do it every day.

The body you build through fasting is not just leaner. It is more capable of operating without external inputs — more autonomous, more resilient, more yours.`,
    featured: false,
    access_tier: 'premium',
    author: 'The Chairman',
    cover_image: '/placeholders/article.svg',
    published_at: '2026-01-20T09:00:00Z',
  },

  // PHILOSOPHY (3)
  {
    title: 'Marcus Aurelius Had It Right: Stoic Principles for the Modern Black Man',
    slug: 'marcus-aurelius-stoic-principles-modern-black-man',
    lens: 'philosophy',
    tags: ['stoicism', 'philosophy', 'marcus-aurelius', 'mindset'],
    excerpt:
      'Stoicism was not written for comfortable men. It was written for men who carried enormous responsibility in a world that did not always bend to their will. Sound familiar?',
    body: `Marcus Aurelius was the most powerful man in the Roman world. He was also, by his own account in the Meditations, perpetually at war with his own weaknesses — his temper, his preference for rest over duty, his tendency toward self-pity. He wrote his journal not as a monument to wisdom but as a daily corrective, a document of a man arguing himself back into right action.

That is what makes Stoicism relevant to us. Not the calm, marble-faced philosopher of popular imagination. The actual Stoic: the one who wakes up every morning to face circumstances beyond his control and has to choose, again, how he will respond.

**The Dichotomy of Control**

Epictetus opens the Enchiridion with what might be the most useful distinction in the history of philosophy: some things are in our power, and some are not. In our power: judgment, desire, aversion, our own mental and moral actions. Not in our power: the body, reputation, position, external circumstances.

For a Black man navigating American institutions — which were not built for him and often actively resist him — this distinction is not abstract. The hiring manager's bias is not in your power. Your response to it is. The quality of your preparation before the interview is. The system's structural hostility is not in your power. Your decision about which systems to engage, which to circumvent, and which to build alternatives to, is.

This is not passivity. This is the most sophisticated form of agency available: knowing exactly where your leverage is, and applying maximum force there.

**The Practical Protocol**

Each morning: review what the day will demand. Anticipate where you may be tempted toward reaction rather than response. At each moment of friction: pause. Ask whether your response is in service of your values or in service of your emotional state. Each evening: what went wrong? Why? What will you do differently?

That is the entire practice. Unremarkable in description. Transformative in execution.`,
    featured: true,
    access_tier: 'free',
    author: 'The Chairman',
    cover_image: '/placeholders/article.svg',
    published_at: '2026-02-28T09:00:00Z',
  },
  {
    title: 'The Examined Life Is the Only Life Worth Living',
    slug: 'examined-life-worth-living',
    lens: 'philosophy',
    tags: ['philosophy', 'socrates', 'self-knowledge', 'mindset'],
    excerpt:
      'Socrates said it plainly and paid with his life. What does it actually mean to examine your existence — not as an intellectual exercise, but as a daily practice of reckoning?',
    body: `Socrates delivered his verdict in the Apology: the unexamined life is not worth living. He said this in his own defense, at his own trial, knowing the statement would cost him. The jury of Athens found him guilty and sentenced him to death. He drank the hemlock without complaint.

That is the model. Not the comfortable philosopher in the academy. The man who took his own principles so seriously that he accepted death rather than compromise them.

Most men live unexamined lives. Not because they are stupid or lazy, but because the infrastructure of modern life is specifically designed to prevent examination. Constant stimulation. Algorithmic content tuned to keep the attention on the screen and off the self. Work that demands presence but not reflection.

**What Examination Actually Means**

Socratic examination is not journaling about your feelings. It is rigorous questioning of your beliefs: why do you hold this value? Is it actually yours, or did you absorb it without scrutiny? Does your behavior actually align with what you claim to believe? Where are the contradictions?

**The Practice of Reckoning**

Weekly: sit without a phone. Review the week. Not the external events — your responses to them. Where did you react from fear? Where from pride? Where did you do the difficult thing? Where did you avoid it? What would you do differently?

This is not self-flagellation. The Stoics were clear on this: the point of reviewing failures is not guilt but correction. You are not building a case against yourself. You are building the self who will do better.

The examined life is uncomfortable. That is the point.`,
    featured: false,
    access_tier: 'free',
    author: 'The Chairman',
    cover_image: '/placeholders/article.svg',
    published_at: '2026-02-10T09:00:00Z',
  },
  {
    title: 'On the Necessity of Solitude: Why the Connected Man Is the Distracted Man',
    slug: 'necessity-of-solitude-connected-distracted-man',
    lens: 'philosophy',
    tags: ['solitude', 'philosophy', 'mindset', 'focus'],
    excerpt:
      'The man who is never alone is the man who never knows himself. Solitude is not a luxury — it is the laboratory in which the self is made.',
    body: `Every major tradition of masculine development includes a period of deliberate isolation. The vision quest. The desert fathers. The forty days in the wilderness. The monk's cell. These are not coincidental convergences — they reflect a persistent recognition that the self cannot be built in the crowd.

This is not introversion as personality type. It is the recognition that certain kinds of thinking — the deep, generative kind — require the absence of social stimulus. Not forever. Not as a permanent condition. As a practice. As a regular return to the self before returning to others.

**The Biology of Distraction**

Each notification, each scroll, each tab opened is a micro-dose of dopamine. The brain that receives these micro-doses constantly becomes less capable of tolerating the necessary discomfort of sustained attention. Deep work, long-form thinking, creative synthesis — all of these require tolerating an uncomfortable absence of stimulation.

The fix is not willpower applied against the phone. The fix is structural removal: scheduled periods of non-connectivity, physical distance from devices, regular practice of doing one thing for extended periods without interruption.

**The Protocol**

Two hours per day without a phone. One day per month in deliberate solitude — no social media, no podcasts, no company. One weekend per quarter in full retreat from the social world.

What you will discover, in the silence, is what you actually think. And then the real work can begin.`,
    featured: false,
    access_tier: 'basic',
    author: 'The Chairman',
    cover_image: '/placeholders/article.svg',
    published_at: '2026-01-05T09:00:00Z',
  },

  // POLITICS (3)
  {
    title: 'Understanding Power: A Framework for Community Organizing',
    slug: 'understanding-power-community-organizing-framework',
    lens: 'politics',
    tags: ['power', 'organizing', 'community', 'politics'],
    excerpt:
      'Power does not yield to good arguments or moral appeals alone. It yields to organized, sustained pressure from people who understand their leverage. Here is the framework.',
    body: `Saul Alinsky's Rules for Radicals was written in 1971 and remains one of the clearest analyses of how power actually works — not how we wish it worked or how civics class describes it, but how it operates in practice. The central insight: power responds to organized power, and little else.

Frederick Douglass said it before Alinsky, and more elegantly: "Power concedes nothing without a demand. It never did and it never will." The demand must come from an organized constituency that can credibly threaten consequences.

**Mapping Power**

The first tool of organizing is a power analysis: who makes decisions that affect your community? Who influences them? Who funds them? What do they want? What do they fear? What are their pressure points?

Draw the actual map. The school board that controls your neighborhood schools — who sits on it? Who votes for them? Who donates to their campaigns? What are their stated priorities? Where do their stated priorities conflict with their actions?

Once you have the map, you can see where your leverage is.

**The Building Block: The One-on-One**

Every organizing tradition, from unions to the Black church, begins with the individual conversation. Not the mass rally, not the petition, not the social media campaign. The conversation between two people in which one learns the other's interests, values, fears, and capacities.

Start with ten people. Have real conversations with them. Find out what they are actually angry about, what they are afraid of, what they would actually risk. Build from there.

The mass rally is the output of months of one-on-ones. It is not the beginning. It is the demonstration of organized power that was built in private.`,
    featured: false,
    access_tier: 'free',
    author: 'The Chairman',
    cover_image: '/placeholders/article.svg',
    published_at: '2026-03-10T09:00:00Z',
  },
  {
    title: 'Why Black Men Need to Stop Waiting on Institutions',
    slug: 'black-men-stop-waiting-institutions',
    lens: 'politics',
    tags: ['institutions', 'self-determination', 'politics', 'power'],
    excerpt:
      'The institution was never designed with your liberation in mind. The sooner we internalize this fully, the sooner we can begin building what we actually need.',
    body: `The American institution — the school, the hospital, the bank, the court — was not designed to serve the Black man's interests. This is not a conspiracy theory; it is a historical fact inscribed in founding documents, legislative records, and case law.

The waiting problem is this: many Black men have oriented their lives around waiting for institutions to change. Waiting for the school to improve. Waiting for the police to reform. Waiting for recognition of historical wrongs.

The waiting is not irrational — the institutions genuinely should change, and some of them genuinely have, in response to organized pressure. But the waiting posture, when it becomes the dominant orientation, is catastrophic for the man who adopts it. It makes your liberation contingent on the decisions of people who do not prioritize it.

**The Builder's Posture**

The alternative is not separatism or withdrawal. It is the insistence on building what you need, parallel to whatever engagement with the existing order makes strategic sense.

Build the school the public school cannot be. Build the economic relationships the formal economy does not offer your community. Build the health infrastructure the hospital system has shown it will not provide equitably.

This is not new. Greenwood, Oklahoma was this. The Black church was this. The Harlem Renaissance was this. The tradition is ours. The question is whether we will use it.

Do not wait for permission. Do not wait for the system to become what it was never designed to be. Build.`,
    featured: false,
    access_tier: 'basic',
    author: 'The Chairman',
    cover_image: '/placeholders/article.svg',
    published_at: '2026-02-01T09:00:00Z',
  },
  {
    title: 'The Economics of Black Masculinity: How the Market Profits From Our Pain',
    slug: 'economics-black-masculinity-market-profits-pain',
    lens: 'politics',
    tags: ['economics', 'capitalism', 'culture', 'politics'],
    excerpt:
      'The image of the Black man in crisis is not just a social problem — it is a profitable product. Understanding the economics changes how you respond to it.',
    body: `In 2020, corporations pledged over $50 billion to "racial equity" initiatives in the weeks following George Floyd's murder. By 2023, most of those pledges had been quietly reduced, delayed, or redirected. The pattern is instructive: the pain of Black men is worth something in the market — as content, as brand positioning, as short-term political capital — but the structural changes that would actually address it are not.

The commodification of Black pain has a long history: from the spectacle of lynching photographs sold as postcards, to the exploitation of Black musical innovation that created the recording industry's first fortunes, to the prison-industrial complex's conversion of Black bodies into revenue streams for private contractors.

**The Attention Economy**

Social media platforms discovered early that anger and outrage generate more engagement than any other emotion. Black pain — filmed, shared, debated, outrage-marketed — is among the most consistently engaging content categories on every major platform.

The man who spends hours consuming footage of police violence, reading comment sections about Black suffering, engaging in outrage cycles is generating revenue for platforms that have no interest in the conditions that produce the footage. His attention is the product. His pain is the feed.

This does not mean look away. It means be intentional about what you consume, why, and to what end. Information that produces action is different from information that produces only emotional churn.

**The Alternative Economic Orientation**

Direct your money toward Black-owned enterprises with demonstrated commitment to community reinvestment. Build economic relationships within your community that keep capital circulating rather than immediately exiting. Understand the economics of your own neighborhood: where does money come in, where does it go, who controls the flow?

Both organizing for policy change and redirecting economic activity toward community building. Always both.`,
    featured: false,
    access_tier: 'premium',
    author: 'The Chairman',
    cover_image: '/placeholders/article.svg',
    published_at: '2026-01-15T09:00:00Z',
  },
];

// ── Briefings ─────────────────────────────────────────────────────────────────

const briefings = [
  {
    issue_number: 3,
    title: 'On the Weight of Visibility',
    slug: 'weekend-briefing-003',
    sections: [
      {
        title: 'The Burden',
        body: 'There is a particular exhaustion that comes with being seen — not just looked at, but tracked, assessed, catalogued. Every Black man who moves through predominantly non-Black spaces understands this weight intimately. This issue, we examine visibility as both burden and weapon: how it is used against us, and how we reclaim the terms of our own appearance in the world.',
      },
      {
        title: 'Surveillance and Sovereignty',
        body: "The history of watching Black men in America is not subtle. From the slave patrols that required enslaved people to carry passes to move freely, to the broken-windows policing doctrine that treated the presence of Black men in certain spaces as inherently suspicious, to the social media pile-ons that can end a man's career based on a decontextualized video — the mechanisms change but the underlying project is consistent: to make Black male presence conditional, always subject to review, never fully at home in public space.",
      },
      {
        title: 'Reclaiming the Frame',
        body: "The response is not to disappear. It is to develop a sovereign presence — the capacity to move through space with full awareness of how you are being read, while refusing to let that reading determine how you occupy the space. This is not code-switching as capitulation. It is strategic awareness combined with uncompromising self-possession. You know the room. You know the read. You remain yourself. The space adjusts to you, not the other way around.",
      },
    ],
    access_tier: 'free',
    cover_image: '/placeholders/briefing.svg',
    published_at: '2026-03-10T09:00:00Z',
  },
  {
    issue_number: 2,
    title: 'Brotherhood in the Age of Isolation',
    slug: 'weekend-briefing-002',
    sections: [
      {
        title: 'The Loneliness Crisis',
        body: 'The data on male loneliness is unambiguous and worsening. Over 15% of American men report having no close friends — a figure that has tripled since 1990. Black men face this crisis at the intersection of general male isolation and the specific dynamics of racial stress, hypermasculine performance expectations, and institutional mistrust that make vulnerability particularly costly.',
      },
      {
        title: 'What Brotherhood Actually Requires',
        body: "Brotherhood is not proximity. Men who work together, play together, and drink together can remain strangers to each other's interior lives for decades. Actual brotherhood — the kind that sustains men through genuine difficulty — requires the capacity for disclosure and the willingness to receive it.",
      },
      {
        title: 'The Path Back',
        body: "Building real male friendship in adulthood requires intentionality that feels unnatural to men trained to let relationships form passively. You have to initiate. You have to follow up. You have to be the one who says this conversation was valuable to me and I want to continue it. The discomfort of doing this is worth tolerating. The alternative is the slow drift toward the kind of isolation that kills men by degrees.",
      },
    ],
    access_tier: 'basic',
    cover_image: '/placeholders/briefing.svg',
    published_at: '2026-03-03T09:00:00Z',
  },
  {
    issue_number: 1,
    title: 'What It Means to Be a Revolutionary Masculinist',
    slug: 'weekend-briefing-001',
    sections: [
      {
        title: 'The Stakes',
        body: 'This platform exists because the dominant conversation about Black men in America is a conversation about pathology. The statistics of incarceration, unemployment, educational failure, violence — these are real, and they demand engagement. But statistics describe populations, not individuals, and the relentless focus on pathology has produced a generation of Black men who are better acquainted with the reasons they might fail than with the traditions and practices that enable men to thrive.',
      },
      {
        title: 'Revolutionary Masculinism Defined',
        body: 'Revolutionary masculinism is the assertion that Black male flourishing — intellectual, physical, moral, political — is a legitimate project deserving serious, rigorous attention. That the cultivation of Black male character and capacity is not in tension with the liberation of Black people as a whole, but is necessary to it. That the Black man who is disciplined, knowledgeable, capable, and connected is a more powerful agent of transformation than the Black man who is merely aggrieved.',
      },
      {
        title: 'The Invitation',
        body: "This journal is an invitation to a more demanding version of yourself. Not demanding in the sense of punishment or self-criticism. Demanding in the sense of high expectation — the refusal to accept less than your full potential as sufficient. The men who built this country against every resistance it threw at them were not operating on low expectations. They were operating on the conviction that they deserved the full fruits of their humanity, and that building toward that was the work. That is still the work.",
      },
    ],
    access_tier: 'free',
    cover_image: '/placeholders/briefing.svg',
    published_at: '2026-02-24T09:00:00Z',
  },
];

// ── Courses ───────────────────────────────────────────────────────────────────

const courses = [
  {
    title: 'The Physical Sovereignty Protocol',
    slug: 'physical-sovereignty-protocol',
    description:
      'A 12-week progressive training system built around compound lifts, conditioning, and the mental discipline that makes it sustainable. This is not a fitness program. This is a practice.',
    category: 'health',
    access_tier: 'basic',
    published: true,
    cover_image: '/placeholders/course.svg',
  },
  {
    title: 'Stoic Foundations: A 30-Day Philosophical Practice',
    slug: 'stoic-foundations-30-day-practice',
    description:
      'Daily readings and exercises drawn from Marcus Aurelius, Epictetus, and Seneca — applied specifically to the conditions Black men navigate in contemporary America.',
    category: 'philosophy',
    access_tier: 'free',
    published: true,
    cover_image: '/placeholders/course.svg',
  },
  {
    title: 'Organizing 101: Building Power in Your Community',
    slug: 'organizing-101-building-community-power',
    description:
      'A practical curriculum in community organizing: power analysis, the one-on-one, coalition building, direct action, and sustaining a campaign over time.',
    category: 'politics',
    access_tier: 'basic',
    published: true,
    cover_image: '/placeholders/course.svg',
  },
  {
    title: 'The Reading Room: Essential Black Political Thought',
    slug: 'reading-room-black-political-thought',
    description:
      'A curated curriculum through Douglass, Du Bois, Garvey, Malcolm, Baldwin, and their intellectual descendants — with discussion guides and application exercises.',
    category: 'philosophy',
    access_tier: 'premium',
    published: true,
    cover_image: '/placeholders/course.svg',
  },
  {
    title: 'Economic Sovereignty: Money, Ownership, and Community Wealth',
    slug: 'economic-sovereignty-money-ownership-community-wealth',
    description:
      'Personal finance through the lens of collective economics: how to manage your own money and how to deploy it in ways that build community wealth, not just individual net worth.',
    category: 'politics',
    access_tier: 'premium',
    published: false,
    cover_image: '/placeholders/course.svg',
  },
];

// ── Seed runner ───────────────────────────────────────────────────────────────

async function seed() {
  console.log('Seeding articles...');
  const { error: artErr } = await supabase.from('articles').upsert(articles, {
    onConflict: 'slug',
  });
  if (artErr) {
    console.error('Articles seed failed:', artErr.message);
    process.exit(1);
  }
  console.log(`  + ${articles.length} articles`);

  console.log('Seeding briefings...');
  const { error: briErr } = await supabase.from('briefings').upsert(briefings, {
    onConflict: 'slug',
  });
  if (briErr) {
    console.error('Briefings seed failed:', briErr.message);
    process.exit(1);
  }
  console.log(`  + ${briefings.length} briefings`);

  console.log('Seeding courses...');
  const { error: courErr } = await supabase.from('courses').upsert(courses, {
    onConflict: 'slug',
  });
  if (courErr) {
    console.error('Courses seed failed:', courErr.message);
    process.exit(1);
  }
  console.log(`  + ${courses.length} courses`);

  console.log('\nSeed complete.');
}

seed();
