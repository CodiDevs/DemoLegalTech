# Taste
- Writes and expects replies in Spanish (Rioplatense register). Confidence: 0.9
- Reports work as short, high-level goals ("there are visual bugs and errors, fix them") and delegates discovery to the agent rather than naming files, pages, or repro steps up front. Confidence: 0.6
- Prefers ultra-terse "caveman mode" responses — the agent auto-activates the `caveman` skill at `ultra` intensity, so answers should be stripped of filler and prose padding. Confidence: 0.6
- For client-facing demos, prefers maximalist, high-impact presentation: large-scale structural redesigns, abundant motion, monumental visual elements, and theatrical transitions—not incremental polish, minor tweaks, or microanimations. Confidence: 1.0
- Wants spectacular frontend motion without sacrificing stability; expects designs to be reviewed and changes planned before implementation, with error prevention treated as a hard requirement. Confidence: 0.85
- Uses Brave as the primary browser; for headless frontend tests, locate `brave.exe` and set it as `CHROME_BIN` when Google Chrome is unavailable. Confidence: 1.0
- Handles git commits on their own and expects the agent to leave changes uncommitted; asks the agent to diagnose merge/push blockers (behind/ahead counts, dry-run conflict checks) rather than to commit or push for them. Confidence: 0.6
