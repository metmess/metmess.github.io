# Publishing and editing the MetMeSS website

Everything here assumes you never touch a terminal. GitHub's website does all of it.

---

## Part 1 — Pick the address

### First choice: IIT KGP subdomain

`metmess2026.iitkgp.ac.in` — free, permanent, and a `.ac.in` address reassures international participants that the conference is real. Email the Computer & Informatics Centre with the convenors copied in. If they say yes, skip to Part 3.

Ask them for a **static HTML hosting slot**. You don't need PHP, a database, or a CMS.

### Fallback: GitHub Pages

Free, live in about ten minutes, no approval needed. The trick to a short address is naming things well.

| What you create | Resulting address | Verdict |
|---|---|---|
| Personal account, repo `metmess2026` | `kishantiwari.github.io/metmess2026` | Long, and tied to your personal account |
| **Organisation `metmess`, repo `metmess.github.io`** | **`metmess.github.io`** | **Recommended** |
| Organisation `metmess`, repo `2026` | `metmess.github.io/2026` | Fine, slightly longer |

**Recommended: `metmess.github.io`.**

Short, obviously the conference, and it survives past 2026 — the 2028 organisers inherit the same address instead of starting over. Put the current edition at the root and archive past editions in folders (`metmess.github.io/2024`, `/2026`).

Also: an organisation, not your personal account. When you move on, ownership transfers to the next organiser without handing over your personal GitHub login.

I can't check from here whether the name `metmess` is taken. If it is, try in order: `metmess-conf`, `metmess-india`, `metmess-symposium`.

### If you want a real domain later

`metmess.in` costs roughly ₹800–1,200 a year from a registrar like BigRock or GoDaddy. You can point it at GitHub Pages at any time — nothing about the site changes. Worth doing only if someone commits to renewing it every year; an expired conference domain is worse than none.

---

## Part 2 — Publishing on GitHub Pages

**Step 1 — Make an account.** github.com → Sign up. Free.

**Step 2 — Make the organisation.** Top-right `+` → New organization → Free plan → name it `metmess`.

**Step 3 — Make the repository.** Inside the org: New repository.
- Name: `metmess.github.io` (exactly this — the name is what creates the short address)
- Public
- Tick "Add a README file"
- Create repository

**Step 4 — Upload the site.** In the repo: `Add file` → `Upload files`. Drag in **the contents** of the `metmess2026-site` folder — that is, `index.html` and the `assets` folder themselves, not the folder that contains them. `index.html` has to sit at the top level. Scroll down, click `Commit changes`.

**Step 5 — Turn on Pages.** `Settings` tab → `Pages` in the left sidebar → under Source pick `Deploy from a branch` → Branch `main`, folder `/ (root)` → Save.

**Step 6 — Wait.** Two to five minutes the first time. Refresh the Pages settings screen; it'll show the live URL. HTTPS is automatic.

### Attaching a custom domain later

Buy the domain, then in `Settings` → `Pages` → Custom domain, type it and save. At your registrar, add a CNAME record pointing to `metmess.github.io`. Tick "Enforce HTTPS" once the certificate is issued (usually within an hour).

---

## Part 3 — Editing after it's live

### Small text changes — the quickest way

1. Open the repo, click `index.html`
2. Click the pencil icon (top right of the file)
3. Use `Ctrl+F` to find what you want to change
4. Edit it
5. Scroll to the bottom → `Commit changes`

Live in under a minute. If you break something, `Commit changes` → previous version is always recoverable under the `History` tab.

### Where things live in index.html

Each section is marked with a comment like `<!-- ============ THEMES ============ -->`. Search for these:

| To change | Search for |
|---|---|
| Dates, venue, hero text | `============ HERO` |
| About paragraphs | `============ ABOUT` |
| Session topics | `============ THEMES` |
| Deadlines table | `============ DATES` |
| Speaker cards | `============ SPEAKERS` |
| Day-by-day schedule | `============ PROGRAMME` |
| Fees, form links | `============ REGISTRATION` |
| Travel, hotels | `============ VENUE` |
| Committee names | `============ COMMITTEE` |
| Email, phone | `============ CONTACT` |

### The placeholder links

Search `data-todo`. Each one looks like:

```html
<a class="btn btn-p" href="#" data-todo>Registration form</a>
```

Replace `#` with the real URL and **delete `data-todo`**:

```html
<a class="btn btn-p" href="https://forms.gle/xxxxx">Registration form</a>
```

Leaving `data-todo` in place makes the link show a "not set yet" warning instead of opening.

### Adding an image or PDF

In the repo, open `assets` → `img` → `Add file` → `Upload files`. Then reference it as `assets/img/yourfile.jpg`.

For PDFs (flyer, abstract template, payment instructions), make a folder: `Add file` → `Create new file` → type `assets/docs/flyer.pdf` — typing a `/` creates the folder. Easier: upload into `assets/img/` and don't worry about tidiness.

### Adding a speaker

Find the `============ SPEAKERS` section. Replace one placeholder block with:

```html
<div class="person">
  <img class="ph" src="assets/img/speakers/surname.jpg" alt="Prof. Name" style="object-fit:cover;border-radius:50%">
  <h3><a href="https://their-profile-page">Prof. Name</a></h3>
  <p>Institution, Country</p>
</div>
```

Square photos, around 600×600 px. Add more `<div class="person">` blocks as the list grows — the grid rewraps on its own.

### Changing colours

At the very top of the `<style>` block:

```css
--cyan:#57c8e0;   /* links, numbers, active tab */
--gold:#e3b14a;   /* buttons, section rules, eyebrow text */
```

Change those two hex values and the whole site follows.

### The countdown

Near the bottom, in the script:

```js
var target=new Date('2026-10-25T09:00:00+05:30').getTime();
```

Edit if the start time shifts.

---

## Part 4 — Before you announce it

- [ ] Confirm `metmess2026@iitkgp.ac.in` actually exists (it's currently a guess, and it appears in three places)
- [ ] Add the phone number — currently `+91 —`
- [ ] Create the Google Forms for abstracts and registration, link them, remove `data-todo`
- [ ] Fill the fees table (every row says TBA)
- [ ] Set the abstract deadline
- [ ] Upload the flyer PDF and link it from the About section
- [ ] Open it on a phone and scroll the whole thing
- [ ] Paste the URL into WhatsApp and check the preview card looks right

---

## Handing over to the next organiser

Everything the site needs is in this one folder — no accounts beyond GitHub, no hosting bill, no CMS login, no expiring licence. Add them as an owner of the `metmess` organisation and they have full control. Copy the site into a `2026/` folder before building the next edition, so the archive stays live.
