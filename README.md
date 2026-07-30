# MetMeSS 2026 — conference website

Static site. No build step, no server-side code, no dependencies. Upload the folder and it works.

```
metmess2026-site/
├── index.html          ← everything: markup, CSS, JS
├── README.md
└── assets/img/         ← logos, campus photos, science figures, starfield
```

## Deploying to an IIT KGP subdomain

1. Email the Computer & Informatics Centre (CIC) requesting a subdomain — suggested: `metmess2026.iitkgp.ac.in`. Mention it's a departmental conference site, static HTML, and give the convenors' names for approval.
2. They'll give you an upload path or SFTP credentials.
3. Upload the whole `metmess2026-site` folder contents (not the folder itself) to the web root, so `index.html` sits at the top.
4. Confirm HTTPS is on.

If CIC is slow, a free interim option: create a GitHub repo, upload these files, enable Pages in Settings → Pages. Live at `username.github.io/metmess2026` in minutes; you can point a custom domain later.

## Before it goes public — things to fill in

Search `index.html` for `data-todo` — every placeholder link is marked. Replace the `href="#"` with the real URL and remove `data-todo`.

| What | Where | Notes |
|---|---|---|
| Abstract submission form | `#register` | Google Form URL |
| Registration form | `#register` | Google Form URL |
| Abstract template | `#register` | Upload a `.docx` to `assets/` and link it |
| Payment instructions | `#register` | Upload a PDF to `assets/` |
| Flyer PDF | `#about` | Export from the PPTX and drop in `assets/` |
| Registration fees | `#register` table | All rows currently say TBA |
| Abstract deadline | `#dates` | Currently TBA |
| Phone number | `#contact` and footer | Currently `+91 —` |
| Speakers | `#speakers` | Four placeholder cards — add photo, name, affiliation, profile link |
| Programme detail | `#programme` | Outline only; replace slots as the schedule firms up |
| Hotel list | `#venue` | Add once rates are negotiated |

The email `metmess2026@iitkgp.ac.in` appears in three places. If you use a different address, search and replace.

## Adding a speaker

Replace one of the placeholder blocks in `#speakers`:

```html
<div class="person">
  <img class="ph" src="assets/img/speakers/name.jpg" alt="Prof. Name">
  <h3><a href="https://profile-url">Prof. Name</a></h3>
  <p>Institution, Country</p>
</div>
```

Use square photos, ~600×600 px. The `.ph` class already crops to a circle.

## Adding a gallery

After the event, drop photos into `assets/img/gallery/` and copy the `.gallery` block from `#venue` into a new section.

## Notes

- Fonts load from Google Fonts. If IIT KGP's network blocks external CDNs, download Inter and Space Grotesk into `assets/fonts/` and swap the `<link>` for local `@font-face` rules.
- The countdown targets `2026-10-25T09:00:00+05:30`. Change it in the script at the bottom if the start time shifts.
- The map is a keyless Google Maps embed — no API key needed.
- Colours live in the `:root` block at the top of the `<style>` tag. `--gold` and `--cyan` are the accents.
- Tested layout breakpoints: 980px and 760px.
