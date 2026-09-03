# MetMeSS 2026 — registration set-up

Everything is built. Three things remain, and they take about 30 minutes.
No coding required — you are copying and pasting.

---

## Step 1 — Create the Google Sheet (2 min)

1. Go to <https://sheets.google.com> and sign in as **metmess2026@gmail.com**.
   *Use this account, not your personal one — whoever owns the Sheet receives the registrations.*
2. Create a blank spreadsheet. Name it **MetMeSS 2026 Registrations**.
3. Leave it open.

---

## Step 2 — Install the backend (10 min)

1. In that Sheet: **Extensions ▸ Apps Script**.
2. Delete whatever is in the editor.
3. Open `apps-script/Code.gs` from this repository, copy **all** of it, paste it in.
4. Click the **save** icon.
5. In the function dropdown at the top, select **`setupPromoCodes`** and click **Run**.
   - Google asks for permission the first time → *Review permissions* → choose the
     metmess2026 account → *Advanced* → *Go to (project name)* → *Allow*.
   - You should see: **50 promotional code(s) added.**
   - A new tab named **PromoCodes** now exists in your Sheet.
6. Click **Deploy ▸ New deployment**.
   - Click the gear next to *Select type* → **Web app**
   - Description: `MetMeSS registration`
   - **Execute as:** Me
   - **Who has access:** **Anyone**  ← this must be *Anyone*, not "Anyone with Google account"
   - **Deploy**, approve, then **copy the Web app URL**.
     It looks like `https://script.google.com/macros/s/AKfycb.../exec`

---

## Step 3 — Connect the website (5 min)

1. Open `register.html` in your GitHub repository (pencil icon to edit).
2. Press `Ctrl+F` and search for `PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE`.
3. Replace it — **keeping the quote marks** — with the URL you copied:

   ```js
   var SCRIPT_URL = 'https://script.google.com/macros/s/AKfycb.../exec';
   ```
4. **Commit changes**.
5. **Do exactly the same in `abstract.html`** — same search, same URL, commit.
   Both pages talk to the same backend.

---

## Test before announcing

**Registration.** Register yourself once, end to end. You should get a registration ID of
**KGP2000**, a confirmation email, a notification at metmess2026@gmail.com, and a new row
in the **Registrations** tab. Then test a promo code from the **PromoCodes** tab — the fee
should drop to zero and the payment step should disappear.

**Abstract.** Submit a dummy abstract with any DOCX and PDF. You should get **ABS001**, a
confirmation email *with both files attached*, a notification with the same attachments,
a new row in the **Abstracts** tab, and the files in a Drive folder called
**MetMeSS 2026 Abstracts**. Try it once with a registration ID and once without — without
one, the confirmation email should carry the amber "please remember to register" box.

Delete the test rows afterwards. IDs never reuse a number, so the next real submission
still gets KGP2001 and ABS002.

---

## Running it day to day

**Verifying payments.** Open the **Registrations** tab. Column W is the amount, column X
the UTR the participant typed. Check it against your UPI statement, then change column AA
from `Pending` to `Verified`. That column is yours to edit — nothing overwrites it.

**Promotional codes.** All 50 are in the **PromoCodes** tab and in
`apps-script/promo-codes.csv`. Each works exactly once. When someone uses one, columns D
and E fill in automatically with their email and the date. Use column B to record who you
gave each code to before you send it out — otherwise you will lose track.

**Adding more codes.** Type new ones straight into column A of the PromoCodes tab. Any
format works; the script only checks that the code exists and is unused.

**Abstract files.** Every upload lands in the Drive folder **MetMeSS 2026 Abstracts**,
named `ABS001_SurnameName.docx`. The Sheet's **Abstracts** tab has clickable links in
columns M and N, plus a **Registered?** column that tells you whether that person has
actually registered — watch it, since an abstract without a registration cannot go into
the programme. Columns P–R (*Review status*, *Decision*, *Notes*) are yours to edit;
nothing overwrites them.

**Speaker photos.** Drop a JPG into `assets/img/speakers/` named as listed in the
README.txt there, and it appears automatically. Until then the card shows initials.

**Changing the fees.** They appear in two places, and both must match:
`register.html` (the `FEES` block near the top of the script) and the fee table in
`index.html`.

**Closing registration.** Edit the announcement bar at the top of `index.html`, and
replace the "Register" buttons with a note. Nothing needs to be undeployed.

---

## Files

| File | What it is |
|---|---|
| `index.html` | Main site |
| `register.html` | Registration + payment — **needs the URL pasted in** |
| `abstract.html` | Abstract submission + file upload — **needs the URL pasted in** |
| `apps-script/Code.gs` | Backend: IDs, promo codes, emails |
| `apps-script/promo-codes.csv` | Your 50 codes, for your records |
| `assets/docs/MetMeSS2026_Flyer.pdf` | Flyer, linked from the site |
| `assets/docs/MetMeSS2026_Abstract_Template.docx` | Abstract template |
| `assets/img/upi-qr.png` | UPI QR code shown at payment |
| `index.html.bak` | The previous version, before this update |

---

## One thing to sort out

The UPI ID on the payment page is **kishantiwari.geo@ybl** — a personal account.
At the published fees, full attendance is roughly **₹9 lakh** landing in a PhD student's
personal account. That creates three problems:

1. It will appear as your personal income in your AIS / Form 26AS.
2. Your ANRF application books ₹5,00,000 of registration income against the
   **SRIC, IIT Kharagpur** account, and the Certificate from the Convenor promises ANRF
   an *audited* income–expenditure statement. Money that never entered an institute
   account cannot appear in one.
3. Refunds and institutional audit both become your personal problem.

Ask SRIC or CE&T for a conference collection account or payment link — you are already
in touch with CE&T about the endorsement, so add it to that thread. When they give you
one, swap the QR image and the UPI ID in `register.html` (search for `upiId`). Everything
else keeps working.
