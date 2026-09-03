/**
 * MetMeSS 2026 — registration backend
 * Deploy as: Web app · Execute as "Me" · Who has access "Anyone"
 * Full setup instructions in SETUP.md at the repository root.
 */

var SHEET_REG   = 'Registrations';
var SHEET_ABS   = 'Abstracts';
var DRIVE_FOLDER = 'MetMeSS 2026 Abstracts';
var ABS_PREFIX  = 'ABS';
var FIRST_ABS   = 1;
var SHEET_PROMO = 'PromoCodes';
var ID_PREFIX   = 'KGP';
var FIRST_ID    = 2000;
var ORGANISER_EMAIL = 'metmess2026@gmail.com';
var TEMPLATE_URL = 'https://metmess.github.io/assets/docs/MetMeSS2026_Abstract_Template.docx';
var SITE_URL     = 'https://metmess.github.io/';

var ABS_HEADERS = ['Timestamp','Abstract ID','Registration ID','Submitting author','Email',
  'Affiliation','Title','Authors','Theme','Preference','Keywords','Remarks',
  'DOCX link','PDF link','Registered?','Review status','Decision','Notes'];

var HEADERS = ['Timestamp','Registration ID','Name','Email','Phone','Gender','Affiliation',
  'Country','Academic status','Diet','Travel support','School interest','Field trip interest',
  'Presenting','Abstract title','Authors','Theme','Preference','Remarks',
  'Currency','Base fee','Promo code','Amount payable','UTR','Payment date','Paying account',
  'Payment verified','Notes'];

/* ------------------------------------------------------------------ */
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || '';
  if (action === 'promo') {
    var res = checkPromo_((e.parameter.code || '').toUpperCase().trim(), false);
    return json_(res);
  }
  return json_({ ok: true, message: 'MetMeSS 2026 registration endpoint is running.' });
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
    var d = JSON.parse(e.postData.contents);

    if (!d.name || !d.email) return json_({ ok:false, message:'Name and email are required.' });

    if (d.action === 'abstract') return handleAbstract_(d);

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sh = ensureSheet_(ss);

    // duplicate guard
    var emails = sh.getRange(2, 4, Math.max(sh.getLastRow()-1,1), 1).getValues();
    for (var i=0;i<emails.length;i++){
      if (String(emails[i][0]).toLowerCase().trim() === String(d.email).toLowerCase().trim()) {
        return json_({ ok:false, message:'This email is already registered. Write to '+ORGANISER_EMAIL+' if you need to change your details.' });
      }
    }

    // promo
    var promo = (d.promo||'').toUpperCase().trim();
    if (promo) {
      var chk = checkPromo_(promo, true, d.email);
      if (!chk.valid) return json_({ ok:false, message: chk.message });
      d.amountPayable = 0;
    }

    var regId = nextId_(sh);
    var authors = (d.authors||[]).map(function(a,i){
      return (i+1)+'. '+a.name+(a.affiliation?' ('+a.affiliation+')':'')+(a.presenting?' [presenting]':'');
    }).join('\n');

    sh.appendRow([new Date(), regId, d.name, d.email, d.phone, d.gender, d.affiliation,
      d.country, d.statusLabel, d.diet, d.travelSupport, d.school, d.fieldtrip,
      d.presenting, d.title, authors, d.theme, d.prefer, d.remarks,
      d.currency, d.baseFee, promo, d.amountPayable, d.utr, d.payDate, d.payName,
      d.amountPayable === 0 ? 'Waived (promo)' : 'Pending', '']);

    sendConfirmation_(d, regId);
    notifyOrganisers_(d, regId);
    return json_({ ok:true, regId: regId });

  } catch (err) {
    return json_({ ok:false, message:'Server error: '+err.message });
  } finally {
    try { lock.releaseLock(); } catch(e2){}
  }
}

/* ------------------------------------------------------------------ */
function ensureSheet_(ss) {
  var sh = ss.getSheetByName(SHEET_REG);
  if (!sh) { sh = ss.insertSheet(SHEET_REG); }
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADERS);
    sh.getRange(1,1,1,HEADERS.length).setFontWeight('bold').setBackground('#2A5567').setFontColor('#FFFFFF');
    sh.setFrozenRows(1);
  }
  return sh;
}

function nextId_(sh) {
  var last = sh.getLastRow();
  var max = FIRST_ID - 1;
  if (last > 1) {
    var vals = sh.getRange(2,2,last-1,1).getValues();
    for (var i=0;i<vals.length;i++){
      var m = String(vals[i][0]).match(/^KGP(\d+)$/);
      if (m) max = Math.max(max, parseInt(m[1],10));
    }
  }
  return ID_PREFIX + (max + 1);
}

/**
 * Validates a promo code. If consume is true, marks it used.
 * PromoCodes sheet: A=Code, B=Issued to, C=Issued on, D=Used by, E=Used on
 */
function checkPromo_(code, consume, email) {
  if (!code) return { valid:false, message:'Enter a code.' };
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_PROMO);
  if (!sh) return { valid:false, message:'Promotional codes are not configured.' };
  var last = sh.getLastRow();
  if (last < 2) return { valid:false, message:'No codes available.' };

  var vals = sh.getRange(2,1,last-1,5).getValues();
  for (var i=0;i<vals.length;i++) {
    if (String(vals[i][0]).toUpperCase().trim() === code) {
      if (String(vals[i][3]).trim()) return { valid:false, message:'This code has already been used.' };
      if (consume) {
        sh.getRange(i+2,4).setValue(email || 'used');
        sh.getRange(i+2,5).setValue(new Date());
      }
      return { valid:true };
    }
  }
  return { valid:false, message:'That code is not recognised.' };
}

/* ------------------------------------------------------------------ */
function sendConfirmation_(d, regId) {
  var paid = d.amountPayable === 0;
  var amount = d.currency === 'INR' ? ('INR ' + d.baseFee) : ('USD ' + d.baseFee);
  var body =
    '<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#222;line-height:1.6">' +
    '<p>Dear ' + esc_(d.name) + ',</p>' +
    '<p>Thank you for registering for <b>MetMeSS 2026</b> — the 6th Symposium on Meteoroids, Meteors &amp; Meteorites: Messengers from Space, to be held at IIT Kharagpur on <b>26&ndash;27 October 2026</b>.</p>' +
    '<p style="font-size:16px">Your registration ID is <b style="font-size:20px;color:#2A5567">' + regId + '</b></p>' +
    '<table cellpadding="6" style="border-collapse:collapse;font-size:13px;margin:14px 0">' +
      row_('Name', d.name) + row_('Affiliation', d.affiliation) +
      row_('Category', d.statusLabel) +
      row_('Fee', paid ? (amount + ' — waived by promotional code ' + esc_(d.promo)) : amount) +
      (paid ? '' : row_('Payment reference', d.utr || '—')) +
      (d.title ? row_('Abstract title', d.title) : '') +
      (d.theme ? row_('Theme', d.theme) : '') +
    '</table>' +
    (paid
      ? '<p><b>No payment is due.</b> Your registration is confirmed.</p>'
      : '<p>We will verify your payment against the reference you provided and confirm your registration within three working days. Please keep your payment receipt.</p>') +
    (d.presenting === 'Yes'
      ? '<p><b>Next step — send us your abstract.</b><br>Prepare a one-page abstract using the official template and email the DOCX and a PDF to ' + ORGANISER_EMAIL + ', with <b>' + regId + '</b> in the subject line. Deadline: <b>30 September 2026</b>.<br>Template: <a href="' + TEMPLATE_URL + '">MetMeSS 2026 abstract template (DOCX)</a></p>'
      : '<p>You are registered as a non-presenting participant. If you decide to present, write to us before 30 September 2026.</p>') +
    '<p>Symposium website: <a href="' + SITE_URL + '">' + SITE_URL + '</a></p>' +
    '<p>Warm regards,<br><b>Organising Committee, MetMeSS 2026</b><br>' +
    'Department of Geology &amp; Geophysics, IIT Kharagpur<br>' + ORGANISER_EMAIL + '</p></div>';

  MailApp.sendEmail({
    to: d.email, replyTo: ORGANISER_EMAIL,
    subject: 'MetMeSS 2026 — registration received (' + regId + ')',
    htmlBody: body
  });
}

function notifyOrganisers_(d, regId) {
  MailApp.sendEmail({
    to: ORGANISER_EMAIL,
    subject: 'New registration: ' + regId + ' — ' + d.name,
    htmlBody: '<div style="font-family:Arial,sans-serif;font-size:13px">' +
      '<p><b>' + regId + '</b> · ' + esc_(d.name) + ' · ' + esc_(d.affiliation) + '</p>' +
      '<table cellpadding="5" style="border-collapse:collapse">' +
        row_('Email', d.email) + row_('Phone', d.phone) +
        row_('Category', d.statusLabel) + row_('Country', d.country) +
        row_('Amount payable', d.amountPayable === 0 ? '0 (promo ' + esc_(d.promo) + ')' : d.currency + ' ' + d.amountPayable) +
        row_('UTR', d.utr || '—') + row_('Paid on', d.payDate || '—') +
        row_('Presenting', d.presenting) + row_('Abstract', d.title || '—') +
        row_('Travel support', d.travelSupport) +
        row_('School', d.school) + row_('Field trip', d.fieldtrip) +
      '</table></div>'
  });
}

function row_(k, v) {
  return '<tr><td style="border:1px solid #ddd;background:#f5f7f9"><b>' + k + '</b></td>' +
         '<td style="border:1px solid #ddd">' + esc_(v || '—') + '</td></tr>';
}
function esc_(t) {
  return String(t == null ? '' : t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

/* ================================================================== *
 *  ABSTRACT SUBMISSION
 * ================================================================== */
function handleAbstract_(d) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_ABS);
  if (!sh) {
    sh = ss.insertSheet(SHEET_ABS);
    sh.appendRow(ABS_HEADERS);
    sh.getRange(1,1,1,ABS_HEADERS.length).setFontWeight('bold').setBackground('#C08A2C').setFontColor('#FFFFFF');
    sh.setFrozenRows(1);
  }

  var absId = nextAbsId_(sh);

  // save files to Drive
  var folder = getFolder_();
  var links = { docx:'', pdf:'' };
  var blobs = [];
  (d.files || []).forEach(function(f) {
    var ext = f.name.split('.').pop().toLowerCase();
    var safe = absId + '_' + String(d.name).replace(/[^A-Za-z0-9]+/g,'') + '.' + ext;
    var blob = Utilities.newBlob(Utilities.base64Decode(f.data), f.mimeType, safe);
    blobs.push(blob);
    var file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    if (ext === 'pdf') links.pdf = file.getUrl(); else links.docx = file.getUrl();
  });

  // is this person registered?
  var regState = 'Not registered';
  if (d.regId) {
    regState = lookupReg_(d.regId, d.email);
  } else {
    var byEmail = lookupRegByEmail_(d.email);
    if (byEmail) regState = 'Registered as ' + byEmail;
  }

  var authors = (d.authors || []).map(function(a,i){
    return (i+1) + '. ' + a.name + (a.affiliation ? ' (' + a.affiliation + ')' : '') + (a.presenting ? ' [presenting]' : '');
  }).join('\n');

  sh.appendRow([new Date(), absId, d.regId || '', d.name, d.email, d.affiliation,
    d.title, authors, d.theme, d.prefer, d.keywords, d.remarks,
    links.docx, links.pdf, regState, 'Received', '', '']);

  sendAbstractConfirmation_(d, absId, blobs);
  notifyAbstract_(d, absId, links, regState, blobs);
  return json_({ ok:true, absId: absId });
}

function nextAbsId_(sh) {
  var last = sh.getLastRow(), max = FIRST_ABS - 1;
  if (last > 1) {
    var vals = sh.getRange(2,2,last-1,1).getValues();
    for (var i=0;i<vals.length;i++){
      var m = String(vals[i][0]).match(/^ABS(\d+)$/);
      if (m) max = Math.max(max, parseInt(m[1],10));
    }
  }
  return ABS_PREFIX + ('00' + (max + 1)).slice(-3);
}

function getFolder_() {
  var it = DriveApp.getFoldersByName(DRIVE_FOLDER);
  return it.hasNext() ? it.next() : DriveApp.createFolder(DRIVE_FOLDER);
}

function lookupReg_(regId, email) {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_REG);
  if (!sh || sh.getLastRow() < 2) return 'ID not found';
  var vals = sh.getRange(2,2,sh.getLastRow()-1,3).getValues(); // B=ID, C=Name, D=Email
  for (var i=0;i<vals.length;i++){
    if (String(vals[i][0]).toUpperCase().trim() === String(regId).toUpperCase().trim()) {
      return String(vals[i][2]).toLowerCase().trim() === String(email).toLowerCase().trim()
        ? 'Registered' : 'ID found, different email';
    }
  }
  return 'ID not found';
}

function lookupRegByEmail_(email) {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_REG);
  if (!sh || sh.getLastRow() < 2) return '';
  var vals = sh.getRange(2,2,sh.getLastRow()-1,3).getValues();
  for (var i=0;i<vals.length;i++){
    if (String(vals[i][2]).toLowerCase().trim() === String(email).toLowerCase().trim()) return vals[i][0];
  }
  return '';
}

function sendAbstractConfirmation_(d, absId, blobs) {
  var body =
    '<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#222;line-height:1.6">' +
    '<p>Dear ' + esc_(d.name) + ',</p>' +
    '<p>We have received your abstract for <b>MetMeSS 2026</b>, IIT Kharagpur, 26&ndash;27 October 2026. ' +
    'Your files are attached to this email for your records.</p>' +
    '<p style="font-size:16px">Abstract ID: <b style="font-size:20px;color:#C08A2C">' + absId + '</b></p>' +
    '<table cellpadding="6" style="border-collapse:collapse;font-size:13px;margin:14px 0">' +
      row_('Title', d.title) + row_('Theme', d.theme) + row_('Preference', d.prefer) +
      row_('Registration ID', d.regId || 'not provided') +
    '</table>' +
    (d.regId
      ? '<p>Your abstract is linked to registration <b>' + esc_(d.regId) + '</b>.</p>'
      : '<p style="background:#fff6e0;border-left:3px solid #C08A2C;padding:10px 13px"><b>Please remember to register.</b> ' +
        'Submitting an abstract does not register you for the symposium. Your abstract can only be included in the ' +
        'programme once registration and payment are complete &mdash; deadline <b>30 September 2026</b>.<br>' +
        '<a href="' + SITE_URL + 'register.html">Register here</a></p>') +
    '<p>The programme committee will review all abstracts and notify authors by <b>15 October 2026</b>.</p>' +
    '<p>Warm regards,<br><b>Organising Committee, MetMeSS 2026</b><br>' +
    'Department of Geology &amp; Geophysics, IIT Kharagpur<br>' + ORGANISER_EMAIL + '</p></div>';

  MailApp.sendEmail({
    to: d.email, replyTo: ORGANISER_EMAIL,
    subject: 'MetMeSS 2026 — abstract received (' + absId + ')',
    htmlBody: body, attachments: blobs
  });
}

function notifyAbstract_(d, absId, links, regState, blobs) {
  MailApp.sendEmail({
    to: ORGANISER_EMAIL,
    subject: 'New abstract: ' + absId + ' — ' + d.title,
    htmlBody: '<div style="font-family:Arial,sans-serif;font-size:13px">' +
      '<p><b>' + absId + '</b> · ' + esc_(d.name) + '</p>' +
      '<table cellpadding="5" style="border-collapse:collapse">' +
        row_('Title', d.title) + row_('Theme', d.theme) + row_('Preference', d.prefer) +
        row_('Email', d.email) + row_('Affiliation', d.affiliation) +
        row_('Registration', d.regId ? d.regId + ' (' + regState + ')' : regState) +
        row_('Keywords', d.keywords) + row_('Remarks', d.remarks) +
      '</table>' +
      '<p>DOCX: <a href="' + links.docx + '">open</a> &nbsp;·&nbsp; PDF: <a href="' + links.pdf + '">open</a></p>' +
      '</div>',
    attachments: blobs
  });
}

/* ------------------------------------------------------------------ *
 * Run ONCE from the editor to create the PromoCodes sheet and load
 * the 50 codes. Safe to re-run: it will not duplicate existing codes.
 * ------------------------------------------------------------------ */
function setupPromoCodes() {
  var CODES = [
    'MTMS26-226FM',
    'MTMS26-2X8L2',
    'MTMS26-47NZ5',
    'MTMS26-4QNLT',
    'MTMS26-54Y82',
    'MTMS26-56FJW',
    'MTMS26-5WV8Z',
    'MTMS26-6RNSF',
    'MTMS26-7S6ZN',
    'MTMS26-7XNDK',
    'MTMS26-8NMEN',
    'MTMS26-8U4GF',
    'MTMS26-9CPF6',
    'MTMS26-APGBG',
    'MTMS26-D53H3',
    'MTMS26-DRPCE',
    'MTMS26-EX9R9',
    'MTMS26-FA3YX',
    'MTMS26-HQJ93',
    'MTMS26-J3LDT',
    'MTMS26-K7QXA',
    'MTMS26-M4BHD',
    'MTMS26-P2Y4K',
    'MTMS26-P9J24',
    'MTMS26-PKQ8R',
    'MTMS26-PXUJB',
    'MTMS26-R3BKY',
    'MTMS26-R6TGR',
    'MTMS26-T8G6W',
    'MTMS26-TDADH',
    'MTMS26-TGYGS',
    'MTMS26-U7F4F',
    'MTMS26-UAVWF',
    'MTMS26-UEXZK',
    'MTMS26-UW95M',
    'MTMS26-VAQE6',
    'MTMS26-VH86J',
    'MTMS26-VLYX3',
    'MTMS26-VP35W',
    'MTMS26-W5WTP',
    'MTMS26-WADK5',
    'MTMS26-WKV7F',
    'MTMS26-X6KEE',
    'MTMS26-XEC8Z',
    'MTMS26-XNT9X',
    'MTMS26-YJJX4',
    'MTMS26-YM6Y3',
    'MTMS26-YNVVS',
    'MTMS26-ZDPZ9',
    'MTMS26-ZV265'
  ];
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_PROMO) || ss.insertSheet(SHEET_PROMO);
  if (sh.getLastRow() === 0) {
    sh.appendRow(['Code','Issued to','Issued on','Used by','Used on']);
    sh.getRange(1,1,1,5).setFontWeight('bold').setBackground('#2A5567').setFontColor('#FFFFFF');
    sh.setFrozenRows(1);
  }
  var existing = sh.getLastRow() > 1
    ? sh.getRange(2,1,sh.getLastRow()-1,1).getValues().map(function(r){return String(r[0]).trim();})
    : [];
  var added = 0;
  CODES.forEach(function(c){
    if (existing.indexOf(c) === -1) { sh.appendRow([c,'','','','']); added++; }
  });
  sh.autoResizeColumns(1,5);
  SpreadsheetApp.getUi().alert(added + ' promotional code(s) added. Total: ' + (sh.getLastRow()-1));
}
