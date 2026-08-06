# Disney Dashboard v2 — Phase 4 Spec: README Addition

**Branch:** `v2-phase4-readme` (fresh branch off `main` — Phase 1/2/3 already merged)
**PR scope:** Add one new section to `README.md` titled "What the Q1–Q3 FY26 actuals taught us." No code changes. No source-data mutations. README-only.
**Reviewer:** Agustin. Diff-only review before merge and v2.0 tag.
**Prerequisite:** Phase 3 merged (confirmed — `main` at `104a6c0` includes Phases 1 & 2; Phase 3 merged as PR #2).

---

## 1. What Phase 4 is (and what it is not)

**Is:**
- One new section in `README.md` following the NBCU v2.0 discipline: what recalibrated, what actuals taught us per segment, what v2 explicitly does not do.
- Placement between the existing "Source data" section and the existing "Disclosure" section.
- Cross-references to the About modal's Methodology Note (v2) and to the Prior FY26 Forecast column on the Segment Forecast table.

**Is not:**
- Any code change. Zero component/lib/config edits.
- Any change to the existing Source data section (though the four FY26 filings are mentioned in the new section, the "Source data" section stays as-is — the About modal has the fuller citations list).
- Any change to Live URL, Tech stack, Disclosure, About the methodology, or Author sections.
- A v2 versioning banner in the "What this dashboard does" section (keeps the top of the README stable for casual readers; v2 context lives in the dedicated section below).

---

## 2. Exact placement

**Insert immediately before the "## Disclosure" section (before line 37 of the current README).** Preserves the readability arc: what it does → tech stack → source data → *what v2 learned from actuals* → disclosure → methodology → author.

New section header: `## What the Q1–Q3 FY26 actuals taught us`.

---

## 3. Exact content

Copy-paste-ready markdown. Three paragraphs, ~350 words total, matching NBCU v2.0's structural discipline. Reviewer: read the whole thing before I implement — this is the entire deliverable of Phase 4.

```markdown
## What the Q1–Q3 FY26 actuals taught us

v2 (released August 2026) recalibrates the FY26 driver defaults using evidence from Disney's Q1, Q2, and Q3 fiscal 2026 filings (Business Wire releases dated February 2, May 6, and August 5, 2026 respectively). v1's shipped FY26 forecast — the version live on this dashboard from May 31, 2026 through v2's release — is preserved on the Segment Forecast table as a frozen "Prior FY26 Forecast" column so users can see, at a glance, where the driver-based model landed at v1 and where it lands now that three quarters of actuals are in. The Prior column is a hardcoded constant, never recomputed, and persists across every Reset and every slider movement. The methodology and each recalibrated default's evidence citation are documented in the About modal's Methodology Note (v2) and in each driver's info tooltip.

Three segment-level lessons stand out. **Entertainment margin was conservative in v1.** The v1 default of 11.5% assumed only modest expansion from FY25's 11.0%; actuals ran Q1 9.5% → Q2 ~11.3% → Q3 14.8%, with Entertainment SVOD hitting a 13% operating margin in Q3 FY26 as DTC scaled against a comparatively fixed content cost base. v2 raises the default to 12.5%. **Sports cost pressure ran heavier than modeled.** v1 assumed +4% programming cost growth; Q3 FY26 saw Sports operating income decline 17% year-over-year (vs. Disney's own −14% guidance), driven by a double-digit programming expense step-up including NBA rights timing. v2 raises the `sportsRightsCostGrowth` default to +7% and derives a `sportsMargin` default of 18.0% to hold effective FY26 Sports OI inside Disney's mid-single-digit growth guidance range. **Experiences margin ran hotter than assumed.** v1 held Experiences margin flat at 27.6%; Disney disclosed approximately 30% Experiences operating margin through the first nine months of FY26 on the Q3 earnings call, with Q3 alone at 30.3%. v2 raises the default to 29.5% — deliberately below the 9M YTD figure to avoid over-projecting the Q3 breakout. A structural change already announced but out of scope for v2 is the Consumer Products line-of-business reorganization from Experiences to Entertainment, effective FY27. Modeling that reorganization requires Disney's restated historical segment baselines, expected in the Q1 FY27 filing (early February 2027), and will be revisited in a future v3.

**What v2 explicitly does not do.** v2 does not convert the model from annual to quarterly — the dashboard stays a full-year projection tool. v2 does not recalibrate FY27 or FY28 driver defaults; those years continue to use the existing forward-projection logic against the new FY26 base, and their outputs should be read as sensitivity scenarios rather than point forecasts until FY27 disclosure evidence lands. v2 does not model the Consumer Products reorganization (deferred to v3 as noted above). v2 does not attempt to converge default-state Total Segment Operating Income on Disney's own blended actual-plus-Q4-guide FY26 outlook (~$19.7B); at v2 defaults the model produces approximately $20.9B — roughly $1.0B above the implied guide — because applying Q3-rate driver evidence uniformly across all four quarters of FY26 produces a higher full-year figure than blending three actuals quarters with a softer Q4 guide. The About modal's Methodology Note (v2) documents this divergence in full. Users who want to converge on Disney's implied outlook can soften individual drivers toward blended Q1–Q3 rates; the dashboard's purpose is scenario modeling, not guidance matching.
```

---

## 4. Content design choices worth calling out at review

1. **Bold ledes on the three segment lessons** — Entertainment / Sports / Experiences each get a bolded sentence-lead so a skimmer can pick up all three learnings in one glance. Matches the NBCU v2.0 rhythm.
2. **The Sports paragraph cites the sportsMargin derivation without exposing the internal wiring** — the README says "derives a sportsMargin default of 18.0% to hold effective FY26 Sports OI inside Disney's mid-single-digit growth guidance range." The tooltip in the app carries the full Decision 17 wiring detail. README-level readers don't need that plumbing.
3. **Consumer Products reorganization gets one sentence in the segment paragraph, one sentence in the "does not do" paragraph.** Deliberately not a bullet list. The message is: we know about it, we thought about it, we chose not to do it in v2, here's when we'd revisit.
4. **The $20.9B vs. $19.7B disclosure is repeated from the About modal** — intentional. The README is a first stop for reviewers who won't open the About modal. Repeating this in both places is defensive discipline, not redundancy.
5. **"Business Wire releases dated…"** language for the Q1/Q2/Q3 dates — matches your correction that the Q1 FY26 date is February 2, 2026 (from the Business Wire release header, not the SEC filing date).
6. **No hyperlinks in the README body** — deliberately no direct links to Disney's IR page or Business Wire releases. The About modal has the linked "Disney IR" button; the README stays plain markdown so it renders well on GitHub without external dependencies breaking.

---

## 5. Files changed in Phase 4

| File | Change |
|---|---|
| `README.md` | Insert one new section (`## What the Q1–Q3 FY26 actuals taught us`) between the existing "Source data" section and "Disclosure" section |

One file, one commit.

---

## 6. Verification steps before opening the PR

1. `npm run build` clean (no functional change, but sanity check).
2. `README.md` renders correctly on GitHub after push:
   - New section appears between "Source data" and "Disclosure."
   - Bold ledes render (`**Entertainment margin was conservative in v1.**`, etc.).
   - No broken markdown, no orphan asterisks, no runaway inline code.
3. `git diff --stat` shows only `README.md` and `docs/v2_phase4_spec.md`. No unintended changes to any code or config file.
4. Live dashboard at `disney-segment-dashboard.vercel.app` unchanged (Phase 4 is docs-only; Vercel redeploys but the built app is identical).

---

## 7. Commit plan

Single commit on branch `v2-phase4-readme` (fresh branch from current `main`).

```
Phase 4: Add README section "What the Q1-Q3 FY26 actuals taught us"

Documents the v2 rebuild rationale in the README: what recalibrated,
what three quarters of FY26 actuals taught us per segment
(Entertainment margin was conservative, Sports cost pressure heavier
than modeled, Experiences margin ran hotter), and what v2 explicitly
does not do (no quarterly conversion, no FY27/FY28 recalibration, no
Consumer Products reorganization modeling — deferred to v3 pending
Q1 FY27 restated historical baselines).

Repeats the $20.9B vs. $19.7B methodology-gap disclosure from the
About modal so first-time reviewers landing on the README understand
the divergence before opening the app.

Placement: between existing "Source data" and "Disclosure" sections.
No code changes, no source-data mutations, no other README edits.
```

PR opened against `main`. Not merged until Agustin approves.

---

## 8. After Phase 4 merges — the v2.0 tag

Per your original workflow spec: "After all four PRs merge to main, tag v2.0 on the merge commit for the README PR."

I'll execute:

```bash
git checkout main
git pull
git tag -a v2.0 <merge-commit-sha> -m "v2.0 — FY26 recalibration and Prior FY26 Forecast column"
git push origin v2.0
```

Tag message body will include a one-paragraph summary of the four phases. I'll draft the tag body for your review before pushing the tag.

---

## 9. Out of scope for Phase 4

- No new code, no bug fixes, no dependency updates.
- No changes to Live URL, Tech stack, About the methodology, Author, or Companion portfolio asset sections.
- No changes to the "About this dashboard" section title/intro (Methodology Note (v2) already added in Phase 3).
- No v2.1 hooks, no v3 roadmap page, no CHANGELOG.md creation (git history + phase specs are the changelog).
- No sundry README polish. If you notice something else you want fixed in the README, we do that as a separate PR after v2.0 tag.

---

## 10. Open questions for reviewer before I implement

1. **Section placement.** Recommended: between "Source data" and "Disclosure." Alternative: between "What this dashboard does" and "Tech stack" (higher visibility) or as the last content section before "Author" (lower visibility, treats as appendix). Preference?
2. **Bold ledes format.** Recommended: three bolded sentence-leads inline in a single paragraph, matching NBCU v2.0. Alternative: convert to a bulleted list with bold labels. Preference?
3. **The $20.9B vs. $19.7B repeat.** Recommended: keep the full explanation in both README and About modal. Alternative: shorten in README to one sentence and defer to the About modal ("see the About modal's Methodology Note for the full explanation"). Preference?
4. **Section title casing.** Recommended: `## What the Q1–Q3 FY26 actuals taught us` (sentence case, en-dash between Q1 and Q3, no colon). Alternative: `## What the Q1-Q3 FY26 Actuals Taught Us` (title case, hyphen). Preference?

If no strong preferences, I'll take the recommended path in each case.

---

## Version

| Version | Date | Change |
|---|---|---|
| Phase 4 spec v1.0 | 2026-08-05 | Initial draft for Agustin review |
