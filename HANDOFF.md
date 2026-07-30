# MetMeSS 2026 website — handoff

State of play as of 30 July 2026. Written so someone with no prior context can pick this up.

## What this is

Conference website for MetMeSS 2026 — 6th Symposium on Meteoroids, Meteors and Meteorites: Messengers from Space. 25–27 October 2026, Department of Geology & Geophysics, IIT Kharagpur, with PRL Ahmedabad. Funded by the IIT Kharagpur Platinum Jubilee and The Meteoritical Society.

Owner: Kishan Tiwari. Convenors: Prof. Sujoy Ghosh, Prof. Saibal Gupta.

## Files in this folder

```
metmess2026-site/
├── index.html      the entire site — markup, CSS and JS in one file (~33 KB)
├── DEPLOY.md       how to publish on GitHub Pages and how to edit later
├── README.md       technical notes and the fill-in checklist
├── HANDOFF.md      this file
└── assets/img/     logos, campus photos, science figures, starfield background
```

Static site. No build step, no dependencies, no server-side code. Open `index.html` in a browser and it works.

## Decisions already made

- **Landscape 4:3 flyer**, white theme and space theme, both produced (PPTX, in the parent folder)
- **Hosting:** IIT KGP subdomain preferred (`metmess2026.iitkgp.ac.in`); GitHub Pages as fallback at `metmess.github.io` under a `metmess` organisation
- **Submissions:** Google Forms plus a payment-instructions PDF — no backend
- **Scope:** full site now, with placeholders for anything not yet decided
- **Design:** dark navy with starfield hero; gold and cyan accents; Space Grotesk headings, Inter body

## What works

Sticky nav with mobile menu, hero with live countdown, about, six theme cards, dates table, speakers grid, tabbed programme, registration and fees, venue with map and travel notes, committee, code of conduct, sponsors, contact, footer. Responsive at 980px and 760px. SEO and Open Graph tags, favicon. HTML validated — no unclosed tags, all anchors resolve, all asset paths exist.

## Blocked on information

| Item | Needed from |
|---|---|
| Real conference email (`metmess2026@iitkgp.ac.in` is a guess) | Convenors / CIC |
| Phone number | Convenors |
| Registration fees — all rows say TBA | Convenors |
| Abstract submission deadline | Convenors |
| Invited speaker list | SOC |
| Detailed programme | SOC |
| Hotel list and rates | Local organising team |
| Google Form URLs | Whoever creates them |
| Higher-res PRL logo (current one is 46×46 px) | PRL |
| Higher-res science figures (from the 2021 deck, low resolution) | Original authors |

## Next steps, in order

1. Confirm the email address and phone
2. Decide the hosting route — chase CIC, or set up GitHub Pages as an interim (DEPLOY.md, Part 2)
3. Create the two Google Forms; replace the `data-todo` links in `index.html`
4. Fill fees and the abstract deadline
5. Export the flyer to PDF, upload to `assets/`, link it from the About section
6. Announce

## Notes for whoever picks this up

- Every unfinished link in `index.html` is tagged `data-todo` — searching for that string finds all of them at once
- Section boundaries are marked with `<!-- ============ NAME ============ -->` comments
- Colours are two CSS variables at the top of the `<style>` block: `--cyan` and `--gold`
- Fonts load from Google Fonts. If the IIT KGP network blocks external CDNs, the site still renders — it falls back to system fonts, just less distinctively
- The map is a keyless Google Maps embed, so nothing to renew
- The countdown target date is hardcoded near the bottom of the script

## Open questions

- Does MetMeSS have a rolling domain the series is meant to live on? The 2024 site was at `metmess2024.ipsa-asso.in`, which suggests a society domain exists. Worth asking Sujoy sir — if so, use it instead of GitHub Pages for continuity and inherited search ranking.
- Is the Meteoritical Society support a formal sponsorship? Some societies require specific logo placement and wording.
