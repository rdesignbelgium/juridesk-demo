/* Juridesk — démo statique. Données fictives, aucun conseil juridique. */
(function () {
  'use strict';

  // ---------- Données de départ ----------
  const SEED = [
    {
      id: 'REC-2026-0147', titre: 'Lambert c/ SRL Nova Tech', type: 'Recouvrement de factures', etape: 'Mise en demeure envoyée',
      client: { nom: 'Lambert Électricité SRL', bce: '0712.345.678', adresse: 'Rue des Ateliers 12, 6000 Charleroi', role: 'CLIENT · CRÉANCIER' },
      adverse: { nom: 'Nova Tech SRL', bce: '0698.112.334', adresse: 'Avenue Louise 240, 1050 Bruxelles', role: 'PARTIE ADVERSE · DÉBITEUR' },
      regime: 'b2b', echeance: '2026-11-03', prescription: '10 ans · 14/03/2035',
      factures: [
        { num: '2026-031', echeance: '2026-03-14', montant: 4200 },
        { num: '2026-032', echeance: '2026-04-30', montant: 3150 },
        { num: '2026-033', echeance: '2026-05-31', montant: 2980 },
        { num: '2026-034', echeance: '2026-06-30', montant: 2150 }
      ],
      pieces: [
        { label: 'Factures n° 2026-031 à 2026-034 (4)', tag: 'PDF', dot: '' },
        { label: 'Conditions générales signées — 02/2026', tag: 'PDF', dot: '' },
        { label: 'Mise en demeure — recommandé électronique', tag: 'SIGNÉ', dot: 'warn' }
      ],
      timeline: [
        { date: '14/03/2026', label: 'Première facture échue', state: 'past' },
        { date: '02/10/2026', label: 'Rappel amiable envoyé par e-mail', state: 'past' },
        { date: '19/10/2026', label: 'Mise en demeure signée (itsme) et envoyée en recommandé électronique', state: 'past' },
        { date: '03/11/2026 · À VENIR', label: 'Expiration du délai de paiement de 15 jours', state: 'future' },
        { date: 'ENSUITE', label: 'Citation devant le tribunal de l\'entreprise ou procédure de recouvrement B2B', state: 'later' }
      ],
      assistant: 'Le délai de 15 jours expire le 03/11. Souhaitez-vous préparer dès maintenant le décompte de créance et le projet de citation ?'
    },
    {
      id: 'CTR-2026-0092', titre: 'Studio Nord — Contrat de prestation', type: 'Contrat B2B', etape: 'Relecture client',
      client: { nom: 'Studio Nord SRL', bce: '0745.221.908', adresse: 'Rue Royale 88, 1000 Bruxelles', role: 'CLIENT · PRESTATAIRE' },
      adverse: { nom: 'Maison Verhaegen SA', bce: '0401.556.772', adresse: 'Lange Leemstraat 5, 2018 Antwerpen', role: 'COCONTRACTANT' },
      regime: 'b2b', echeance: '2026-10-28', prescription: '—',
      factures: [],
      pieces: [{ label: 'Projet de contrat v4', tag: 'DOCX', dot: '' }, { label: 'Offre acceptée du 30/09/2026', tag: 'PDF', dot: '' }],
      timeline: [
        { date: '30/09/2026', label: 'Offre acceptée par e-mail', state: 'past' },
        { date: '12/10/2026', label: 'Projet v4 envoyé pour relecture', state: 'past' },
        { date: '28/10/2026 · À VENIR', label: 'Retour attendu du cocontractant', state: 'future' }
      ],
      assistant: 'La clause de limitation de responsabilité (art. 9) n\'a pas de plafond chiffré. Voulez-vous insérer la clause standard « plafond = honoraires de l\'année écoulée » ?'
    },
    {
      id: 'MED-2026-0211', titre: 'Dubois c/ Appartement Ixelles', type: 'Mise en demeure (bail)', etape: 'Brouillon',
      client: { nom: 'M. Pierre Dubois', bce: '—', adresse: 'Chaussée de Wavre 310, 1050 Ixelles', role: 'CLIENT · LOCATAIRE' },
      adverse: { nom: 'Immo Capitale SRL', bce: '0699.330.118', adresse: 'Rue du Bailli 40, 1050 Ixelles', role: 'PARTIE ADVERSE · BAILLEUR' },
      regime: 'b2c', echeance: '—', prescription: '—',
      factures: [],
      pieces: [{ label: 'Contrat de bail du 01/02/2024', tag: 'PDF', dot: '' }, { label: 'Photos dégâts des eaux (12)', tag: 'JPG', dot: '' }],
      timeline: [{ date: '15/10/2026', label: 'Ouverture du dossier', state: 'past' }],
      assistant: 'Bail de résidence principale en Région bruxelloise : le régime régional s\'applique. Je peux préparer la mise en demeure d\'effectuer les réparations locatives.'
    }
  ];

  const MODELES = [
    { id: 'med', nom: 'Mise en demeure — factures impayées', famille: 'Recouvrement', cible: 'B2B / B2C' },
    { id: 'cgv', nom: 'Conditions générales de vente', famille: 'Contrats', cible: 'B2B / B2C' },
    { id: 'presta', nom: 'Contrat de prestation de services', famille: 'Contrats', cible: 'B2B' },
    { id: 'nda', nom: 'Accord de confidentialité (NDA)', famille: 'Contrats', cible: 'B2B' },
    { id: 'bail', nom: 'Mise en demeure — obligations du bailleur', famille: 'Bail', cible: 'B2C' },
    { id: 'transac', nom: 'Transaction amiable', famille: 'Recouvrement', cible: 'B2B / B2C' }
  ];

  // ---------- Persistance ----------
  const KEY = 'juridesk-demo-v2';
  function load() {
    try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && Array.isArray(s.dossiers) && s.dossiers.length) return s; } catch (e) { /* ignore */ }
    return { dossiers: JSON.parse(JSON.stringify(SEED)) };
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify({ dossiers: DOSSIERS })); } catch (e) { /* ignore */ } }
  const store = load();
  const DOSSIERS = store.dossiers;

  // ---------- Utilitaires ----------
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const view = $('#view');
  const eur = n => (Math.round(n * 100) / 100).toLocaleString('fr-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const fr = iso => { if (!iso || iso === '—') return '—'; const [y, m, d] = iso.split('-'); return `${d}/${m}/${y}`; };
  const addDays = (iso, n) => { const d = new Date(iso); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
  const addMonths = (iso, n) => { const d = new Date(iso); d.setMonth(d.getMonth() + n); return d.toISOString().slice(0, 10); };
  const addYears = (iso, n) => addMonths(iso, n * 12);
  const daysBetween = (a, b) => Math.max(0, Math.round((new Date(b) - new Date(a)) / 86400000));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const today = new Date().toISOString().slice(0, 10);
  const longDate = iso => new Date(iso).toLocaleDateString('fr-BE', { day: 'numeric', month: 'long', year: 'numeric' });
  const nextId = prefix => { const n = DOSSIERS.filter(d => d.id.startsWith(prefix)).length + 1 + Math.floor(Math.random() * 400); return `${prefix}-2026-${String(n).padStart(4, '0')}`; };

  const state = {
    dossier: DOSSIERS[0].id,
    atelier: {
      step: 1, modele: 'med', lang: 'fr', delai: 15, interets: true, indemnite: true, penale: true, plan: false,
      signataire: 'Me Claire Demo', barreau: 'Charleroi', cabinet: 'Cabinet Demo & Associés', adresseCab: 'Boulevard Tirou 15, 6000 Charleroi',
      p: { objet: 'conception et développement d\'un site web et de ses supports de communication', honoraires: 4500, duree: 12, paiement: 30, penaliteCgv: 10, delaiCgv: 30, retractation: true, nda_duree: 3, nda_objet: 'un projet de collaboration commerciale', bail_travaux: 'la réparation de la fuite d\'eau dans la salle de bain et la remise en état du plafond', bail_delai: 15, trans_montant: 9000, trans_echeances: 3 }
    },
    calc: { tab: 'interets', regime: 'b2b', taux: 12, arrete: today, indemnite: true, penale: true, penaleTaux: 10, frais: false,
      delai: { depart: today, type: 'prescription10' },
      index: { loyer: 850, base: 128.50, nouveau: 131.20 },
      enreg: { region: 'wal', prix: 285000, habitation: true },
      succ: { region: 'bxl', montant: 250000 } }
  };

  const currentDossier = () => DOSSIERS.find(d => d.id === state.dossier) || DOSSIERS[0];

  // ---------- Calcul créance ----------
  function calcul(d, c) {
    const lignes = d.factures.map(f => {
      const jours = daysBetween(f.echeance, c.arrete);
      const interets = f.montant * (c.taux / 100) * jours / 365;
      const indem = c.indemnite ? 40 : 0;
      return { ...f, jours, interets, indem };
    });
    const principal = lignes.reduce((s, l) => s + l.montant, 0);
    const interets = lignes.reduce((s, l) => s + l.interets, 0);
    const indem = lignes.reduce((s, l) => s + l.indem, 0);
    const penale = c.penale ? principal * c.penaleTaux / 100 : 0;
    const frais = c.frais ? 250 : 0;
    return { lignes, principal, interets, indem, penale, frais, total: principal + interets + indem + penale + frais };
  }

  // ---------- Barèmes de démonstration (à vérifier avant tout usage réel) ----------
  const DELAIS = {
    paiement8: { label: 'Délai de paiement — 8 jours', fn: d => addDays(d, 8) },
    paiement15: { label: 'Délai de paiement — 15 jours', fn: d => addDays(d, 15) },
    paiement30: { label: 'Délai de paiement — 30 jours', fn: d => addDays(d, 30) },
    retract14: { label: 'Rétractation consommateur — 14 jours', fn: d => addDays(d, 14) },
    appel1m: { label: 'Appel — 1 mois à dater de la signification', fn: d => addMonths(d, 1) },
    opposition1m: { label: 'Opposition — 1 mois à dater de la signification', fn: d => addMonths(d, 1) },
    cassation3m: { label: 'Pourvoi en cassation — 3 mois', fn: d => addMonths(d, 3) },
    prescription1: { label: 'Prescription — 1 an (action en garantie, consommateur)', fn: d => addYears(d, 1) },
    prescription5: { label: 'Prescription — 5 ans (créances périodiques, responsabilité extracontractuelle)', fn: d => addYears(d, 5) },
    prescription10: { label: 'Prescription — 10 ans (actions personnelles de droit commun)', fn: d => addYears(d, 10) },
    prescription30: { label: 'Prescription — 30 ans (actions réelles)', fn: d => addYears(d, 30) }
  };
  const ENREG = {
    wal: { nom: 'Wallonie', normal: 12.5, reduit: 3, note: 'Taux réduit de 3 % pour l\'habitation propre et unique (réforme 2025), 12,5 % sinon.' },
    bxl: { nom: 'Bruxelles-Capitale', normal: 12.5, reduit: 12.5, abattement: 200000, note: 'Abattement de 200 000 € sur la base imposable pour l\'habitation propre et unique (prix ≤ 600 000 €).' },
    vla: { nom: 'Flandre', normal: 12, reduit: 2, note: 'Taux de 2 % pour l\'habitation propre et unique, 12 % sinon.' }
  };
  const SUCC = {
    wal: { nom: 'Wallonie', tranches: [[12500, 3], [25000, 4], [50000, 5], [100000, 7], [150000, 10], [200000, 14], [250000, 18], [500000, 24], [Infinity, 30]] },
    bxl: { nom: 'Bruxelles-Capitale', tranches: [[50000, 3], [100000, 8], [175000, 9], [250000, 18], [500000, 24], [Infinity, 30]] },
    vla: { nom: 'Flandre', tranches: [[50000, 3], [250000, 9], [Infinity, 27]] }
  };
  function succession(region, montant) {
    let reste = montant, prev = 0, total = 0; const lignes = [];
    for (const [plafond, taux] of SUCC[region].tranches) {
      if (reste <= 0) break;
      const part = Math.min(reste, plafond - prev);
      const droits = part * taux / 100;
      lignes.push({ de: prev, a: plafond, taux, part, droits });
      total += droits; reste -= part; prev = plafond;
    }
    return { lignes, total };
  }

  // ---------- Export PDF ----------
  function exportPdf(title, html, mode) {
    const w = window.open('', '_blank');
    if (!w) { alert('Autorise les fenêtres pop-up pour exporter en PDF.'); return; }
    const style = mode === 'doc'
      ? `body{font-family:'Source Serif 4',Georgia,serif;font-size:12pt;line-height:1.6;color:#111;max-width:17cm;margin:2cm auto;padding:0 1cm}p{margin:0 0 10pt}mark{background:none;color:inherit}.small{font-size:9pt;color:#555;font-family:monospace}.right{text-align:right}.sig{margin-top:20pt}h2{font-size:13pt;margin:16pt 0 6pt}`
      : `body{font-family:system-ui,sans-serif;font-size:11pt;color:#111;max-width:19cm;margin:1.5cm auto;padding:0 1cm}h1{font-size:16pt}h2{font-size:12pt;margin:14pt 0 6pt}table{width:100%;border-collapse:collapse;font-size:10pt}th,td{padding:6pt 4pt;border-bottom:1px solid #ccc;text-align:left}td.r,th.r{text-align:right}.total{font-size:14pt;font-weight:700;margin-top:12pt}.note{font-size:9pt;color:#555;margin-top:16pt}`;
    w.document.write(`<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>${esc(title)}</title><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;600&display=swap"><style>${style}@media print{@page{margin:1.5cm}}</style></head><body>${html}<script>setTimeout(function(){window.print()},400)<\/script></body></html>`);
    w.document.close();
  }

  // ---------- Vues ----------
  function pageHead(kicker, title, actions) {
    return `<header class="page-head"><div class="titles"><div class="kicker">${kicker}</div><h1>${title}</h1></div><div class="actions">${actions || ''}</div></header>`;
  }

  function viewDossiers() {
    const rows = DOSSIERS.map(d => `<tr class="clickable" data-go="#/dossier/${d.id}"><td>${d.id}</td><td class="sans"><strong>${esc(d.titre)}</strong></td><td class="sans">${esc(d.type)}</td><td class="sans"><span class="badge ${d.etape === 'Brouillon' ? 'muted' : ''}">${esc(d.etape)}</span></td><td>${fr(d.echeance)}</td></tr>`).join('');
    const total = DOSSIERS.reduce((s, d) => s + d.factures.reduce((t, f) => t + f.montant, 0), 0);
    const soon = DOSSIERS.filter(d => d.echeance !== '—' && daysBetween(today, d.echeance) <= 15).length;
    return pageHead(`Dossiers · ${DOSSIERS.length} actifs`, 'Mes dossiers', `<a class="btn" href="#/nouveau">+ Nouveau dossier</a><a class="btn primary" href="#/atelier">+ Rédiger un acte</a>`) +
      `<div class="stats">
        <div class="stat"><div class="kicker">Dossiers actifs</div><div class="val">${DOSSIERS.length}</div></div>
        <div class="stat"><div class="kicker">Échéances sous 15 j</div><div class="val" style="color:var(--warn)">${soon}</div></div>
        <div class="stat"><div class="kicker">Créances en recouvrement</div><div class="val">${eur(total)}</div></div>
        <div class="stat"><div class="kicker">Actes à signer</div><div class="val">1</div></div>
      </div>
      <section class="card"><h2>Tous les dossiers</h2><div class="table-wrap"><table><thead><tr><th>Référence</th><th>Dossier</th><th>Type</th><th>Étape</th><th>Prochaine échéance</th></tr></thead><tbody>${rows}</tbody></table></div></section>`;
  }

  function viewNouveau() {
    return pageHead('Dossiers · Nouveau', 'Créer un dossier', `<a class="btn" href="#/dossiers">Annuler</a>`) +
      `<form id="formDossier" class="grid-2" novalidate>
        <section class="card">
          <h2>Dossier</h2>
          <div class="field"><label for="f_titre">Intitulé</label><input id="f_titre" class="input" required placeholder="Ex. Martin c/ SRL Alpha"></div>
          <div class="fields-2">
            <div class="field"><label for="f_type">Type</label><select id="f_type" class="input"><option value="REC">Recouvrement de factures</option><option value="CTR">Contrat B2B</option><option value="MED">Mise en demeure (bail)</option><option value="CGV">Conditions générales</option><option value="SUC">Succession</option></select></div>
            <div class="field"><label for="f_regime">Régime</label><select id="f_regime" class="input"><option value="b2b">B2B — entre entreprises</option><option value="b2c">B2C — avec un consommateur</option></select></div>
          </div>
          <h2>Client</h2>
          <div class="field"><label for="c_nom">Nom / dénomination</label><input id="c_nom" class="input" required></div>
          <div class="fields-2">
            <div class="field"><label for="c_bce">N° BCE</label><input id="c_bce" class="input mono" placeholder="0xxx.xxx.xxx"></div>
            <div class="field"><label for="c_role">Qualité</label><input id="c_role" class="input" value="CLIENT · CRÉANCIER"></div>
          </div>
          <div class="field"><label for="c_adr">Adresse</label><input id="c_adr" class="input"></div>
          <h2>Partie adverse / cocontractant</h2>
          <div class="field"><label for="a_nom">Nom / dénomination</label><input id="a_nom" class="input" required></div>
          <div class="fields-2">
            <div class="field"><label for="a_bce">N° BCE</label><input id="a_bce" class="input mono" placeholder="0xxx.xxx.xxx"></div>
            <div class="field"><label for="a_role">Qualité</label><input id="a_role" class="input" value="PARTIE ADVERSE · DÉBITEUR"></div>
          </div>
          <div class="field"><label for="a_adr">Adresse</label><input id="a_adr" class="input"></div>
        </section>
        <section class="card">
          <h2>Factures impayées</h2>
          <div id="factures" class="list"></div>
          <button type="button" class="btn ghost" id="addFacture">+ Ajouter une facture</button>
          <h2>Pièces</h2>
          <div class="field"><label for="f_pieces">Une pièce par ligne</label><textarea id="f_pieces" class="input" placeholder="Contrat signé du 12/01/2026&#10;Échange d'e-mails"></textarea></div>
          <div class="assistant"><strong>Assistant Juridesk</strong> — En production, le numéro BCE remplit automatiquement la dénomination et l'adresse depuis la Banque-Carrefour des Entreprises.</div>
          <div class="wizard-nav"><button type="submit" class="btn primary">Créer le dossier</button></div>
          <div id="formErr" class="hint" style="color:var(--danger)"></div>
        </section>
      </form>`;
  }

  function viewDossier(id) {
    const d = DOSSIERS.find(x => x.id === id);
    if (!d) return `<div class="empty">Dossier introuvable.</div>`;
    state.dossier = d.id;
    const c = calcul(d, state.calc);
    const pieces = d.pieces.map(p => `<div class="row"><span class="dot ${p.dot}"></span>${esc(p.label)}<span class="right">${p.tag}</span></div>`).join('') || `<div class="row"><span class="dot muted"></span>Aucune pièce<span class="right">—</span></div>`;
    const tl = d.timeline.map((t, i) => `<div class="tl"><div class="rail"><i class="${t.state === 'future' ? 'future' : t.state === 'later' ? 'later' : ''}"></i>${i < d.timeline.length - 1 ? '<b></b>' : ''}</div><div class="body"><div class="date ${t.state === 'future' ? 'warn' : ''}">${t.date}</div><div class="label">${esc(t.label)}</div></div></div>`).join('');
    const party = p => `<div class="party"><div class="kicker">${esc(p.role)}</div><strong>${esc(p.nom)}</strong><div class="mono">BCE ${esc(p.bce)}</div><div>${esc(p.adresse)}</div></div>`;
    return pageHead(`Dossier · ${d.id}`, `${esc(d.titre)} — ${esc(d.type)}`,
      `<button type="button" class="btn ghost" id="delDossier">Supprimer</button><a class="btn" href="#/calculateurs">Calculer la créance</a><a class="btn primary" href="#/atelier">+ Rédiger un acte</a>`) +
      `<div class="stats">
        <div class="stat"><div class="kicker">Principal dû</div><div class="val">${d.factures.length ? eur(c.principal) : '—'}</div></div>
        <div class="stat"><div class="kicker">Étape</div><div class="val text" style="color:var(--accent)">${esc(d.etape)}</div></div>
        <div class="stat"><div class="kicker">Prochaine échéance</div><div class="val text" style="color:var(--warn)">${d.echeance === '—' ? '—' : 'Délai — ' + fr(d.echeance)}</div></div>
        <div class="stat"><div class="kicker">Prescription</div><div class="val text">${esc(d.prescription)}</div></div>
      </div>
      <div class="grid-2">
        <section class="card"><h2>Parties</h2><div class="fields-2">${party(d.client)}${party(d.adverse)}</div><h2>Pièces du dossier</h2><div class="list">${pieces}</div></section>
        <section class="card"><h2>Chronologie &amp; échéancier</h2><div class="timeline">${tl}</div><div class="assistant"><strong>Assistant Juridesk</strong> — ${esc(d.assistant)}</div></section>
      </div>`;
  }

  // ---------- Atelier ----------
  function viewAtelier() {
    const a = state.atelier, d = currentDossier(), c = calcul(d, state.calc), p = a.p;
    const steps = ['Modèle', 'Parties', 'Détails', 'Clauses', 'Relecture & envoi'];
    const chips = steps.map((s, i) => `<button type="button" class="chip mono ${a.step === i + 1 ? 'on' : a.step > i + 1 ? 'done' : ''}" data-step="${i + 1}">${i + 1} · ${s}</button>`).join('');
    const modeles = MODELES.map(m => `<label class="check"><input type="radio" name="modele" value="${m.id}" ${a.modele === m.id ? 'checked' : ''}><span><span class="t">${esc(m.nom)}</span><span class="d">${m.famille} · ${m.cible}</span></span></label>`).join('');
    const dossiers = DOSSIERS.map(x => `<option value="${x.id}" ${x.id === d.id ? 'selected' : ''}>${x.id} — ${esc(x.titre)}</option>`).join('');
    const num = (id, label, val, unit) => `<div class="field"><label for="${id}">${label}${unit ? ' (' + unit + ')' : ''}</label><input id="${id}" data-p="${id.replace('p_', '')}" class="input mono" type="number" min="0" value="${val}"></div>`;
    const txt = (id, label, val) => `<div class="field"><label for="${id}">${label}</label><textarea id="${id}" data-p="${id.replace('p_', '')}" class="input">${esc(val)}</textarea></div>`;

    let details, clauses;
    switch (a.modele) {
      case 'presta':
        details = `<div class="fields-2">${num('p_honoraires', 'Honoraires', p.honoraires, '€ HTVA')}${num('p_duree', 'Durée du contrat', p.duree, 'mois')}${num('p_paiement', 'Délai de paiement', p.paiement, 'jours')}</div>${txt('p_objet', 'Objet de la prestation', p.objet)}`;
        clauses = clauseList([['interets', 'Intérêts de retard (loi du 2 août 2002)', 'Sur toute facture impayée à l\'échéance.'], ['penale', 'Limitation de responsabilité', 'Plafond égal aux honoraires de l\'année écoulée.'], ['plan', 'Propriété intellectuelle cédée au paiement intégral', 'Les livrables restent la propriété du prestataire jusqu\'au paiement complet.']]);
        break;
      case 'cgv':
        details = `<div class="fields-2">${num('p_delaiCgv', 'Délai de paiement', p.delaiCgv, 'jours')}${num('p_penaliteCgv', 'Clause pénale', p.penaliteCgv, '%')}</div>`;
        clauses = clauseList([['interets', 'Intérêts de retard de plein droit', 'Sans mise en demeure préalable en B2B.'], ['retractation', 'Droit de rétractation 14 jours (B2C)', 'Obligatoire pour les ventes à distance aux consommateurs.'], ['penale', 'Réserve de propriété', 'Les biens restent la propriété du vendeur jusqu\'au paiement intégral.']]);
        break;
      case 'nda':
        details = `<div class="fields-2">${num('p_nda_duree', 'Durée de confidentialité', p.nda_duree, 'ans')}</div>${txt('p_nda_objet', 'Contexte des échanges', p.nda_objet)}`;
        clauses = clauseList([['interets', 'Réciprocité', 'Les deux parties sont tenues à la confidentialité.'], ['penale', 'Clause pénale forfaitaire', '10 000 € par violation constatée, sans préjudice de dommages complémentaires.'], ['plan', 'Restitution / destruction des informations', 'À la fin de la relation, sur simple demande.']]);
        break;
      case 'bail':
        details = `<div class="fields-2">${num('p_bail_delai', 'Délai accordé au bailleur', p.bail_delai, 'jours')}</div>${txt('p_bail_travaux', 'Travaux ou réparations exigés', p.bail_travaux)}`;
        clauses = clauseList([['interets', 'Menace de saisine du juge de paix', 'Procédure en exécution forcée et dommages-intérêts.'], ['penale', 'Réserve de réduction du loyer', 'Pour la période de jouissance réduite.'], ['plan', 'Proposition de visite contradictoire', 'Constat des lieux en présence des deux parties.']]);
        break;
      case 'transac':
        details = `<div class="fields-2">${num('p_trans_montant', 'Montant transactionnel', p.trans_montant, '€')}${num('p_trans_echeances', 'Nombre de mensualités', p.trans_echeances)}</div><div class="assistant"><strong>Assistant Juridesk</strong> — Créance totale calculée : <span class="mono">${eur(c.total)}</span>. La transaction porte sur <span class="mono">${eur(p.trans_montant)}</span>, soit une remise de <span class="mono">${eur(Math.max(0, c.total - p.trans_montant))}</span>.</div>`;
        clauses = clauseList([['interets', 'Clause de déchéance du terme', 'Tout retard rend le solde immédiatement exigible, remise perdue.'], ['penale', 'Renonciation réciproque à toute action', 'Pour les faits visés par la transaction.'], ['plan', 'Confidentialité de l\'accord', 'Les parties s\'interdisent toute divulgation.']]);
        break;
      default: {
        const factures = d.factures.length ? d.factures.map(f => `<div class="row"><span class="dot"></span>Facture ${esc(f.num)} · échue le ${fr(f.echeance)}<span class="right">${eur(f.montant)}</span></div>`).join('') : `<div class="row"><span class="dot muted"></span>Aucune facture dans ce dossier<span class="right">—</span></div>`;
        details = `<div class="list">${factures}</div><div class="assistant"><strong>Assistant Juridesk</strong> — Principal : <span class="mono">${eur(c.principal)}</span>. Le décompte détaillé est calculé dans <a href="#/calculateurs">Calculateurs</a> et injecté automatiquement dans l'acte.</div><div class="field"><label for="delai">Délai de paiement accordé</label><select id="delai" class="input"><option value="8" ${a.delai == 8 ? 'selected' : ''}>8 jours</option><option value="15" ${a.delai == 15 ? 'selected' : ''}>15 jours</option><option value="30" ${a.delai == 30 ? 'selected' : ''}>30 jours</option></select></div>`;
        clauses = clauseList([['interets', 'Intérêts de retard — loi du 2 août 2002 (B2B)', 'Calculés depuis l\'échéance de chaque facture.'], ['indemnite', 'Indemnité forfaitaire de recouvrement (40 €)', 'Par facture impayée, en plus des intérêts.'], ['penale', 'Clause pénale prévue aux CGV (10 %)', 'Détectée dans les conditions générales signées du dossier.'], ['plan', 'Proposition de plan d\'apurement', 'Ouvre la porte à un règlement amiable en 3 mensualités.']]) +
          `<div class="assistant"><strong>Assistant Juridesk</strong> — ${d.regime === 'b2b' ? 'Le débiteur est une société : le régime B2B s\'applique, les règles du Code de droit économique sur les clauses abusives B2C ne sont pas pertinentes ici.' : 'La partie adverse agit avec un consommateur : les règles B2C du Code de droit économique s\'appliquent (délai de 14 jours avant tout frais, plafonds d\'indemnités).'}</div>`;
      }
    }

    function clauseList(items) {
      return `<div class="list">${items.map(([k, t, dsc]) => `<label class="check"><input type="checkbox" data-clause="${k}" ${a[k] ? 'checked' : ''}><span><span class="t">${t}</span><span class="d">${dsc}</span></span></label>`).join('')}</div>`;
    }

    const left = `
      <div class="steps ${a.step === 1 ? 'on' : ''}">
        <h2>Étape 1 — Choisir le modèle</h2>
        <div class="field"><label for="dossierSel">Dossier lié</label><select id="dossierSel" class="input">${dossiers}</select></div>
        <div class="list">${modeles}</div>
      </div>
      <div class="steps ${a.step === 2 ? 'on' : ''}">
        <h2>Étape 2 — Parties</h2>
        <div class="assistant"><strong>Assistant Juridesk</strong> — Les parties sont reprises du dossier ${d.id}. Le numéro BCE de la partie adverse a été vérifié dans la Banque-Carrefour des Entreprises (démo).</div>
        <div class="fields-2">
          <div class="party"><div class="kicker">${esc(d.client.role)}</div><strong>${esc(d.client.nom)}</strong><div class="mono">BCE ${esc(d.client.bce)}</div><div>${esc(d.client.adresse)}</div></div>
          <div class="party"><div class="kicker">${esc(d.adverse.role)}</div><strong>${esc(d.adverse.nom)}</strong><div class="mono">BCE ${esc(d.adverse.bce)}</div><div>${esc(d.adverse.adresse)}</div></div>
        </div>
        <div class="fields-2">
          <div class="field"><label for="signataire">Signataire</label><input id="signataire" class="input" value="${esc(a.signataire)}"></div>
          <div class="field"><label for="barreau">Barreau</label><input id="barreau" class="input" value="${esc(a.barreau)}"></div>
        </div>
      </div>
      <div class="steps ${a.step === 3 ? 'on' : ''}"><h2>Étape 3 — Détails</h2>${details}</div>
      <div class="steps ${a.step === 4 ? 'on' : ''}"><h2>Étape 4 — Clauses à inclure</h2>${clauses}</div>
      <div class="steps ${a.step === 5 ? 'on' : ''}">
        <h2>Étape 5 — Relecture &amp; envoi</h2>
        <div class="list">
          <div class="row"><span class="dot ok"></span>Orthographe et références vérifiées<span class="right">OK</span></div>
          <div class="row"><span class="dot ok"></span>Montants cohérents avec le calculateur<span class="right">OK</span></div>
          <div class="row"><span class="dot warn"></span>Version NL à relire par un confrère<span class="right">À FAIRE</span></div>
        </div>
        <div class="field"><label for="mode">Mode d'envoi</label><select id="mode" class="input"><option>Recommandé électronique (eBox / prestataire qualifié)</option><option>Recommandé postal</option><option>E-mail simple</option></select></div>
        <button type="button" class="btn primary" id="signer">Signer avec itsme &amp; envoyer</button>
        <div id="signMsg" class="hint"></div>
      </div>
      <div class="wizard-nav">
        <button type="button" class="btn ghost" id="prev" ${a.step === 1 ? 'disabled' : ''}>← Précédent</button>
        <button type="button" class="btn primary" id="next" ${a.step === 5 ? 'disabled' : ''}>Suivant →</button>
      </div>`;

    return pageHead(`Atelier · ${esc(MODELES.find(m => m.id === a.modele).nom)} · ${d.id}`, 'Atelier de rédaction',
      `<button type="button" class="btn" id="langToggle">${a.lang === 'fr' ? 'Version NL' : 'Version FR'}</button><button type="button" class="btn" id="exportBtn">Exporter en PDF</button><a class="btn" href="#/dossier/${d.id}">Retour au dossier</a>`) +
      `<div class="chips">${chips}</div>
      <div class="grid-wide">
        <section class="card">${left}</section>
        <section class="card"><div style="display:flex;align-items:center;gap:12px"><h2>Aperçu du document</h2><span class="hint" style="margin-left:auto">${a.lang.toUpperCase()} · mis à jour en direct</span></div><div class="doc">${docText(d, a, c)}</div></section>
      </div>`;
  }

  // ---------- Textes des actes ----------
  function docText(d, a, c) {
    const p = a.p, nl = a.lang === 'nl';
    const head = `<div class="small">${esc(a.cabinet)} · ${esc(a.adresseCab)} · contact@cabinet-demo.be</div>`;
    const sig = (fonction) => `<div class="sig">${esc(a.signataire)}<br><span class="small">${fonction}</span></div>`;
    const sigAvocat = sig(nl ? `Advocaat aan de balie van ${esc(a.barreau)}` : `Avocat au barreau de ${esc(a.barreau)}`);
    const dateLine = nl ? `Charleroi, ${longDate(today)}` : `Charleroi, le ${longDate(today)}`;
    const C = esc(d.client.nom), A = esc(d.adverse.nom);
    const bce = x => x && x !== '—' ? ` (BCE ${esc(x)})` : '';
    const nlNote = nl && a.modele !== 'med' ? `<p><mark>Version néerlandaise non disponible pour ce modèle dans la démo — affichage de la version française.</mark></p>` : '';

    if (a.modele === 'med') {
      const total = eur(c.total), princ = eur(c.principal);
      const nums = d.factures.length ? `${d.factures[0].num} à ${d.factures[d.factures.length - 1].num}` : '[N° FACTURES]';
      if (nl) {
        const cl = [];
        if (a.interets) cl.push('<mark>de wettelijke verwijlinteresten vanaf de vervaldag van elke factuur</mark>');
        if (a.indemnite) cl.push('<mark>de forfaitaire vergoeding van 40 € per factuur</mark>');
        if (a.penale) cl.push('<mark>het schadebeding van 10 % voorzien in artikel 8 van de algemene voorwaarden</mark>');
        return head + `<div class="right">${dateLine}</div><div>${A}<br>${esc(d.adverse.adresse)}</div><div><strong>Per elektronische aangetekende zending<br>Betreft: ingebrekestelling — facturen nr. ${esc(nums)}</strong></div><p>Geachte mevrouw, geachte heer,</p><p>Wij treden op voor <strong>${C}</strong>, onze cliënte, die van u een hoofdsom van <strong>${princ}</strong> te vorderen heeft uit hoofde van bovenvermelde, vervallen en onbetaald gebleven facturen, ondanks eerdere herinnering.</p>${cl.length ? `<p>Overeenkomstig de wet van 2 augustus 2002 betreffende de bestrijding van de betalingsachterstand bij handelstransacties wordt dit bedrag vermeerderd met ${cl.join(', ')}.</p>` : ''}<p>Wij stellen u in gebreke het totaalbedrag van <strong>${total}</strong> te betalen binnen <strong>${a.delai} dagen</strong> na heden op rekening [IBAN VAN DE CLIËNT].${a.plan ? ' <mark>Onze cliënte staat open voor een afbetalingsplan in drie maandelijkse schijven, mits schriftelijke bevestiging binnen dezelfde termijn.</mark>' : ''} Bij gebreke daarvan zullen wij zonder verdere kennisgeving een gerechtelijke procedure inleiden, op uw kosten en risico.</p><p>Met de meeste hoogachting,</p>${sigAvocat}`;
      }
      const cl = [];
      if (a.interets) cl.push('<mark>des intérêts de retard au taux légal depuis l\'échéance de chaque facture</mark>');
      if (a.indemnite) cl.push('<mark>de l\'indemnité forfaitaire de 40 € par facture</mark>');
      if (a.penale) cl.push('<mark>de la clause pénale de 10 % prévue à l\'article 8 des conditions générales</mark>');
      return head + `<div class="right">${dateLine}</div><div>${A}<br>${esc(d.adverse.adresse)}</div><div><strong>Par recommandé électronique<br>Objet : mise en demeure — factures n° ${esc(nums)}</strong></div><p>Madame, Monsieur,</p><p>Nous intervenons pour le compte de <strong>${C}</strong>, notre cliente, créancière à votre égard d'un montant en principal de <strong>${princ}</strong> au titre des factures ci-dessus, échues et restées impayées malgré rappel.</p>${cl.length ? `<p>Conformément à la loi du 2 août 2002 concernant la lutte contre le retard de paiement dans les transactions commerciales, ce montant est majoré ${cl.join(', ')}.</p>` : ''}<p>Nous vous mettons en demeure de régler la somme totale de <strong>${total}</strong> dans un délai de <strong>${a.delai} jours</strong> à dater de la présente, sur le compte [IBAN DU CLIENT].${a.plan ? ' <mark>Notre cliente est disposée à accepter un plan d\'apurement en trois mensualités, moyennant confirmation écrite dans le même délai.</mark>' : ''} À défaut, notre cliente nous a chargés d'introduire une procédure judiciaire sans autre avis, à vos frais et risques.</p><p>Veuillez agréer, Madame, Monsieur, l'expression de nos salutations distinguées.</p>${sigAvocat}`;
    }

    if (a.modele === 'presta') {
      return head + nlNote + `<p style="text-align:center;font-weight:600;font-size:16px">CONTRAT DE PRESTATION DE SERVICES</p>
<p><strong>Entre :</strong> ${C}${bce(d.client.bce)}, ${esc(d.client.adresse)}, ci-après « le Prestataire » ;<br><strong>Et :</strong> ${A}${bce(d.adverse.bce)}, ${esc(d.adverse.adresse)}, ci-après « le Client ».</p>
<h2>Article 1 — Objet</h2><p>Le Prestataire s'engage à réaliser pour le Client <mark>${esc(p.objet)}</mark>, selon les spécifications annexées au présent contrat.</p>
<h2>Article 2 — Durée</h2><p>Le contrat est conclu pour une durée de <mark>${p.duree} mois</mark> à dater de sa signature. Il peut être résilié par chaque partie moyennant un préavis d'un mois notifié par écrit.</p>
<h2>Article 3 — Prix et paiement</h2><p>Les prestations sont facturées <mark>${eur(p.honoraires)} hors TVA</mark>. Les factures sont payables à <mark>${p.paiement} jours</mark> de leur date d'émission.${a.interets ? ' <mark>Toute facture impayée à l\'échéance porte de plein droit intérêt au taux prévu par la loi du 2 août 2002, majoré de l\'indemnité forfaitaire de 40 €.</mark>' : ''}</p>
${a.penale ? `<h2>Article 4 — Responsabilité</h2><p><mark>La responsabilité du Prestataire est limitée, toutes causes confondues, au montant des honoraires perçus au cours des douze mois précédant le fait générateur. Le Prestataire ne répond pas des dommages indirects.</mark></p>` : ''}
${a.plan ? `<h2>Article 5 — Propriété intellectuelle</h2><p><mark>Les droits sur les livrables sont cédés au Client au paiement intégral du prix. Jusque-là, ils demeurent la propriété exclusive du Prestataire.</mark></p>` : ''}
<h2>Article 6 — Droit applicable et juridiction</h2><p>Le présent contrat est régi par le droit belge. Tout litige relève des tribunaux de l'arrondissement de ${esc(a.barreau)}.</p>
<p>Fait à ${esc(a.barreau)}, le ${longDate(today)}, en deux exemplaires.</p>
<div class="sig">Pour le Prestataire<br>${C}</div><div class="sig">Pour le Client<br>${A}</div>`;
    }

    if (a.modele === 'cgv') {
      return head + nlNote + `<p style="text-align:center;font-weight:600;font-size:16px">CONDITIONS GÉNÉRALES DE VENTE — ${C}</p>
<h2>1. Champ d'application</h2><p>Les présentes conditions s'appliquent à toute commande passée auprès de ${C}${bce(d.client.bce)}. Toute commande emporte adhésion sans réserve aux présentes.</p>
<h2>2. Prix et paiement</h2><p>Les prix s'entendent hors TVA pour les professionnels et TVA comprise pour les consommateurs. Les factures sont payables à <mark>${p.delaiCgv} jours</mark>.${a.interets ? ' <mark>En cas de retard, un intérêt au taux légal est dû de plein droit et sans mise en demeure préalable entre professionnels ; à l\'égard des consommateurs, après l\'envoi d\'un rappel gratuit et l\'expiration d\'un délai de 14 jours.</mark>' : ''} Toute facture impayée est majorée d'une <mark>clause pénale de ${p.penaliteCgv} %</mark> avec un minimum de 40 €, dans les limites fixées par le Code de droit économique pour les consommateurs.</p>
${a.retractation ? `<h2>3. Droit de rétractation (consommateurs)</h2><p><mark>Le consommateur dispose d'un délai de 14 jours à compter de la réception du bien pour se rétracter sans motif, conformément au livre VI du Code de droit économique. Les frais de renvoi sont à sa charge.</mark></p>` : ''}
${a.penale ? `<h2>4. Réserve de propriété</h2><p><mark>Les biens livrés restent la propriété du vendeur jusqu'au paiement intégral du prix, en principal, intérêts et accessoires.</mark></p>` : ''}
<h2>5. Garantie</h2><p>Les consommateurs bénéficient de la garantie légale de conformité de deux ans. Pour les professionnels, toute réclamation doit être notifiée par écrit dans les 8 jours de la livraison.</p>
<h2>6. Données personnelles</h2><p>Les données sont traitées conformément au RGPD, aux seules fins d'exécution du contrat. Politique complète disponible sur demande.</p>
<h2>7. Droit applicable</h2><p>Droit belge. Les tribunaux de ${esc(a.barreau)} sont seuls compétents, sans préjudice des règles impératives protectrices du consommateur.</p>`;
    }

    if (a.modele === 'nda') {
      return head + nlNote + `<p style="text-align:center;font-weight:600;font-size:16px">ACCORD DE CONFIDENTIALITÉ</p>
<p><strong>Entre :</strong> ${C}${bce(d.client.bce)}, et <strong>${A}</strong>${bce(d.adverse.bce)}, ci-après ensemble « les Parties ».</p>
<h2>Article 1 — Objet</h2><p>Les Parties envisagent d'échanger des informations dans le cadre de <mark>${esc(p.nda_objet)}</mark>. Le présent accord fixe les conditions de protection de ces informations.</p>
<h2>Article 2 — Informations confidentielles</h2><p>Sont confidentielles toutes informations, quel qu'en soit le support, communiquées par une Partie à l'autre et identifiées comme telles ou dont le caractère confidentiel résulte de leur nature.</p>
<h2>Article 3 — Obligations</h2><p>${a.interets ? '<mark>Chaque Partie</mark>' : 'La Partie réceptrice'} s'engage à ne pas divulguer les informations confidentielles à des tiers, à ne les utiliser qu'aux fins de l'objet défini à l'article 1 et à en restreindre l'accès aux membres de son personnel ayant besoin d'en connaître.</p>
<h2>Article 4 — Durée</h2><p>Les obligations de confidentialité s'appliquent pendant <mark>${p.nda_duree} ans</mark> à compter de la signature, même après la fin des discussions entre les Parties.</p>
${a.penale ? `<h2>Article 5 — Sanction</h2><p><mark>Toute violation donne lieu au paiement d'une indemnité forfaitaire de 10 000 € par infraction constatée, sans préjudice du droit de la Partie lésée de réclamer la réparation intégrale de son dommage.</mark></p>` : ''}
${a.plan ? `<h2>Article 6 — Restitution</h2><p><mark>À la fin de la relation ou sur simple demande, chaque Partie restitue ou détruit les informations confidentielles reçues et le confirme par écrit.</mark></p>` : ''}
<h2>Article 7 — Droit applicable</h2><p>Droit belge. Tribunaux de ${esc(a.barreau)}.</p>
<p>Fait à ${esc(a.barreau)}, le ${longDate(today)}.</p><div class="sig">${C}</div><div class="sig">${A}</div>`;
    }

    if (a.modele === 'bail') {
      return head + nlNote + `<div class="right">${dateLine}</div><div>${A}<br>${esc(d.adverse.adresse)}</div><div><strong>Par recommandé<br>Objet : mise en demeure — exécution des obligations du bailleur</strong></div><p>Madame, Monsieur,</p>
<p>Nous intervenons pour le compte de <strong>${C}</strong>, locataire du bien sis ${esc(d.client.adresse)}, en vertu du bail conclu avec vous.</p>
<p>Malgré plusieurs demandes, vous n'avez pas procédé à <mark>${esc(p.bail_travaux)}</mark>. Ces réparations incombent au bailleur en vertu de l'article 1720 de l'ancien Code civil et des dispositions régionales applicables au bail d'habitation.</p>
<p>Nous vous mettons en demeure d'y procéder dans un délai de <mark>${p.bail_delai} jours</mark> à dater de la présente.${a.plan ? ' <mark>Notre client est disponible pour une visite contradictoire des lieux à votre convenance, afin de constater ensemble l\'état du bien.</mark>' : ''}</p>
${a.interets ? `<p><mark>À défaut, notre client saisira le juge de paix afin d'obtenir votre condamnation à exécuter les travaux, au besoin sous astreinte, ainsi que des dommages-intérêts.</mark></p>` : ''}
${a.penale ? `<p><mark>Notre client se réserve en outre le droit de solliciter une réduction du loyer proportionnelle à la perte de jouissance subie depuis l'apparition des désordres.</mark></p>` : ''}
<p>Veuillez agréer, Madame, Monsieur, l'expression de nos salutations distinguées.</p>${sigAvocat}`;
    }

    if (a.modele === 'transac') {
      const mens = p.trans_montant / Math.max(1, p.trans_echeances);
      return head + nlNote + `<p style="text-align:center;font-weight:600;font-size:16px">CONVENTION DE TRANSACTION</p>
<p><strong>Entre :</strong> ${C}${bce(d.client.bce)}, ci-après « le Créancier », <strong>et</strong> ${A}${bce(d.adverse.bce)}, ci-après « le Débiteur ».</p>
<h2>Préambule</h2><p>Le Créancier réclame au Débiteur la somme de ${eur(c.total)} en principal, intérêts et accessoires. Le Débiteur conteste partiellement cette créance. Les parties souhaitent mettre fin à leur différend par voie de transaction au sens des articles 2044 et suivants de l'ancien Code civil.</p>
<h2>Article 1 — Montant transactionnel</h2><p>Le Débiteur s'engage à payer au Créancier la somme forfaitaire de <mark>${eur(p.trans_montant)}</mark>, pour solde de tout compte.</p>
<h2>Article 2 — Modalités</h2><p>Ce montant est payable en <mark>${p.trans_echeances} mensualités de ${eur(mens)}</mark>, la première au plus tard le ${fr(addMonths(today, 1))}, sur le compte [IBAN DU CRÉANCIER].</p>
${a.interets ? `<h2>Article 3 — Déchéance du terme</h2><p><mark>À défaut de paiement d'une seule mensualité à son échéance, et huit jours après une mise en demeure restée sans effet, le solde de la créance initiale (${eur(c.total)}) devient immédiatement exigible, sous déduction des montants déjà payés.</mark></p>` : ''}
${a.penale ? `<h2>Article 4 — Renonciation</h2><p><mark>Sous réserve de la parfaite exécution de la présente, les parties renoncent réciproquement à toute action relative aux faits visés au préambule.</mark></p>` : ''}
${a.plan ? `<h2>Article 5 — Confidentialité</h2><p><mark>Les parties s'interdisent de divulguer le contenu de la présente convention à des tiers.</mark></p>` : ''}
<p>Fait à ${esc(a.barreau)}, le ${longDate(today)}, en deux exemplaires.</p><div class="sig">Le Créancier<br>${C}</div><div class="sig">Le Débiteur<br>${A}</div>`;
    }
    return head;
  }

  // ---------- Calculateurs ----------
  function viewCalculateurs(tab) {
    const c = state.calc; if (tab) c.tab = tab;
    const tabs = [['interets', 'Intérêts de retard'], ['delais', 'Délais & prescription'], ['enreg', 'Droits d\'enregistrement'], ['succ', 'Droits de succession'], ['index', 'Indexation de loyer']];
    const chips = tabs.map(([k, l]) => `<a class="chip ${c.tab === k ? 'on' : ''}" href="#/calculateurs/${k}" style="text-decoration:none">${l}</a>`).join('');
    const body = { interets: calcInterets, delais: calcDelais, enreg: calcEnreg, succ: calcSucc, index: calcIndex }[c.tab]();
    return body.head + `<div class="chips">${chips}</div>` + body.html;
  }

  function calcInterets() {
    const d = currentDossier(), c = state.calc, r = calcul(d, c);
    const dossiers = DOSSIERS.map(x => `<option value="${x.id}" ${x.id === d.id ? 'selected' : ''}>${x.id} — ${esc(x.titre)}</option>`).join('');
    const rows = r.lignes.length ? r.lignes.map(l => `<tr><td>${esc(l.num)}</td><td>${fr(l.echeance)}</td><td class="r">${l.jours}</td><td class="r">${eur(l.montant)}</td><td class="r acc">${eur(l.interets)}</td><td class="r">${eur(l.indem)}</td></tr>`).join('') : `<tr><td colspan="6" class="sans muted">Ce dossier ne contient aucune facture.</td></tr>`;
    return {
      head: pageHead(`Calculateurs · Décompte de créance · ${d.id}`, 'Décompte de créance — intérêts, indemnité et clause pénale', `<button type="button" class="btn" id="exportCalc">Exporter en PDF</button><a class="btn primary" href="#/atelier">Insérer dans l'acte</a>`),
      html: `<div class="grid-wide">
        <section class="card">
          <h2>Paramètres</h2>
          <div class="field"><label for="calcDossier">Dossier</label><select id="calcDossier" class="input">${dossiers}</select></div>
          <div class="field"><label for="regime">Régime applicable</label><select id="regime" class="input"><option value="b2b" ${c.regime === 'b2b' ? 'selected' : ''}>B2B — loi du 2 août 2002</option><option value="b2c" ${c.regime === 'b2c' ? 'selected' : ''}>B2C — intérêt légal civil</option><option value="conv" ${c.regime === 'conv' ? 'selected' : ''}>Taux conventionnel (CGV)</option></select></div>
          <div class="field"><label for="taux">Taux annuel appliqué (%)</label><input id="taux" class="input mono" type="number" step="0.01" min="0" value="${c.taux}"><div class="hint">Valeur de démonstration. En production, le taux semestriel est mis à jour automatiquement depuis le Moniteur belge.</div></div>
          <div class="field"><label for="arrete">Calcul arrêté au</label><input id="arrete" class="input mono" type="date" value="${c.arrete}"></div>
          <label class="check"><input type="checkbox" id="optIndem" ${c.indemnite ? 'checked' : ''}><span class="t">Indemnité forfaitaire 40 € / facture</span></label>
          <label class="check"><input type="checkbox" id="optPenale" ${c.penale ? 'checked' : ''}><span class="t">Clause pénale ${c.penaleTaux} % (CGV art. 8)</span></label>
          <label class="check"><input type="checkbox" id="optFrais" ${c.frais ? 'checked' : ''}><span class="t">Frais de recouvrement justifiés (250 €)</span></label>
        </section>
        <section style="display:flex;flex-direction:column;gap:16px;min-width:0">
          <div class="card"><h2>Factures du dossier</h2><div class="table-wrap"><table id="tblCreance"><thead><tr><th>Facture</th><th>Échéance</th><th class="r">Jours</th><th class="r">Principal</th><th class="r">Intérêts</th><th class="r">Indemnité</th></tr></thead><tbody>${rows}</tbody></table></div></div>
          <div class="stats">
            <div class="stat"><div class="kicker">Principal</div><div class="val">${eur(r.principal)}</div></div>
            <div class="stat"><div class="kicker">Intérêts + indemnités</div><div class="val" style="color:var(--accent)">${eur(r.interets + r.indem)}</div></div>
            <div class="stat"><div class="kicker">Clause pénale${c.frais ? ' + frais' : ''}</div><div class="val">${eur(r.penale + r.frais)}</div></div>
            <div class="stat hl"><div class="kicker" style="color:var(--accent)">Total réclamé au ${fr(c.arrete)}</div><div class="val" style="font-size:28px">${eur(r.total)}</div></div>
          </div>
          <div class="assistant warn"><strong>Point d'attention</strong> — Le cumul d'une clause pénale et des intérêts légaux peut être réduit par le juge s'il est jugé manifestement excessif. Juridesk le signale ; la décision reste celle du praticien.</div>
        </section>
      </div>`
    };
  }

  function calcDelais() {
    const s = state.calc.delai, def = DELAIS[s.type], fin = def.fn(s.depart);
    const jours = daysBetween(today, fin);
    const opts = Object.entries(DELAIS).map(([k, v]) => `<option value="${k}" ${s.type === k ? 'selected' : ''}>${v.label}</option>`).join('');
    const all = Object.entries(DELAIS).map(([k, v]) => `<tr><td class="sans">${v.label}</td><td>${fr(v.fn(s.depart))}</td></tr>`).join('');
    return {
      head: pageHead('Calculateurs · Délais & prescription', 'Délais de procédure et de prescription'),
      html: `<div class="grid-wide">
        <section class="card"><h2>Paramètres</h2>
          <div class="field"><label for="dlDepart">Point de départ (signification, échéance, fait générateur)</label><input id="dlDepart" class="input mono" type="date" value="${s.depart}"></div>
          <div class="field"><label for="dlType">Délai</label><select id="dlType" class="input">${opts}</select></div>
          <div class="assistant"><strong>Assistant Juridesk</strong> — Calcul en jours calendrier. En production, le calculateur tient compte des règles du Code judiciaire (report au premier jour ouvrable, vacances judiciaires, délais de distance).</div>
        </section>
        <section style="display:flex;flex-direction:column;gap:16px;min-width:0">
          <div class="stats">
            <div class="stat hl"><div class="kicker" style="color:var(--accent)">Échéance</div><div class="val">${fr(fin)}</div></div>
            <div class="stat"><div class="kicker">Jours restants</div><div class="val" style="color:${jours < 30 ? 'var(--warn)' : 'inherit'}">${jours}</div></div>
          </div>
          <div class="card"><h2>Tous les délais depuis le ${fr(s.depart)}</h2><div class="table-wrap"><table><thead><tr><th>Délai</th><th>Échéance</th></tr></thead><tbody>${all}</tbody></table></div></div>
        </section></div>`
    };
  }

  function calcEnreg() {
    const s = state.calc.enreg, r = ENREG[s.region];
    let base = s.prix, taux = s.habitation ? r.reduit : r.normal;
    if (s.region === 'bxl' && s.habitation && s.prix <= 600000) base = Math.max(0, s.prix - r.abattement);
    const droits = base * taux / 100;
    const regions = Object.entries(ENREG).map(([k, v]) => `<option value="${k}" ${s.region === k ? 'selected' : ''}>${v.nom}</option>`).join('');
    return {
      head: pageHead('Calculateurs · Droits d\'enregistrement', 'Droits d\'enregistrement sur un achat immobilier'),
      html: `<div class="grid-wide">
        <section class="card"><h2>Paramètres</h2>
          <div class="field"><label for="enRegion">Région du bien</label><select id="enRegion" class="input">${regions}</select></div>
          <div class="field"><label for="enPrix">Prix d'achat (€)</label><input id="enPrix" class="input mono" type="number" min="0" step="1000" value="${s.prix}"></div>
          <label class="check"><input type="checkbox" id="enHab" ${s.habitation ? 'checked' : ''}><span><span class="t">Habitation propre et unique</span><span class="d">L'acheteur ne possède pas d'autre bien et s'y domicilie.</span></span></label>
          <div class="assistant warn"><strong>Barèmes de démonstration</strong> — ${r.note} Valeurs à vérifier auprès du SPF Finances / de l'administration régionale avant tout usage.</div>
        </section>
        <section style="display:flex;flex-direction:column;gap:16px;min-width:0">
          <div class="stats">
            <div class="stat"><div class="kicker">Base imposable</div><div class="val">${eur(base)}</div></div>
            <div class="stat"><div class="kicker">Taux appliqué</div><div class="val">${taux} %</div></div>
            <div class="stat hl"><div class="kicker" style="color:var(--accent)">Droits d'enregistrement</div><div class="val" style="font-size:28px">${eur(droits)}</div></div>
            <div class="stat"><div class="kicker">Coût total (hors frais de notaire)</div><div class="val">${eur(s.prix + droits)}</div></div>
          </div>
          <div class="card"><h2>Comparaison par région (mêmes paramètres)</h2><div class="table-wrap"><table><thead><tr><th>Région</th><th class="r">Taux</th><th class="r">Droits</th></tr></thead><tbody>${Object.entries(ENREG).map(([k, v]) => { let b = s.prix, t = s.habitation ? v.reduit : v.normal; if (k === 'bxl' && s.habitation && s.prix <= 600000) b = Math.max(0, s.prix - v.abattement); return `<tr><td class="sans">${v.nom}</td><td class="r">${t} %</td><td class="r">${eur(b * t / 100)}</td></tr>`; }).join('')}</tbody></table></div></div>
        </section></div>`
    };
  }

  function calcSucc() {
    const s = state.calc.succ, r = succession(s.region, s.montant);
    const regions = Object.entries(SUCC).map(([k, v]) => `<option value="${k}" ${s.region === k ? 'selected' : ''}>${v.nom}</option>`).join('');
    const rows = r.lignes.map(l => `<tr><td>${eur(l.de)} – ${l.a === Infinity ? '∞' : eur(l.a)}</td><td class="r">${l.taux} %</td><td class="r">${eur(l.part)}</td><td class="r acc">${eur(l.droits)}</td></tr>`).join('');
    return {
      head: pageHead('Calculateurs · Droits de succession', 'Droits de succession — ligne directe et entre partenaires'),
      html: `<div class="grid-wide">
        <section class="card"><h2>Paramètres</h2>
          <div class="field"><label for="suRegion">Région (domicile fiscal du défunt)</label><select id="suRegion" class="input">${regions}</select></div>
          <div class="field"><label for="suMontant">Part nette recueillie par l'héritier (€)</label><input id="suMontant" class="input mono" type="number" min="0" step="1000" value="${s.montant}"></div>
          <div class="assistant warn"><strong>Barèmes de démonstration</strong> — Tranches progressives en ligne directe et entre partenaires, hors exonérations (logement familial, abattements). Valeurs à vérifier avant tout usage.</div>
        </section>
        <section style="display:flex;flex-direction:column;gap:16px;min-width:0">
          <div class="stats">
            <div class="stat hl"><div class="kicker" style="color:var(--accent)">Droits de succession</div><div class="val" style="font-size:28px">${eur(r.total)}</div></div>
            <div class="stat"><div class="kicker">Taux moyen</div><div class="val">${s.montant ? (r.total / s.montant * 100).toFixed(2) : '0.00'} %</div></div>
            <div class="stat"><div class="kicker">Net après droits</div><div class="val">${eur(s.montant - r.total)}</div></div>
          </div>
          <div class="card"><h2>Détail par tranche — ${SUCC[s.region].nom}</h2><div class="table-wrap"><table><thead><tr><th>Tranche</th><th class="r">Taux</th><th class="r">Montant dans la tranche</th><th class="r">Droits</th></tr></thead><tbody>${rows}</tbody></table></div></div>
        </section></div>`
    };
  }

  function calcIndex() {
    const s = state.calc.index, nouveau = s.base ? s.loyer * s.nouveau / s.base : s.loyer;
    return {
      head: pageHead('Calculateurs · Indexation de loyer', 'Indexation annuelle du loyer'),
      html: `<div class="grid-wide">
        <section class="card"><h2>Paramètres</h2>
          <div class="field"><label for="ixLoyer">Loyer de base (€)</label><input id="ixLoyer" class="input mono" type="number" min="0" step="1" value="${s.loyer}"></div>
          <div class="fields-2">
            <div class="field"><label for="ixBase">Indice santé de base</label><input id="ixBase" class="input mono" type="number" min="0" step="0.01" value="${s.base}"><div class="hint">Mois précédant la signature du bail</div></div>
            <div class="field"><label for="ixNouveau">Nouvel indice santé</label><input id="ixNouveau" class="input mono" type="number" min="0" step="0.01" value="${s.nouveau}"><div class="hint">Mois précédant l'anniversaire du bail</div></div>
          </div>
          <div class="assistant"><strong>Assistant Juridesk</strong> — Formule légale : loyer de base × nouvel indice ÷ indice de base. En production, les indices sont récupérés automatiquement auprès de Statbel ; les plafonds régionaux (PEB) sont appliqués le cas échéant.</div>
        </section>
        <section style="display:flex;flex-direction:column;gap:16px;min-width:0">
          <div class="stats">
            <div class="stat"><div class="kicker">Loyer actuel</div><div class="val">${eur(s.loyer)}</div></div>
            <div class="stat hl"><div class="kicker" style="color:var(--accent)">Loyer indexé</div><div class="val" style="font-size:28px">${eur(nouveau)}</div></div>
            <div class="stat"><div class="kicker">Augmentation</div><div class="val">${eur(nouveau - s.loyer)} · ${s.base ? ((s.nouveau / s.base - 1) * 100).toFixed(2) : '0.00'} %</div></div>
          </div>
          <div class="card"><h2>Texte de notification au locataire</h2><div class="doc" style="min-height:0"><p>Madame, Monsieur,</p><p>Conformément à l'article 1728bis de l'ancien Code civil et aux dispositions régionales applicables, nous vous informons que le loyer de ${eur(s.loyer)} est indexé comme suit : ${eur(s.loyer)} × ${s.nouveau} ÷ ${s.base} = <strong>${eur(nouveau)}</strong>, applicable à partir du prochain terme.</p><p>Veuillez agréer, Madame, Monsieur, nos salutations distinguées.</p></div></div>
        </section></div>`
    };
  }

  function viewSignatures() {
    const items = [
      { doc: 'Mise en demeure — Nova Tech SRL', dossier: 'REC-2026-0147', mode: 'Recommandé électronique', statut: 'Signé · envoyé le 19/10/2026', cls: 'ok' },
      { doc: 'Contrat de prestation v4 — Maison Verhaegen', dossier: 'CTR-2026-0092', mode: 'Signature itsme (2 parties)', statut: 'En attente du cocontractant', cls: 'warn' },
      { doc: 'Mise en demeure bailleur — Immo Capitale', dossier: 'MED-2026-0211', mode: '—', statut: 'Brouillon', cls: 'muted' }
    ];
    const rows = items.map(i => `<tr><td class="sans"><strong>${esc(i.doc)}</strong></td><td>${i.dossier}</td><td class="sans">${esc(i.mode)}</td><td class="sans"><span class="badge ${i.cls}">${esc(i.statut)}</span></td></tr>`).join('');
    return pageHead('Signatures & envois', 'Signatures électroniques et envois recommandés') +
      `<section class="card"><div class="table-wrap"><table><thead><tr><th>Document</th><th>Dossier</th><th>Mode</th><th>Statut</th></tr></thead><tbody>${rows}</tbody></table></div></section>
      <div class="assistant"><strong>Assistant Juridesk</strong> — Chaque envoi génère un journal de preuve horodaté (hash du document, identité itsme du signataire, accusé de réception du prestataire qualifié).</div>`;
  }

  function viewClients() {
    return pageHead('Espace clients', 'Portail client sécurisé') +
      `<div class="grid-2">
        <section class="card"><h2>Lambert Électricité SRL</h2><div class="list"><div class="row"><span class="dot ok"></span>Dossier REC-2026-0147 partagé<span class="right">LECTURE</span></div><div class="row"><span class="dot ok"></span>Mise en demeure consultée le 19/10/2026<span class="right">VU</span></div><div class="row"><span class="dot warn"></span>Provision d'honoraires 600 €<span class="right">EN ATTENTE</span></div></div><button type="button" class="btn">Copier le lien d'accès</button></section>
        <section class="card"><h2>Studio Nord SRL</h2><div class="list"><div class="row"><span class="dot ok"></span>Dossier CTR-2026-0092 partagé<span class="right">LECTURE</span></div><div class="row"><span class="dot"></span>Questionnaire « informations société » complété<span class="right">REÇU</span></div><div class="row"><span class="dot ok"></span>Provision 900 € payée<span class="right">PAYÉ</span></div></div><button type="button" class="btn">Copier le lien d'accès</button></section>
      </div>`;
  }

  // ---------- Routeur ----------
  function render() {
    const hash = location.hash || '#/dossiers';
    const [, route, param] = hash.split('/');
    let html, nav = route;
    switch (route) {
      case 'dossier': html = viewDossier(param); nav = 'dossiers'; break;
      case 'nouveau': html = viewNouveau(); nav = 'dossiers'; break;
      case 'atelier': html = viewAtelier(); break;
      case 'calculateurs': html = viewCalculateurs(param); break;
      case 'signatures': html = viewSignatures(); break;
      case 'clients': html = viewClients(); break;
      default: html = viewDossiers(); nav = 'dossiers';
    }
    view.innerHTML = html;
    $$('.nav-link').forEach(a => a.classList.toggle('active', a.dataset.nav === nav));
    bind(route, param);
    window.scrollTo(0, 0);
  }

  function on(sel, evt, fn) { const el = $(sel, view); if (el) el.addEventListener(evt, fn); }
  const rerender = fn => e => { fn(e); render(); };

  function bind(route, param) {
    $$('[data-go]', view).forEach(el => el.addEventListener('click', () => { location.hash = el.dataset.go; }));

    if (route === 'dossier') {
      on('#delDossier', 'click', () => {
        if (!confirm('Supprimer ce dossier de la démo ?')) return;
        const i = DOSSIERS.findIndex(x => x.id === param); if (i >= 0) DOSSIERS.splice(i, 1);
        if (!DOSSIERS.length) DOSSIERS.push(JSON.parse(JSON.stringify(SEED[0])));
        state.dossier = DOSSIERS[0].id; save(); location.hash = '#/dossiers';
      });
    }

    if (route === 'nouveau') {
      const list = $('#factures', view);
      const addRow = () => { const r = document.createElement('div'); r.className = 'fields-2'; r.innerHTML = `<div class="field"><label>N°</label><input class="input mono f-num" placeholder="2026-010"></div><div class="field"><label>Échéance</label><input class="input mono f-date" type="date"></div><div class="field"><label>Montant (€)</label><input class="input mono f-amt" type="number" min="0" step="0.01"></div>`; list.appendChild(r); };
      addRow();
      on('#addFacture', 'click', addRow);
      on('#formDossier', 'submit', e => {
        e.preventDefault();
        const v = id => $(id, view).value.trim();
        if (!v('#f_titre') || !v('#c_nom') || !v('#a_nom')) { $('#formErr', view).textContent = 'L\'intitulé, le client et la partie adverse sont obligatoires.'; return; }
        const types = { REC: 'Recouvrement de factures', CTR: 'Contrat B2B', MED: 'Mise en demeure (bail)', CGV: 'Conditions générales', SUC: 'Succession' };
        const factures = $$('#factures .fields-2', view).map(r => ({ num: $('.f-num', r).value.trim() || '—', echeance: $('.f-date', r).value || today, montant: +$('.f-amt', r).value || 0 })).filter(f => f.montant > 0);
        const pieces = v('#f_pieces').split('\n').map(s => s.trim()).filter(Boolean).map(label => ({ label, tag: 'PDF', dot: '' }));
        const prefix = v('#f_type');
        const d = {
          id: nextId(prefix), titre: v('#f_titre'), type: types[prefix], etape: 'Brouillon',
          client: { nom: v('#c_nom'), bce: v('#c_bce') || '—', adresse: v('#c_adr') || '—', role: v('#c_role') || 'CLIENT' },
          adverse: { nom: v('#a_nom'), bce: v('#a_bce') || '—', adresse: v('#a_adr') || '—', role: v('#a_role') || 'PARTIE ADVERSE' },
          regime: v('#f_regime'), echeance: '—', prescription: factures.length ? `10 ans · ${fr(addYears(factures[0].echeance, 10))}` : '—',
          factures, pieces, timeline: [{ date: fr(today), label: 'Ouverture du dossier', state: 'past' }],
          assistant: factures.length ? `Le dossier contient ${factures.length} facture(s) impayée(s). Je peux préparer la mise en demeure et le décompte de créance.` : 'Dossier créé. Choisissez un modèle dans l\'atelier pour rédiger le premier acte.'
        };
        DOSSIERS.unshift(d); state.dossier = d.id; save(); location.hash = '#/dossier/' + d.id;
      });
    }

    if (route === 'atelier') {
      const a = state.atelier;
      const refreshDoc = () => { $('.doc', view).innerHTML = docText(currentDossier(), a, calcul(currentDossier(), state.calc)); };
      $$('[data-step]', view).forEach(b => b.addEventListener('click', () => { a.step = +b.dataset.step; render(); }));
      on('#prev', 'click', rerender(() => { a.step = Math.max(1, a.step - 1); }));
      on('#next', 'click', rerender(() => { a.step = Math.min(5, a.step + 1); }));
      on('#langToggle', 'click', rerender(() => { a.lang = a.lang === 'fr' ? 'nl' : 'fr'; }));
      on('#exportBtn', 'click', () => exportPdf(MODELES.find(m => m.id === a.modele).nom, $('.doc', view).innerHTML, 'doc'));
      on('#dossierSel', 'change', rerender(e => { state.dossier = e.target.value; }));
      $$('input[name=modele]', view).forEach(r => r.addEventListener('change', () => { a.modele = r.value; render(); }));
      on('#signataire', 'input', e => { a.signataire = e.target.value; refreshDoc(); });
      on('#barreau', 'input', e => { a.barreau = e.target.value; refreshDoc(); });
      on('#delai', 'change', rerender(e => { a.delai = +e.target.value; }));
      $$('[data-p]', view).forEach(el => el.addEventListener('input', () => { a.p[el.dataset.p] = el.type === 'number' ? +el.value || 0 : el.value; refreshDoc(); }));
      $$('[data-clause]', view).forEach(cb => cb.addEventListener('change', () => { a[cb.dataset.clause] = cb.checked; if (a.modele === 'med') { state.calc.indemnite = a.indemnite; state.calc.penale = a.penale; } render(); }));
      on('#signer', 'click', () => { $('#signMsg', view).textContent = 'Démo : en production, itsme s\'ouvre ici pour signer, puis le recommandé électronique est envoyé et journalisé.'; });
    }

    if (route === 'calculateurs') {
      const c = state.calc;
      on('#calcDossier', 'change', rerender(e => { state.dossier = e.target.value; }));
      on('#regime', 'change', rerender(e => { c.regime = e.target.value; }));
      on('#taux', 'change', rerender(e => { c.taux = Math.max(0, +e.target.value || 0); }));
      on('#arrete', 'change', rerender(e => { if (e.target.value) c.arrete = e.target.value; }));
      on('#optIndem', 'change', rerender(e => { c.indemnite = e.target.checked; state.atelier.indemnite = c.indemnite; }));
      on('#optPenale', 'change', rerender(e => { c.penale = e.target.checked; state.atelier.penale = c.penale; }));
      on('#optFrais', 'change', rerender(e => { c.frais = e.target.checked; }));
      on('#exportCalc', 'click', () => {
        const d = currentDossier(), r = calcul(d, c);
        exportPdf('Décompte de créance ' + d.id, `<h1>Décompte de créance — ${esc(d.titre)}</h1><p>Dossier ${d.id} · arrêté au ${fr(c.arrete)} · taux ${c.taux} % l'an</p><table><thead><tr><th>Facture</th><th>Échéance</th><th class="r">Jours</th><th class="r">Principal</th><th class="r">Intérêts</th><th class="r">Indemnité</th></tr></thead><tbody>${r.lignes.map(l => `<tr><td>${esc(l.num)}</td><td>${fr(l.echeance)}</td><td class="r">${l.jours}</td><td class="r">${eur(l.montant)}</td><td class="r">${eur(l.interets)}</td><td class="r">${eur(l.indem)}</td></tr>`).join('')}</tbody></table><h2>Récapitulatif</h2><table><tr><td>Principal</td><td class="r">${eur(r.principal)}</td></tr><tr><td>Intérêts de retard</td><td class="r">${eur(r.interets)}</td></tr><tr><td>Indemnités forfaitaires</td><td class="r">${eur(r.indem)}</td></tr><tr><td>Clause pénale</td><td class="r">${eur(r.penale)}</td></tr>${c.frais ? `<tr><td>Frais de recouvrement</td><td class="r">${eur(r.frais)}</td></tr>` : ''}</table><p class="total">Total réclamé : ${eur(r.total)}</p><p class="note">Document de démonstration généré par Juridesk — données fictives, taux indicatif.</p>`, 'calc');
      });
      on('#dlDepart', 'change', rerender(e => { if (e.target.value) c.delai.depart = e.target.value; }));
      on('#dlType', 'change', rerender(e => { c.delai.type = e.target.value; }));
      on('#enRegion', 'change', rerender(e => { c.enreg.region = e.target.value; }));
      on('#enPrix', 'change', rerender(e => { c.enreg.prix = Math.max(0, +e.target.value || 0); }));
      on('#enHab', 'change', rerender(e => { c.enreg.habitation = e.target.checked; }));
      on('#suRegion', 'change', rerender(e => { c.succ.region = e.target.value; }));
      on('#suMontant', 'change', rerender(e => { c.succ.montant = Math.max(0, +e.target.value || 0); }));
      on('#ixLoyer', 'change', rerender(e => { c.index.loyer = Math.max(0, +e.target.value || 0); }));
      on('#ixBase', 'change', rerender(e => { c.index.base = Math.max(0, +e.target.value || 0); }));
      on('#ixNouveau', 'change', rerender(e => { c.index.nouveau = Math.max(0, +e.target.value || 0); }));
    }
  }

  window.addEventListener('hashchange', render);
  render();
})();
