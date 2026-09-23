/**
 * MetMeSS 2026, abstract submission backend
 *
 * Handles abstract submissions only. Registration is done through the
 * institute's own payment/registration link and is NOT processed here.
 *
 * Deploy as: Web app · Execute as "Me" · Who has access "Anyone"
 * After ANY edit: Deploy → Manage deployments → pencil → New version → Deploy.
 * Saving alone does not change what the /exec URL serves.
 */

var SHEET_ABS    = 'Abstracts';
var DRIVE_FOLDER = 'MetMeSS 2026 Abstracts';
var ABS_PREFIX   = 'ABS';
var FIRST_ABS    = 1;
var ORGANISER_EMAIL = 'metmess2026@gmail.com';
var SITE_URL     = 'https://metmess.github.io/';

var ABS_HEADERS = ['Timestamp','Abstract ID','Registration ID','Submitting author','Email',
  'Affiliation','Title','Authors','Theme','Preference','Keywords','Remarks',
  'DOCX link','PDF link','Review status','Decision','Notes'];

/* ------------------------------------------------------------------ */
function doGet(e) {
  return json_({ ok: true, message: 'MetMeSS 2026 abstract endpoint is running.' });
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
    var d = JSON.parse(e.postData.contents);

    // Spam trap. The form carries a hidden field named "website" that no human
    // sees. Anything that fills it in is a bot, including one posting straight
    // at this endpoint.
    if (d.website) return json_({ ok:false, message:'Submission rejected.' });

    if (!d.name || !d.email) return json_({ ok:false, message:'Name and email are required.' });

    if (d.action !== 'abstract') {
      return json_({ ok:false, message:'This endpoint accepts abstract submissions only. ' +
        'Registration is handled through the institute link on ' + SITE_URL });
    }

    return handleAbstract_(d);

  } catch (err) {
    return json_({ ok:false, message:'Server error: ' + err.message });
  } finally {
    try { lock.releaseLock(); } catch (e2) {}
  }
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

  var authors = (d.authors || []).map(function(a,i){
    return (i+1) + '. ' + a.name + (a.affiliation ? ' (' + a.affiliation + ')' : '') + (a.presenting ? ' [presenting]' : '');
  }).join('\n');

  sh.appendRow([new Date(), absId, d.regId || '', d.name, d.email, d.affiliation,
    d.title, authors, d.theme, d.prefer, d.keywords, d.remarks,
    links.docx, links.pdf, 'Received', '', '']);

  sendAbstractConfirmation_(d, absId, blobs);
  notifyAbstract_(d, absId, links, blobs, authors);
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

/* ------------------------------------------------------------------ *
 *  EMAILS
 * ------------------------------------------------------------------ */
function sendAbstractConfirmation_(d, absId, blobs) {
  var body =
    '<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#222;line-height:1.6">' +
    '<p>Dear ' + esc_(d.name) + ',</p>' +
    '<p>We have received your abstract for <b>MetMeSS 2026</b>, IIT Kharagpur, 26&ndash;27 October 2026.</p>' +
    '<p style="font-size:16px">Abstract ID: <b style="font-size:20px;color:#C08A2C">' + absId + '</b></p>' +
    '<table cellpadding="6" style="border-collapse:collapse;font-size:13px;margin:14px 0">' +
      row_('Title', d.title) + row_('Theme', d.theme) + row_('Preference', d.prefer) +
    '</table>' +
    '<p style="background:#fff6e0;border-left:3px solid #C08A2C;padding:10px 13px">' +
    '<b>Registration is separate.</b> Submitting an abstract does not register you for the ' +
    'symposium. Registration is handled through the institute, and the link is published on ' +
    'the symposium website. Your abstract can only enter the programme once you are registered.<br>' +
    '<a href="' + SITE_URL + '">' + SITE_URL + '</a></p>' +
    '<p>The programme committee reviews abstracts on a rolling basis. Notifications begin on <b>15 October 2026</b> and continue over the following few days.</p>' +
    '<p>Quote your Abstract ID in any correspondence about this submission.</p>' +
    '<p>Warm regards,<br><b>Organising Committee, MetMeSS 2026</b><br>' +
    'Department of Geology &amp; Geophysics, IIT Kharagpur<br>' + ORGANISER_EMAIL + '</p></div>';

  MailApp.sendEmail({
    to: d.email, replyTo: ORGANISER_EMAIL,
    subject: 'MetMeSS 2026, abstract received (' + absId + ')',
    htmlBody: body
  });
}

function notifyAbstract_(d, absId, links, blobs, authors) {
  MailApp.sendEmail({
    to: ORGANISER_EMAIL,
    subject: 'New abstract: ' + absId + ', ' + d.title,
    htmlBody: '<div style="font-family:Arial,sans-serif;font-size:13px">' +
      '<p><b>' + absId + '</b> · ' + esc_(d.name) + '</p>' +
      '<table cellpadding="5" style="border-collapse:collapse">' +
        row_('Title', d.title) + row_('Theme', d.theme) + row_('Preference', d.prefer) +
        row_('Email', d.email) + row_('Affiliation', d.affiliation) +
        row_('Authors', String(authors || '').replace(/\n/g, '<br>')) +
        row_('Registration ID', d.regId || 'not provided') +
        row_('Keywords', d.keywords) + row_('Remarks', d.remarks) +
      '</table>' +
      '<p>DOCX: <a href="' + links.docx + '">open</a> &nbsp;·&nbsp; PDF: <a href="' + links.pdf + '">open</a></p>' +
      '</div>',
    attachments: blobs
  });
}

/* ------------------------------------------------------------------ */
function row_(k, v) {
  return '<tr><td style="border-bottom:1px solid #eee;color:#666">' + k +
         '</td><td style="border-bottom:1px solid #eee"><b>' + esc_(v || '-') + '</b></td></tr>';
}

function esc_(t) {
  return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o))
    .setMimeType(ContentService.MimeType.JSON);
}
