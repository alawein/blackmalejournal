-- Seed lessons — sample lessons for existing courses.
-- Depends on courses being seeded first (references course IDs by slug lookup).
-- Safe to re-run: uses ON CONFLICT DO NOTHING.

DO $$
DECLARE
  v_course_id uuid;
BEGIN
  -- Course: Fundamentals of Combat Discipline (martial-arts category, published)
  SELECT id INTO v_course_id FROM public.courses WHERE slug = 'fundamentals-of-combat-discipline' LIMIT 1;
  IF v_course_id IS NOT NULL THEN
    INSERT INTO public.lessons (course_id, title, slug, order_number, body, duration, published)
    VALUES
      (v_course_id, 'The Morning Protocol', 'the-morning-protocol', 1,
       'Every great man begins his day before the sun rises. This lesson covers the foundational morning routine that builds discipline from the first hour of your day. We will cover cold exposure, movement, and meditation as the three pillars of the morning protocol.

The key insight: discipline is not about motivation. Motivation is a feeling, and feelings are unreliable. Discipline is a structure — a set of non-negotiable actions that happen regardless of how you feel.

Step 1: Wake at the same time every day. No exceptions. No "just five more minutes." The alarm is not a suggestion.

Step 2: Cold water. Within 10 minutes of waking, expose yourself to cold. A cold shower, a cold plunge, or at minimum, cold water on the face and wrists. This activates your sympathetic nervous system and tells your body: we are awake, we are alert, we are ready.

Step 3: Move. Twenty minutes of bodyweight training or stretching. Not a full workout — that comes later. This is about waking the body and establishing dominion over it.

Step 4: Silence. Ten minutes of seated meditation. Not guided, not with music. Just you and your breath. This is where you practice the most important skill a man can have: the ability to be still.',
       12, true),
      (v_course_id, 'Bodyweight Mastery', 'bodyweight-mastery', 2,
       'Before you touch a barbell, you must master your own body. This lesson covers the progressive bodyweight training framework that builds real-world strength, mobility, and body awareness.

The modern gym has created a generation of men who can bench press 225 but cannot do a pistol squat. Who can deadlift 400 but cannot hold a handstand. This is not strength — it is partial development.

True physical mastery begins with these five movements:
1. The Push-Up (and its progressions through to planche)
2. The Pull-Up (and its progressions through to muscle-up)
3. The Squat (and its progressions through to pistol)
4. The L-Sit (and its progressions through to V-sit)
5. The Bridge (and its progressions through to stand-to-stand)

Each movement has 8-10 progressions. You earn the next progression. There are no shortcuts.',
       15, true),
      (v_course_id, 'Nutrition as Strategy', 'nutrition-as-strategy', 3,
       'What you eat is either building you or breaking you. There is no neutral food. This lesson reframes nutrition from a chore into a strategic advantage.

We do not do diets. Diets are temporary restrictions that produce temporary results. We do protocols — permanent frameworks that become invisible because they are integrated into your identity.

The BMJ Nutrition Framework has three rules:
Rule 1: Eat whole foods. If it has a label with more than 5 ingredients, it is manufactured, not grown. Manufactured food is designed to be addictive, not nutritious.
Rule 2: Eat enough protein. One gram per pound of lean body mass, minimum. Protein is the building material. Everything else is fuel.
Rule 3: Earn your carbohydrates. Carbs are fuel for performance. If you trained today, you eat carbs. If you did not, you fast or go low-carb.',
       10, true)
    ON CONFLICT (course_id, slug) DO NOTHING;
  END IF;

  -- Course: The Stoic Man''s Framework (purpose category, published)
  SELECT id INTO v_course_id FROM public.courses WHERE slug = 'the-stoic-mans-framework' LIMIT 1;
  IF v_course_id IS NOT NULL THEN
    INSERT INTO public.lessons (course_id, title, slug, order_number, body, duration, published)
    VALUES
      (v_course_id, 'What the Stoics Actually Taught', 'what-the-stoics-actually-taught', 1,
       'Stoicism has been co-opted by social media into a collection of motivational quotes. This lesson returns to the source texts — Marcus Aurelius, Epictetus, Seneca — and extracts the actual philosophical framework.

The core Stoic insight is deceptively simple: some things are within your control, and some things are not. Your opinions, your desires, your aversions — these are yours. Everything else — your body, your reputation, your possessions, other people''s actions — these are not.

This is not passive resignation. It is radical clarity. The Stoic man does not waste energy raging at things he cannot change. He channels all of his energy into the one domain where he has absolute power: his own character.',
       15, true),
      (v_course_id, 'The Discipline of Perception', 'the-discipline-of-perception', 2,
       'Marcus Aurelius wrote: "You have power over your mind — not outside events. Realize this, and you will find strength." This lesson explores how to train your perception.

Every event in your life is neutral until you assign meaning to it. A job loss is neither a tragedy nor an opportunity until you decide what it means. A rejection is neither a failure nor a redirection until you frame it.

The discipline of perception is the practice of choosing your frame deliberately, rather than defaulting to the emotional reaction your conditioning has programmed.

Exercise: For one week, keep a perception journal. Every time something happens that triggers an emotional reaction, write down three things: (1) What happened (facts only), (2) What story you told yourself, (3) An alternative story that serves you better.',
       12, true)
    ON CONFLICT (course_id, slug) DO NOTHING;
  END IF;
END $$;
