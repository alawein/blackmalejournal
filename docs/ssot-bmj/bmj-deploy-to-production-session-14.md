● The brief is at lab/research/SESSION_BRIEF.md. When you open each new session, you  
  can point it to that file and tell it which session number it is. For example:      

  - Session 2: "Read lab/research/SESSION_BRIEF.md. You are Session 2 — pure
  mathematics. Work on Papers 2 and 3."
  - Session 3: "Read lab/research/SESSION_BRIEF.md. You are Session 3 — applied       
  governance and sheaf cohomology."
  - etc.

  This session (Session 1) is the coordinator + Paper 1 (Bell, already done). What do 
  you want to tackle here next?

✻ Crunched for 35s

❯ give me the separate prompts 

● Here are the four prompts to paste into each new session:

  ---
  Session 2 — Pure Mathematics

  Read /mnt/c/Users/mesha/Desktop/GitHub/morphism/lab/research/SESSION_BRIEF.md and   
  /mnt/c/Users/mesha/Desktop/GitHub/morphism/MORPHISM.md. You are Session 2 — Pure    
  Mathematics.

  Your assignment: Write Papers 2 and 3 from the research program.

  Paper 2 (Incompleteness): A Gödel-style result for governance. Prove that no        
  sufficiently expressive self-governing system can verify its own consistency. Use   
  the axioms in MORPHISM.md v4.0.0 — they define a formal system, so
  incompleteness-style results may apply. Ground this in logic and set theory. If a   
  physics analogy helps (e.g., "observing governance disturbs it" à la Heisenberg),   
  use it as flavor, not foundation.

  Paper 3 (Galois Governance): A formal duality between policy spaces and behavior    
  spaces using Galois connections from order theory. The invariant lattice Ω and the  
  category C already define two ordered structures — explore whether there's a        
  adjunction or Galois connection between "what policies say" and "what agents do."   

  Output both papers to /mnt/c/Users/mesha/Desktop/GitHub/morphism/lab/research/ as   
  markdown files. Be mathematically rigorous. Read the Bell paper
  (GOVERNANCE_BELL_INEQUALITY.md) for style reference — especially Section 3, which   
  honestly addresses where an analogy breaks.

  ---
  Session 3 — Applied Governance

  Read /mnt/c/Users/mesha/Desktop/GitHub/morphism/lab/research/SESSION_BRIEF.md and   
  /mnt/c/Users/mesha/Desktop/GitHub/morphism/MORPHISM.md. You are Session 3 — Applied 
  Governance.

  Your assignment: Write Paper 5 (Sheaf Cohomology) and develop organizational        
  applications.

  Paper 5 (Sheaf Cohomology): Develop the sheaf-theoretic consistency framework       
  rigorously. Axioms A4 and A5 define a policy sheaf F on the Alexandrov topology of  
  the component graph. This paper should: (a) classify governance failures by
  cohomology degree — H¹ for pairwise inconsistency, H² for higher-order obstructions,
   (b) give concrete examples of each failure type in real organizational structures, 
  (c) develop algorithms for computing these cohomology groups on finite governance   
  graphs.

  Organizational applications: Show how the sheaf framework maps to real governance — 
  corporate hierarchies, regulatory compliance, distributed software systems. Make it 
  concrete and useful, not just abstract.

  Output to /mnt/c/Users/mesha/Desktop/GitHub/morphism/lab/research/ as markdown.     
  Mathematical rigor first, but this session should be the most applied — show        
  practitioners why they should care.

  ---
  Session 4 — Kernelization

  Read /mnt/c/Users/mesha/Desktop/GitHub/morphism/lab/research/SESSION_BRIEF.md and   
  /mnt/c/Users/mesha/Desktop/GitHub/morphism/MORPHISM.md. You are Session 4 —
  Kernelization.

  Your assignment: Write Paper 4 (Governance Algebra) and develop the kernel
  architecture for formal verification.

  Paper 4 (Governance Algebra): What algebraic structure does policy composition form?
   Axiom A3 says C is a symmetric monoidal category and I is a monoidal functor. This 
  paper should: (a) characterize the algebraic structure of the policy space — is it a
   monoid, group, ring? What are its generators and relations? (b) classify invariants
   algebraically — what's the analogue of Noether's theorem (symmetries → conservation
   laws) for governance? (c) develop the algebra concretely enough that it could be   
  implemented as a type system.

  Kernel architecture: Explore how these algebraic structures map to the kernel/      
  directory — formal verification of governance code, type-level enforcement of       
  axioms, decidability boundaries from A7. This is where math meets engineering.      

  Output papers to /mnt/c/Users/mesha/Desktop/GitHub/morphism/lab/research/ as        
  markdown. For kernel architecture work, propose changes to kernel/ structure if     
  needed.

  ---
  Session 5 — Philosophy & Deontic Logic

  Read /mnt/c/Users/mesha/Desktop/GitHub/morphism/lab/research/SESSION_BRIEF.md and   
  /mnt/c/Users/mesha/Desktop/GitHub/morphism/MORPHISM.md. You are Session 5 —
  Philosophy & Deontic Logic.

  Your assignment: Write Paper 6 (Deontic Morphism) and develop the philosophical     
  foundations.

  Paper 6 (Deontic Morphism): Formalize the 42 tenets as a deontic logic — a logic of 
  obligation (O), permission (P), and prohibition (F). Each tenet becomes a formal    
  statement in this logic. Questions to address: (a) Is the tenet system consistent in
   the deontic sense? (b) Are there implicit obligations not captured by the 42       
  tenets? (c) What modal logic framework best fits — Standard Deontic Logic, or       
  something richer like dynamic deontic logic? (d) How does the categorical structure 
  (A0, A3) interact with deontic operators?

  Philosophical foundations: Explore the philosophy of governance itself. What does it
   mean for a system to be "governed"? How does Morphism relate to existing philosophy
   of law, social contract theory, institutional design? This is the most humanistic  
  session — connect the mathematics to meaning.

  Output to /mnt/c/Users/mesha/Desktop/GitHub/morphism/lab/research/ as markdown. This
   session should be readable by philosophers, not just mathematicians.

  ---
  Copy-paste each into a fresh Claude Code session. They'll all read the shared brief 
  and MORPHISM.md, then diverge into their domains.
