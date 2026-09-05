# MetMeSS 2026 website, version 2

Experimental redesign. The original site is untouched in `Website/`.

Glassmorphism on a single dark starfield. Plain HTML, no framework, no build
step. Edit it through the GitHub pencil icon exactly like the old site.

## Files

    index.html          home page
    register.html       3-step registration and UPI payment
    abstract.html       3-step abstract submission and file upload
    assets/css/base.css   design tokens, reset, typography, buttons, .glass
    assets/css/site.css   home page sections and all responsive rules
    assets/css/forms.css  register and abstract pages
    assets/js/site.js     header, menu, countdown, tabs, scroll reveal
    assets/img/           WebP images, plus favicon and UPI QR as PNG
    assets/docs/          flyer PDF and abstract template DOCX
    apps-script/          unchanged backend, same as the old site

## Where to change things

- **Colours, spacing, fonts, corner radius**: the `:root` block at the top of
  `base.css`. Change `--accent` and the whole site follows.
- **Anything about how a section looks**: `site.css`, sections are labelled.
- **Mobile and tablet**: the bottom of `site.css` and of `forms.css`. Every
  breakpoint is in one place, not scattered.
- **Fees**: two places that must agree. The `FEES` object near the top of the
  script block in `register.html`, and the fee table in `index.html`.

## Still to do

1. **Connect the forms.** `SCRIPT_URL` in `register.html` and `abstract.html`
   is still the placeholder. Follow `SETUP.md` in the old site folder.
2. **Payment account.** `register.html` still shows a personal UPI ID. Swap it
   and `assets/img/upi-qr.png` once SRIC or CE&T provide a collection account.
3. **Speakers.** Delete anyone who has not sent a written acceptance.
4. Replace `assets/img/speakers/gopalan-srinivasan.webp`, the only source
   available was 140 px wide and it is visibly soft.

## Notes

- Images are WebP, resized to what the page actually displays. The whole home
  page is about 500 KB against roughly 5 MB before.
- No cache-busting query strings here. Filenames changed, so browsers fetch
  fresh copies on their own.
- Every panel uses one `.glass` rule. It falls back to a solid fill where
  `backdrop-filter` is unsupported and under `prefers-reduced-transparency`.
