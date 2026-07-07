// scripts/seed-all.ts
// Run: npx tsx scripts/seed-all.ts
// Seeds all tables: articles, briefings, courses, dispatches
// Reads credentials from .env.local (gitignored) via dotenv.

import { config } from 'dotenv';
config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(url, key);

// ── Articles (10) ───────────────────────────────────────────────────────────

const articles = [
  {
    title: 'The Architecture of Discipline',
    slug: 'the-architecture-of-discipline',
    lens: 'philosophy',
    tags: ['discipline', 'mindset', 'stoicism'],
    excerpt: 'Discipline is not a feeling. It is an architecture — a set of structures you build around your life so that progress happens whether you feel like it or not.',
    body: `Discipline is the most misunderstood word in the masculine vocabulary. Most men think of it as willpower — the ability to force yourself to do hard things. That definition is incomplete and ultimately self-defeating.

## Discipline as Structure

True discipline is architectural. It is the design of your environment, your schedule, and your commitments so that the right actions happen by default. You do not rely on motivation. You rely on systems.

Consider the man who wants to train every morning. If he sets his alarm for 5 AM and hopes he will feel like getting up, he will fail most days. But if he sleeps in his training clothes, places his shoes by the door, and has a training partner expecting him — he has built an architecture of discipline.

## The Three Pillars

### Environment

Your environment is the most powerful force shaping your behavior. Remove temptation. Add friction to bad choices. Make the right path the easy path.

### Commitment

Public commitments create accountability. Tell someone what you will do and when. The social pressure of keeping your word is a powerful architectural element.

### Rhythm

Build routines that eliminate decision fatigue. When you do the same things at the same times, discipline becomes automatic. It is no longer a battle of will — it is simply what you do.

> The man who relies on motivation is building on sand. The man who builds systems is building on stone.

Discipline is not about being harder on yourself. It is about being smarter about the structures that govern your daily life.`,
    featured: true,
    access_tier: 'free',
    author: 'The Chairman',
    cover_image: '/placeholders/article.svg',
    published_at: '2026-03-12T08:00:00Z',
  },
  {
    title: 'Why Every Black Man Should Train in Combat',
    slug: 'why-every-black-man-should-train-combat',
    lens: 'health',
    tags: ['martial-arts', 'fitness', 'discipline'],
    excerpt: 'Combat training is not about violence. It is about mastering the body, building unshakeable composure, and knowing what you are capable of.',
    body: `There is a difference between a man who knows he can defend himself and one who hopes he never has to find out. The first carries himself differently. He speaks differently. He occupies space differently.

## The Case for Combat Training

### Physical Mastery

Combat sports demand total body coordination. You cannot be stiff, slow, or disconnected from your body and succeed in the ring or on the mat. Training forces you into a relationship with your body that no other form of exercise provides.

### Mental Composure

Nothing tests your composure like another human being trying to submit you or knock you out. The ability to think clearly under physical pressure transfers directly to every other high-stakes situation in your life.

### Confidence Without Arrogance

The men who have trained the most are usually the calmest in conflict. They have nothing to prove. They know exactly what they are capable of, and that knowledge creates a quiet confidence that cannot be manufactured.

## Where to Start

Begin with Brazilian Jiu-Jitsu or boxing. Both are accessible, have strong communities, and will challenge you immediately. Commit to three months before you evaluate. The first month will be humbling. That is the point.

> A man who has never been tested does not know himself. Training is the test you choose before life chooses one for you.`,
    featured: true,
    access_tier: 'free',
    author: 'The Chairman',
    cover_image: '/placeholders/article.svg',
    published_at: '2026-03-08T08:00:00Z',
  },
  {
    title: 'The Politics of Black Male Education',
    slug: 'politics-of-black-male-education',
    lens: 'politics',
    tags: ['education', 'policy', 'community'],
    excerpt: 'The education system was not designed with Black boys in mind. Understanding this is the first step toward building something better.',
    body: `The data is clear and has been clear for decades. Black boys are suspended at three times the rate of their white peers. They are placed in special education at disproportionate rates. They are less likely to have access to advanced coursework.

## The Structural Problem

This is not a story about individual failure. It is a story about institutional design. The American education system was built on assumptions about who deserves rigor and who needs remediation. Black boys have been on the wrong side of that assumption since the beginning.

## What Can Be Done

### Community-Based Education

The most successful interventions for Black boys are community-based. Mentorship programs, Saturday academies, and culturally grounded curricula consistently outperform institutional reforms.

### Political Engagement

School boards make decisions that directly affect your children. If you are not attending meetings, running for positions, or at minimum voting in school board elections, you are ceding the ground.

### Home as Foundation

The most powerful educational institution is the home. Read with your children. Discuss current events. Ask them what they think, not just what they know. Build critical thinkers before the system tries to build compliant test-takers.

This is not a problem that will be solved by hoping the system changes. It requires action at every level — personal, communal, and political.`,
    featured: true,
    access_tier: 'free',
    author: 'The Chairman',
    cover_image: '/placeholders/article.svg',
    published_at: '2026-03-05T08:00:00Z',
  },
  {
    title: 'Nutrition for the Working Man',
    slug: 'nutrition-for-the-working-man',
    lens: 'health',
    tags: ['nutrition', 'fitness', 'practical'],
    excerpt: 'You do not need a personal chef or a meal plan subscription. You need basic principles and the discipline to follow them.',
    body: `Most nutrition advice is designed for people with unlimited time and money. It assumes you can meal prep for hours on Sunday, buy organic everything, and eat six perfectly balanced meals per day.

That is not your reality. Here is what actually works.

## The Three Rules

### Rule One: Protein First

Every meal should start with a protein source. Eggs, chicken, fish, beans, ground turkey. Build the meal around the protein, not around the carbohydrate.

### Rule Two: Cook in Batches

Cook three proteins on Sunday. Rice or potatoes in bulk. A large pot of vegetables. Combine differently throughout the week. Total time: ninety minutes. Meals for five days.

### Rule Three: Water, Not Everything Else

Eliminate liquid calories. No juice, no soda, no energy drinks during the week. Water and black coffee. This single change will transform your body composition faster than any supplement.

> The gym is where you build. The kitchen is where you reveal what you have built.

Stop overcomplicating nutrition. Master these three rules before you worry about macros, timing, or supplements.`,
    featured: false,
    access_tier: 'free',
    author: 'The Chairman',
    cover_image: '/placeholders/article.svg',
    published_at: '2026-03-01T08:00:00Z',
  },
  {
    title: 'Marcus Aurelius and the Modern Black Man',
    slug: 'marcus-aurelius-and-the-modern-black-man',
    lens: 'philosophy',
    tags: ['stoicism', 'philosophy', 'mindset'],
    excerpt: 'An emperor who ruled Rome two thousand years ago has more to teach you about navigating modern life than most contemporary self-help authors.',
    body: `Marcus Aurelius was the most powerful man in the world. He ruled an empire that stretched from Britain to Egypt. And every night, he sat down and wrote private notes to himself about how to be a better person.

Those notes became the Meditations — one of the most important books ever written on the subject of personal conduct.

## What Stoicism Actually Is

Stoicism is not about suppressing emotion. It is about choosing your response to emotion. It is the recognition that you cannot control what happens to you, but you always control how you respond.

## Three Principles for Daily Life

### The Dichotomy of Control

Separate what you can control from what you cannot. Your effort, your attitude, your choices — these are yours. Other people's opinions, the economy, the weather — these are not. Focus exclusively on the first category.

### Amor Fati

Love your fate. Not passively accept it — actively embrace it. Every obstacle is training material. Every setback is information. The universe is not conspiring against you. It is teaching you.

### Memento Mori

Remember that you will die. This is not morbid. It is clarifying. When you remember that your time is finite, you stop wasting it on things that do not matter.

> You have power over your mind — not outside events. Realize this, and you will find strength.

The Stoics were not cold. They were clear. In a world designed to keep you reactive, clarity is the most radical thing you can possess.`,
    featured: false,
    access_tier: 'free',
    author: 'The Chairman',
    cover_image: '/placeholders/article.svg',
    published_at: '2026-02-25T08:00:00Z',
  },
  {
    title: 'Building Generational Wealth: A Framework',
    slug: 'building-generational-wealth-framework',
    lens: 'politics',
    tags: ['wealth', 'finance', 'generational'],
    excerpt: 'Wealth is not what you earn. It is what you keep, grow, and pass down. Here is a framework for thinking about money across generations.',
    body: `The median white family in America has ten times the wealth of the median Black family. This gap is not the result of individual choices. It is the compounded effect of centuries of policy designed to extract wealth from Black communities.

Understanding this history is important. But understanding alone does not close the gap. Action does.

## The Three-Generation Framework

### Generation One: Stabilize

Your job is to eliminate debt, build an emergency fund, and create at least one income stream you control. You are building the foundation. It will not be glamorous. Do it anyway.

### Generation Two: Multiply

With stability established, the second generation invests. Real estate, index funds, business ownership. The goal is to create assets that generate income without requiring your daily labor.

### Generation Three: Institutionalize

The third generation creates structures — trusts, foundations, educational funds — that make wealth self-sustaining. This is where individual wealth becomes family wealth.

## Start Now

You cannot control which generation you are. But you can start wherever you are. If you are Generation One, stabilize with intensity. Build the habits and knowledge that will give the next generation a running start.

> Wealth is not built in a lifetime. It is built across lifetimes. Your job is to start the chain.`,
    featured: false,
    access_tier: 'basic',
    author: 'The Chairman',
    cover_image: '/placeholders/article.svg',
    published_at: '2026-02-20T08:00:00Z',
  },
  {
    title: 'The Sleep Protocol',
    slug: 'the-sleep-protocol',
    lens: 'health',
    tags: ['sleep', 'health', 'performance'],
    excerpt: 'Sleep is not a luxury. It is the single most important performance variable you control. Here is how to master it.',
    body: `You can train perfectly, eat perfectly, and manage your stress — and still underperform if you are not sleeping well. Sleep is the foundation beneath the foundation.

## The Non-Negotiables

Seven to eight hours. Every night. Not five on weekdays and ten on weekends. Consistent, quality sleep.

## The Protocol

### Environment

Your bedroom should be cold, dark, and quiet. Invest in blackout curtains. Set the thermostat to 65-68 degrees. Remove all screens.

### Timing

Go to bed and wake up at the same time every day. Including weekends. Your circadian rhythm does not take days off.

### Wind-Down

Stop screens one hour before bed. Read physical books. Stretch. Journal. Give your nervous system time to transition from activity to rest.

### Substances

No caffeine after 2 PM. No alcohol within three hours of bed. Both destroy sleep architecture even when they do not prevent you from falling asleep.

> The man who sleeps well thinks clearly, recovers faster, and makes better decisions. Sleep is not where ambition goes to die. It is where performance is born.`,
    featured: false,
    access_tier: 'free',
    author: 'The Chairman',
    cover_image: '/placeholders/article.svg',
    published_at: '2026-02-15T08:00:00Z',
  },
  {
    title: 'On Fatherhood and Intentionality',
    slug: 'on-fatherhood-and-intentionality',
    lens: 'philosophy',
    tags: ['fatherhood', 'family', 'purpose'],
    excerpt: 'Fatherhood is not something that happens to you. It is a practice that requires as much preparation and intentionality as any profession.',
    body: `The crisis of absent fathers in the Black community is real and well-documented. But the conversation too often stops at blame. It rarely proceeds to preparation.

## What Intentional Fatherhood Looks Like

### Before Children

Study child development. Read about attachment theory. Observe the fathers you admire and ask them specific questions. Prepare for fatherhood the way you would prepare for any role you take seriously.

### During Childhood

Be present physically and emotionally. Presence is not just being in the house. It is being engaged, attentive, and responsive. Your children need to know that you see them — not just that you provide for them.

### The Long Game

Your job is not to raise children. Your job is to raise adults. Every interaction is either building their capacity for independence or their dependence on you. Choose wisely.

> The greatest legacy a man can leave is not money or property. It is children who know how to think, love, and lead.`,
    featured: false,
    access_tier: 'premium',
    author: 'The Chairman',
    cover_image: '/placeholders/article.svg',
    published_at: '2026-02-10T08:00:00Z',
  },
  {
    title: 'Voting Is Not Enough',
    slug: 'voting-is-not-enough',
    lens: 'politics',
    tags: ['politics', 'power', 'community'],
    excerpt: 'Every two years they ask for your vote. What are they offering between elections? Political power requires more than participation — it requires organization.',
    body: `Voting is important. It is also insufficient. If your political engagement begins and ends at the ballot box, you are operating with a fraction of your potential power.

## The Full Spectrum of Political Power

### Electoral Power

Voting, yes. But also running for office, working on campaigns, and fundraising. The ballot box is the beginning, not the end.

### Economic Power

Where you spend your money is a political act. Supporting Black-owned businesses, boycotting companies that harm your community, and building cooperative economics are all forms of political power.

### Narrative Power

Who tells the story controls the outcome. Media creation, journalism, art, and public speaking are all tools of narrative power. If you are not telling your own story, someone else is telling it for you.

### Organizational Power

The most durable form of power is organized people. Not social media followers — organized, committed, disciplined groups who show up consistently for shared goals.

> Power is not given. It is built, maintained, and exercised. Voting is one tool in a much larger toolkit.`,
    featured: false,
    access_tier: 'free',
    author: 'The Chairman',
    cover_image: '/placeholders/article.svg',
    published_at: '2026-02-05T08:00:00Z',
  },
  {
    title: 'The Case for Journaling',
    slug: 'the-case-for-journaling',
    lens: 'philosophy',
    tags: ['journaling', 'mindset', 'practice'],
    excerpt: 'Every great leader in history kept a record of their thoughts. The practice of journaling is not introspection for its own sake — it is strategic self-knowledge.',
    body: `Marcus Aurelius journaled. Frederick Douglass journaled. Malcolm X journaled. The pattern is not coincidental. Men who shape history are men who examine their own minds.

## Why Journal

### Clarity of Thought

Writing forces precision. You cannot be vague on paper the way you can be vague in your head. The act of writing crystallizes thinking in a way that rumination cannot.

### Emotional Processing

Men are taught to suppress emotion. Journaling provides a private space to process anger, grief, frustration, and joy without performance or judgment.

### Decision-Making

When you journal consistently, you create a record of your thinking over time. You can see patterns, track progress, and make better decisions because you understand your own tendencies.

## How to Start

Five minutes. Every morning. Three questions:

What am I focused on today?

What am I grateful for?

What would make today a win?

That is it. No elaborate system. No expensive notebook. Five minutes and three questions. Start tomorrow.

> Know thyself. Then build thyself. The journal is where both processes begin.`,
    featured: false,
    access_tier: 'free',
    author: 'The Chairman',
    cover_image: '/placeholders/article.svg',
    published_at: '2026-02-01T08:00:00Z',
  },
];

// ── Briefings (3) ───────────────────────────────────────────────────────────

const briefings = [
  {
    issue_number: 3,
    title: 'The Strength Issue',
    slug: 'weekend-briefing-003',
    sections: [
      { title: 'On Physical Preparedness', body: 'This week we examine the relationship between physical training and mental fortitude. A man who neglects his body is building his life on an unstable foundation. We look at three training methodologies that build functional strength without requiring a gym membership, and why the discipline of daily physical practice transfers to every other area of your life.' },
      { title: 'The Political Body', body: 'Your body is political. The way Black men are perceived — as threats, as athletes, as laborers — is inseparable from how our bodies are read by the world around us. This section explores the intersection of physical presence and political reality, and why reclaiming your body as your own is an act of resistance.' },
      { title: 'Book of the Week', body: 'This week we recommend "The Warrior Ethos" by Steven Pressfield. A short, powerful meditation on what it means to carry yourself as a warrior in a world that wants you comfortable and compliant. Read it in one sitting.' },
    ],
    access_tier: 'free',
    cover_image: '/placeholders/briefing.svg',
    published_at: '2026-03-15T08:00:00Z',
  },
  {
    issue_number: 2,
    title: 'Power and Patience',
    slug: 'weekend-briefing-002',
    sections: [
      { title: 'The Long Game', body: "Power is not built overnight. This week we examine the strategies of men who played the long game — from Thurgood Marshall's decades-long legal strategy to dismantle segregation, to the quiet discipline of building generational wealth one decision at a time. Patience is not passive. It is strategic." },
      { title: 'Local Power Structures', body: 'We profile three cities where Black political organizing at the local level has produced tangible results — better schools, accountable policing, and community-controlled development. The common thread: sustained, organized, local engagement. National politics gets the attention. Local politics gets the results.' },
      { title: "The Chairman's Desk", body: 'A personal note on why this publication exists. The Black Male Journal is not a lifestyle brand. It is not a content farm. It is an attempt to build a space where Black men can think seriously about their lives without the noise of social media, the condescension of mainstream media, or the superficiality of the self-help industry.' },
    ],
    access_tier: 'free',
    cover_image: '/placeholders/briefing.svg',
    published_at: '2026-03-08T08:00:00Z',
  },
  {
    issue_number: 1,
    title: 'First Principles',
    slug: 'weekend-briefing-001',
    sections: [
      { title: 'Why This Exists', body: 'Welcome to the first Weekend Briefing. This is a weekly dispatch designed to cut through the noise and deliver substance. Each issue covers three areas: health, philosophy, and politics — the three lenses through which we examine the Black male experience. No clickbait. No outrage farming. Just ideas worth sitting with.' },
      { title: 'The Health Imperative', body: 'Black men die younger than almost every other demographic group in America. Heart disease, hypertension, diabetes — these are not merely medical problems. They are the physical manifestation of systemic stress, food deserts, and a healthcare system that has historically failed us. Taking control of your health is not vanity. It is survival.' },
      { title: 'Required Reading', body: "This week we recommend \"Between the World and Me\" by Ta-Nehisi Coates. Not because it has all the answers, but because it asks the right questions. Pair it with James Baldwin's \"The Fire Next Time\" for a conversation across generations about what it means to inhabit a Black body in America." },
    ],
    access_tier: 'free',
    cover_image: '/placeholders/briefing.svg',
    published_at: '2026-03-01T08:00:00Z',
  },
];

// ── Courses (6) ─────────────────────────────────────────────────────────────

const courses = [
  { title: 'Fundamentals of Combat Discipline', slug: 'fundamentals-of-combat-discipline', description: "Build a warrior's foundation. This course covers striking fundamentals, defensive positioning, and the mental discipline that separates fighters from practitioners.", category: 'martial-arts', access_tier: 'free', published: true, cover_image: '/placeholders/course.svg' },
  { title: "The Stoic Man's Framework", slug: 'the-stoic-mans-framework', description: 'Ancient philosophy meets modern manhood. Learn to apply Stoic principles to daily decisions, emotional regulation, and long-term purpose.', category: 'purpose', access_tier: 'free', published: true, cover_image: '/placeholders/course.svg' },
  { title: 'Building Your Personal Brand', slug: 'building-your-personal-brand', description: 'Your name is your currency. Master the fundamentals of personal branding — from visual identity to voice, positioning, and platform strategy.', category: 'branding', access_tier: 'premium', published: true, cover_image: '/placeholders/course.svg' },
  { title: 'Emotional Intelligence for Men', slug: 'emotional-intelligence-for-men', description: "Strength isn't silence. Develop emotional literacy, learn to read social dynamics, and build the communication skills that command respect.", category: 'mental-health', access_tier: 'free', published: true, cover_image: '/placeholders/course.svg' },
  { title: 'Partnership & Power Dynamics', slug: 'partnership-and-power-dynamics', description: 'Navigate relationships with intention. Explore attachment theory, conflict resolution, and the dynamics of power and vulnerability in partnership.', category: 'relationships', access_tier: 'premium', published: false, cover_image: '/placeholders/course.svg' },
  { title: 'Advanced Self-Defense Systems', slug: 'advanced-self-defense-systems', description: 'Beyond the basics. Integrate Krav Maga, Brazilian Jiu-Jitsu, and situational awareness into a personal defense system built for real-world scenarios.', category: 'martial-arts', access_tier: 'premium', published: false, cover_image: '/placeholders/course.svg' },
];

// ── Dispatches (6) ──────────────────────────────────────────────────────────

const dispatches = [
  { title: 'On the Necessity of Silence', slug: 'on-the-necessity-of-silence', lens: 'philosophy', excerpt: 'Not every thought needs an audience. Some convictions must be carried in silence before they are ready to be spoken.', body: "There is a discipline in restraint that this generation has lost. Every impulse becomes a post. Every reaction becomes a thread. Every wound becomes content.\n\n## The Problem with Performative Thought\n\nWhen you externalize every idea the moment it forms, you never develop the internal pressure that forges conviction. You get applause for half-formed thoughts and mistake engagement for understanding.\n\nThe men who shaped history understood this. They sat with ideas for years before acting. They let silence do the work that noise cannot.\n\n## What Silence Builds\n\nSilence builds discernment. It teaches you to separate the urgent from the important. It creates space for the kind of thinking that cannot happen in public.\n\nPractice it. Sit with your thoughts for a week before you share them. Watch how they change. Watch how the weak ones die and the strong ones sharpen.", author: 'The Chairman', cover_image: '/placeholders/dispatch.svg', published_at: '2026-03-14T08:00:00Z' },
  { title: 'Dispatch: Weekend Reading List', slug: 'weekend-reading-list-march-2026', lens: 'philosophy', excerpt: 'Five books every man should read this spring. No self-help. No productivity hacks. Just substance.', body: "Spring is the season of renewal, and your reading list should reflect that. Here are five books that will challenge your assumptions and sharpen your mind.\n\nThe Autobiography of Malcolm X — If you have not read this, stop everything and start now.\n\nMeditations by Marcus Aurelius — The original manual for composure under pressure.\n\nThe Wretched of the Earth by Frantz Fanon — Understanding the psychology of oppression.\n\nMan's Search for Meaning by Viktor Frankl — Suffering has purpose, but only if you choose it.\n\nThe Art of War by Sun Tzu — Strategy is not just for the battlefield.\n\nRead one per month. Take notes. Discuss with your circle. Knowledge without application is entertainment.", author: 'The Chairman', cover_image: '/placeholders/dispatch.svg', published_at: '2026-03-10T08:00:00Z' },
  { title: 'The Gym Is Not Optional', slug: 'the-gym-is-not-optional', lens: 'health', excerpt: 'Your body is the first thing the world sees. It is also the vehicle for everything you want to accomplish. Treat it accordingly.', body: "I am tired of the conversation about whether men should prioritize fitness. This is not a debate. Your physical condition is the foundation upon which everything else is built.\n\n## The Non-Negotiables\n\nTrain at least four days per week. This is not negotiable. The form does not matter — weights, calisthenics, martial arts, swimming. What matters is consistency and intensity.\n\nEat clean six days out of seven. You know what clean means. Stop pretending you do not.\n\nSleep seven to eight hours. Your phone does not need you at midnight.\n\n## Why This Matters\n\nA strong body builds a strong mind. The discipline required to maintain physical fitness transfers to every other area of your life. When you can push through the last set, you can push through the hard conversation, the difficult decision, the long night of work.\n\nThis is not vanity. This is infrastructure.", author: 'The Chairman', cover_image: '/placeholders/dispatch.svg', published_at: '2026-03-07T08:00:00Z' },
  { title: 'Local Politics Matter More Than National', slug: 'local-politics-matter-more', lens: 'politics', excerpt: 'You are not going to change Washington from your living room. But you can change your city council district by showing up.', body: "Every election cycle, the same pattern repeats. Black men get energized about the presidential race, argue on social media for six months, vote (or do not), and then disappear from political engagement for four years.\n\nMeanwhile, your city council passes zoning laws that determine where your children go to school. Your county board allocates police budgets. Your state legislature draws the maps that decide whether your vote counts.\n\n## What You Can Actually Do\n\nAttend one city council meeting this month. Just one. Sit in the back and listen. Learn who the players are. Understand how decisions get made.\n\nThen identify one issue that affects your neighborhood directly. Housing, policing, schools, infrastructure. Pick one and follow it.\n\nThis is how power is built — from the ground up, not the top down.", author: 'The Chairman', cover_image: '/placeholders/dispatch.svg', published_at: '2026-03-03T08:00:00Z' },
  { title: 'A Note on Brotherhood', slug: 'a-note-on-brotherhood', lens: 'philosophy', excerpt: 'The men around you are either building you up or holding you back. Choose your circle with the same care you choose your investments.', body: "I received a message last week from a reader who said he had no close male friends. He is thirty-four years old, successful by most measures, and deeply isolated.\n\nThis is more common than anyone wants to admit. The epidemic of male loneliness is not an abstraction — it is your neighbor, your coworker, your brother.\n\n## The Solution Is Uncomfortable\n\nBuilding brotherhood requires vulnerability, and vulnerability requires courage. You must be willing to say: I need people. I cannot do this alone.\n\nFind one man you respect and invite him to train with you. Or read with you. Or build something with you. Shared purpose is the foundation of every lasting bond between men.\n\nDo not wait for community to find you. Build it.", author: 'The Chairman', cover_image: '/placeholders/dispatch.svg', published_at: '2026-02-25T08:00:00Z' },
  { title: 'Site Update: What Is Coming', slug: 'site-update-what-is-coming', lens: 'politics', excerpt: 'The Black Male Journal is growing. Here is what we are building and why.', body: "This platform started as an idea — a place where Black men could find substantive content that respects their intelligence and challenges their comfort.\n\nWe are building several new features:\n\nThe Academy will offer structured courses on martial arts, mental health, financial literacy, and leadership. These are not motivational videos — they are curricula.\n\nThe Weekend Briefing will expand to include audio editions for those who prefer to listen on their commute.\n\nA member portal is coming that will give premium subscribers access to exclusive content, downloads, and a private discussion space.\n\nNone of this happens without your support. If this work matters to you, share it with one person today.", author: 'The Chairman', cover_image: '/placeholders/dispatch.svg', published_at: '2026-02-18T08:00:00Z' },
];

// ── Seed function ───────────────────────────────────────────────────────────

async function seedTable(tableName: string, data: Record<string, unknown>[]) {
  // Clear existing rows
  const { error: delErr } = await supabase
    .from(tableName)
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
  if (delErr) {
    console.error(`  CLEAR ${tableName}: ${delErr.message}`);
    return false;
  }

  const { error: insErr } = await supabase.from(tableName).insert(data);
  if (insErr) {
    console.error(`  INSERT ${tableName}: ${insErr.message}`);
    return false;
  }

  console.log(`  ${tableName}: ${data.length} rows`);
  return true;
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Seeding Black Male Journal database...\n');

  // Check if dispatches table exists
  const { error: checkErr } = await supabase.from('dispatches').select('id').limit(1);
  const dispatchesExist = !checkErr || !checkErr.message.includes('does not exist');

  if (!dispatchesExist) {
    console.log('  WARNING: dispatches table does not exist.');
    console.log('  Run supabase/migrations/create-dispatches.sql in the SQL Editor first.\n');
  }

  await seedTable('articles', articles);
  await seedTable('briefings', briefings);
  await seedTable('courses', courses);

  if (dispatchesExist) {
    await seedTable('dispatches', dispatches);
  }

  console.log('\nDone.');
}

main().catch(console.error);
