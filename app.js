/* Juridesk — démo statique. Données fictives, aucun conseil juridique. */
(function () {
  'use strict';

  // ---------- Données fictives ----------
  const DOSSIERS = [
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

  // ---------- Utilitaires ----------
  const $ = (sel, root) => (root || document).querySelector(sel);
  const view = $('#view');
  const eur = n => n.toLocaleString('fr-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const fr = iso => { const [y, m, d] = iso.split('-'); return `${d}/${m}/${y}`; };
  const daysBetween = (a, b) => Math.max(0, Math.round((new Date(b) - new Date(a)) / 86400000));
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const today = '2026-10-19';

  const state = {
    dossier: DOSSIERS[0].id,
    atelier: { step: 1, modele: 'med', lang: 'fr', delai: 15, interets: true, indemnite: true, penale: true, plan: false, signataire: 'Me Claire Demo', barreau: 'Charleroi', cabinet: 'Cabinet Demo & Associés', adresseCab: 'Boulevard Tirou 15, 6000 Charleroi' },
    calc: { regime: 'b2b', taux: 12, arrete: today, indemnite: true, penale: true, penaleTaux: 10, frais: false }
  };

  const currentDossier = () => DOSSIERS.find(d => d.id === state.dossier) || DOSSIERS[0];

  // ---------- Calcul ----------
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

  // ---------- Vues ----------
  function pageHead(kicker, title, actions) {
    return `<header class="page-head"><div class="titles"><div class="kicker">${kicker}</div><h1>${title}</h1></div><div class="actions">${actions || ''}</div></header>`;
  }

  function viewDossiers() {
    const rows = DOSSIERS.map(d => `<tr class="clickable" data-go="#/dossier/${d.id}"><td>${d.id}</td><td class="sans"><strong>${esc(d.titre)}</strong></td><td class="sans">${esc(d.type)}</td><td class="sans"><span class="badge ${d.etape === 'Brouillon' ? 'muted' : ''}">${esc(d.etape)}</span></td><td>${d.echeance === '—' ? '—' : fr(d.echeance)}</td></tr>`).join('');
    return pageHead('Dossiers · 3 actifs', 'Mes dossiers', `<a class="btn primary" href="#/atelier">+ Rédiger un acte</a>`) +
      `<div class="stats">
        <div class="stat"><div class="kicker">Dossiers actifs</div><div class="val">3</div></div>
        <div class="stat"><div class="kicker">Échéances sous 15 j</div><div class="val" style="color:var(--warn)">2</div></div>
        <div class="stat"><div class="kicker">Créances en recouvrement</div><div class="val">${eur(12480)}</div></div>
        <div class="stat"><div class="kicker">Actes à signer</div><div class="val">1</div></div>
      </div>
      <section class="card"><h2>Tous les dossiers</h2><div class="table-wrap"><table><thead><tr><th>Référence</th><th>Dossier</th><th>Type</th><th>Étape</th><th>Prochaine échéance</th></tr></thead><tbody>${rows}</tbody></table></div></section>`;
  }

  function viewDossier(id) {
    const d = DOSSIERS.find(x => x.id === id);
    if (!d) return `<div class="empty">Dossier introuvable.</div>`;
    state.dossier = d.id;
    const c = calcul(d, state.calc);
    const pieces = d.pieces.map(p => `<div class="row"><span class="dot ${p.dot}"></span>${esc(p.label)}<span class="right">${p.tag}</span></div>`).join('');
    const tl = d.timeline.map((t, i) => `<div class="tl"><div class="rail"><i class="${t.state === 'future' ? 'future' : t.state === 'later' ? 'later' : ''}"></i>${i < d.timeline.length - 1 ? '<b></b>' : ''}</div><div class="body"><div class="date ${t.state === 'future' ? 'warn' : ''}">${t.date}</div><div class="label">${esc(t.label)}</div></div></div>`).join('');
    const party = p => `<div class="party"><div class="kicker">${p.role}</div><strong>${esc(p.nom)}</strong><div class="mono">BCE ${p.bce}</div><div>${esc(p.adresse)}</div></div>`;
    return pageHead(`Dossier · ${d.id}`, `${esc(d.titre)} — ${esc(d.type)}`,
      `<a class="btn" href="#/calculateurs">Calculer la créance</a><a class="btn primary" href="#/atelier">+ Rédiger un acte</a>`) +
      `<div class="stats">
        <div class="stat"><div class="kicker">Principal dû</div><div class="val">${d.factures.length ? eur(c.principal) : '—'}</div></div>
        <div class="stat"><div class="kicker">Étape</div><div class="val text" style="color:var(--accent)">${esc(d.etape)}</div></div>
        <div class="stat"><div class="kicker">Prochaine échéance</div><div class="val text" style="color:var(--warn)">${d.echeance === '—' ? '—' : 'Délai — ' + fr(d.echeance)}</div></div>
        <div class="stat"><div class="kicker">Prescription</div><div class="val text">${d.prescription}</div></div>
      </div>
      <div class="grid-2">
        <section class="card"><h2>Parties</h2><div class="fields-2">${party(d.client)}${party(d.adverse)}</div><h2>Pièces du dossier</h2><div class="list">${pieces}</div></section>
        <section class="card"><h2>Chronologie &amp; échéancier</h2><div class="timeline">${tl}</div><div class="assistant"><strong>Assistant Juridesk</strong> — ${esc(d.assistant)}</div></section>
      </div>`;
  }

  function viewAtelier() {
    const a = state.atelier, d = currentDossier(), c = calcul(d, state.calc);
    const steps = ['Modèle', 'Parties', 'Créance', 'Clauses', 'Relecture & envoi'];
    const chips = steps.map((s, i) => `<button type="button" class="chip mono ${a.step === i + 1 ? 'on' : a.step > i + 1 ? 'done' : ''}" data-step="${i + 1}">${i + 1} · ${s}</button>`).join('');
    const modeles = MODELES.map(m => `<label class="check"><input type="radio" name="modele" value="${m.id}" ${a.modele === m.id ? 'checked' : ''}><span><span class="t">${esc(m.nom)}</span><span class="d">${m.famille} · ${m.cible}</span></span></label>`).join('');
    const dossiers = DOSSIERS.map(x => `<option value="${x.id}" ${x.id === d.id ? 'selected' : ''}>${x.id} — ${esc(x.titre)}</option>`).join('');
    const factures = d.factures.length ? d.factures.map(f => `<div class="row"><span class="dot"></span>Facture ${f.num} · échue le ${fr(f.echeance)}<span class="right">${eur(f.montant)}</span></div>`).join('') : `<div class="row"><span class="dot muted"></span>Aucune facture dans ce dossier<span class="right">—</span></div>`;

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
          <div class="party"><div class="kicker">${d.client.role}</div><strong>${esc(d.client.nom)}</strong><div class="mono">BCE ${d.client.bce}</div><div>${esc(d.client.adresse)}</div></div>
          <div class="party"><div class="kicker">${d.adverse.role}</div><strong>${esc(d.adverse.nom)}</strong><div class="mono">BCE ${d.adverse.bce}</div><div>${esc(d.adverse.adresse)}</div></div>
        </div>
        <div class="fields-2">
          <div class="field"><label for="signataire">Signataire</label><input id="signataire" class="input" value="${esc(a.signataire)}"></div>
          <div class="field"><label for="barreau">Barreau</label><input id="barreau" class="input" value="${esc(a.barreau)}"></div>
        </div>
      </div>
      <div class="steps ${a.step === 3 ? 'on' : ''}">
        <h2>Étape 3 — Créance</h2>
        <div class="list">${factures}</div>
        <div class="assistant"><strong>Assistant Juridesk</strong> — Principal : <span class="mono">${eur(c.principal)}</span>. Le décompte détaillé (intérêts, indemnité, clause pénale) est calculé dans <a href="#/calculateurs">Calculateurs</a> et injecté automatiquement dans l'acte.</div>
        <div class="field"><label for="delai">Délai de paiement accordé</label><select id="delai" class="input"><option value="8" ${a.delai == 8 ? 'selected' : ''}>8 jours</option><option value="15" ${a.delai == 15 ? 'selected' : ''}>15 jours</option><option value="30" ${a.delai == 30 ? 'selected' : ''}>30 jours</option></select></div>
      </div>
      <div class="steps ${a.step === 4 ? 'on' : ''}">
        <h2>Étape 4 — Clauses à inclure</h2>
        <div class="list">
          <label class="check"><input type="checkbox" data-clause="interets" ${a.interets ? 'checked' : ''}><span><span class="t">Intérêts de retard — loi du 2 août 2002 (B2B)</span><span class="d">Taux de référence BCE majoré, calculé depuis l'échéance de chaque facture.</span></span></label>
          <label class="check"><input type="checkbox" data-clause="indemnite" ${a.indemnite ? 'checked' : ''}><span><span class="t">Indemnité forfaitaire de recouvrement (40 €)</span><span class="d">Par facture impayée, en plus des intérêts.</span></span></label>
          <label class="check"><input type="checkbox" data-clause="penale" ${a.penale ? 'checked' : ''}><span><span class="t">Clause pénale prévue aux CGV (10 %)</span><span class="d">Détectée dans les conditions générales signées du dossier.</span></span></label>
          <label class="check"><input type="checkbox" data-clause="plan" ${a.plan ? 'checked' : ''}><span><span class="t">Proposition de plan d'apurement</span><span class="d">Ouvre la porte à un règlement amiable en 3 mensualités.</span></span></label>
        </div>
        <div class="assistant"><strong>Assistant Juridesk</strong> — ${d.regime === 'b2b' ? 'Le débiteur est une société : le régime B2B s\'applique, les règles du Code de droit économique sur les clauses abusives B2C ne sont pas pertinentes ici.' : 'La partie adverse agit avec un consommateur : les règles B2C du Code de droit économique s\'appliquent (délai de 14 jours avant tout frais, plafonds d\'indemnités).'}</div>
      </div>
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
      `<button type="button" class="btn" id="langToggle">${a.lang === 'fr' ? 'Version NL' : 'Version FR'}</button><button type="button" class="btn" id="exportBtn">Exporter Word / PDF</button><a class="btn" href="#/dossier/${d.id}">Retour au dossier</a>`) +
      `<div class="chips">${chips}</div>
      <div class="grid-wide">
        <section class="card">${left}</section>
        <section class="card"><div style="display:flex;align-items:center;gap:12px"><h2>Aperçu du document</h2><span class="hint" style="margin-left:auto">${a.lang.toUpperCase()} · mis à jour en direct</span></div><div class="doc">${docText(d, a, c)}</div></section>
      </div>`;
  }

  function docText(d, a, c) {
    const total = eur(c.total), princ = eur(c.principal);
    const nums = d.factures.length ? `${d.factures[0].num} à ${d.factures[d.factures.length - 1].num}` : '[N° FACTURES]';
    const head = `<div class="small">${esc(a.cabinet)} · ${esc(a.adresseCab)} · contact@cabinet-demo.be</div>`;
    if (a.modele !== 'med') {
      const m = MODELES.find(x => x.id === a.modele);
      return head + `<p><strong>${esc(m.nom)}</strong></p><p>Entre <strong>${esc(d.client.nom)}</strong> (BCE ${d.client.bce}), ci-après « ${a.modele === 'bail' ? 'le locataire' : 'le prestataire'} », et <strong>${esc(d.adverse.nom)}</strong> (BCE ${d.adverse.bce}), ci-après « ${a.modele === 'bail' ? 'le bailleur' : 'le client'} ».</p><p><mark>Le corps du modèle « ${esc(m.nom)} » sera généré ici à partir des réponses du questionnaire.</mark> Dans cette démo, seule la mise en demeure pour factures impayées est entièrement rédigée.</p><div class="sig">${esc(a.signataire)}<br><span class="small">Avocat au barreau de ${esc(a.barreau)}</span></div>`;
    }
    if (a.lang === 'nl') {
      const clauses = [];
      if (a.interets) clauses.push('<mark>de wettelijke verwijlinteresten vanaf de vervaldag van elke factuur</mark>');
      if (a.indemnite) clauses.push('<mark>de forfaitaire vergoeding van 40 € per factuur</mark>');
      if (a.penale) clauses.push('<mark>het schadebeding van 10 % voorzien in artikel 8 van de algemene voorwaarden</mark>');
      return head + `<div class="right">Charleroi, 19 oktober 2026</div><div>${esc(d.adverse.nom)}<br>${esc(d.adverse.adresse)}</div><div><strong>Per elektronische aangetekende zending<br>Betreft: ingebrekestelling — facturen nr. ${nums}</strong></div><p>Geachte mevrouw, geachte heer,</p><p>Wij treden op voor <strong>${esc(d.client.nom)}</strong>, onze cliënte, die van u een hoofdsom van <strong>${princ}</strong> te vorderen heeft uit hoofde van bovenvermelde, vervallen en onbetaald gebleven facturen, ondanks herinnering van 2 oktober 2026.</p>${clauses.length ? `<p>Overeenkomstig de wet van 2 augustus 2002 betreffende de bestrijding van de betalingsachterstand bij handelstransacties wordt dit bedrag vermeerderd met ${clauses.join(', ')}.</p>` : ''}<p>Wij stellen u in gebreke het totaalbedrag van <strong>${total}</strong> te betalen binnen <strong>${a.delai} dagen</strong> na heden op rekening [IBAN VAN DE CLIËNT].${a.plan ? ' <mark>Onze cliënte staat open voor een afbetalingsplan in drie maandelijkse schijven, mits schriftelijke bevestiging binnen dezelfde termijn.</mark>' : ''} Bij gebreke daarvan zullen wij zonder verdere kennisgeving een gerechtelijke procedure inleiden, op uw kosten en risico.</p><p>Met de meeste hoogachting,</p><div class="sig">${esc(a.signataire)}<br><span class="small">Advocaat aan de balie van ${esc(a.barreau)}</span></div>`;
    }
    const clauses = [];
    if (a.interets) clauses.push('<mark>des intérêts de retard au taux légal depuis l\'échéance de chaque facture</mark>');
    if (a.indemnite) clauses.push('<mark>de l\'indemnité forfaitaire de 40 € par facture</mark>');
    if (a.penale) clauses.push('<mark>de la clause pénale de 10 % prévue à l\'article 8 des conditions générales</mark>');
    return head + `<div class="right">Charleroi, le 19 octobre 2026</div><div>${esc(d.adverse.nom)}<br>${esc(d.adverse.adresse)}</div><div><strong>Par recommandé électronique<br>Objet : mise en demeure — factures n° ${nums}</strong></div><p>Madame, Monsieur,</p><p>Nous intervenons pour le compte de la société <strong>${esc(d.client.nom)}</strong>, notre cliente, créancière à votre égard d'un montant en principal de <strong>${princ}</strong> au titre des factures ci-dessus, échues et restées impayées malgré rappel du 2 octobre 2026.</p>${clauses.length ? `<p>Conformément à la loi du 2 août 2002 concernant la lutte contre le retard de paiement dans les transactions commerciales, ce montant est majoré ${clauses.join(', ')}.</p>` : ''}<p>Nous vous mettons en demeure de régler la somme totale de <strong>${total}</strong> dans un délai de <strong>${a.delai} jours</strong> à dater de la présente, sur le compte [IBAN DU CLIENT].${a.plan ? ' <mark>Notre cliente est disposée à accepter un plan d\'apurement en trois mensualités, moyennant confirmation écrite dans le même délai.</mark>' : ''} À défaut, notre cliente nous a chargés d'introduire une procédure judiciaire sans autre avis, à vos frais et risques.</p><p>Veuillez agréer, Madame, Monsieur, l'expression de nos salutations distinguées.</p><div class="sig">${esc(a.signataire)}<br><span class="small">Avocat au barreau de ${esc(a.barreau)}</span></div>`;
  }

  function viewCalculateurs() {
    const d = currentDossier(), c = state.calc, r = calcul(d, c);
    const dossiers = DOSSIERS.map(x => `<option value="${x.id}" ${x.id === d.id ? 'selected' : ''}>${x.id} — ${esc(x.titre)}</option>`).join('');
    const rows = r.lignes.length ? r.lignes.map(l => `<tr><td>${l.num}</td><td>${fr(l.echeance)}</td><td class="r">${l.jours}</td><td class="r">${eur(l.montant)}</td><td class="r acc">${eur(l.interets)}</td><td class="r">${eur(l.indem)}</td></tr>`).join('') : `<tr><td colspan="6" class="sans muted">Ce dossier ne contient aucune facture.</td></tr>`;
    return pageHead(`Calculateurs · Décompte de créance · ${d.id}`, 'Décompte de créance — intérêts, indemnité et clause pénale',
      `<button type="button" class="btn" id="exportCalc">Exporter le décompte</button><a class="btn primary" href="#/atelier">Insérer dans l'acte</a>`) +
      `<div class="chips"><span class="chip on">Intérêts de retard</span><span class="chip">Délais &amp; prescription</span><span class="chip">Droits d'enregistrement</span><span class="chip">Droits de succession</span><span class="chip">Indexation de loyer</span></div>
      <div class="grid-wide">
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
          <div class="card"><h2>Factures du dossier</h2><div class="table-wrap"><table><thead><tr><th>Facture</th><th>Échéance</th><th class="r">Jours</th><th class="r">Principal</th><th class="r">Intérêts</th><th class="r">Indemnité</th></tr></thead><tbody>${rows}</tbody></table></div></div>
          <div class="stats">
            <div class="stat"><div class="kicker">Principal</div><div class="val">${eur(r.principal)}</div></div>
            <div class="stat"><div class="kicker">Intérêts + indemnités</div><div class="val" style="color:var(--accent)">${eur(r.interets + r.indem)}</div></div>
            <div class="stat"><div class="kicker">Clause pénale${c.frais ? ' + frais' : ''}</div><div class="val">${eur(r.penale + r.frais)}</div></div>
            <div class="stat hl"><div class="kicker" style="color:var(--accent)">Total réclamé au ${fr(c.arrete)}</div><div class="val" style="font-size:28px">${eur(r.total)}</div></div>
          </div>
          <div class="assistant warn"><strong>Point d'attention</strong> — Le cumul d'une clause pénale et des intérêts légaux peut être réduit par le juge s'il est jugé manifestement excessif. Juridesk le signale ; la décision reste celle du praticien.</div>
        </section>
      </div>`;
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
      case 'atelier': html = viewAtelier(); break;
      case 'calculateurs': html = viewCalculateurs(); break;
      case 'signatures': html = viewSignatures(); break;
      case 'clients': html = viewClients(); break;
      default: html = viewDossiers(); nav = 'dossiers';
    }
    view.innerHTML = html;
    document.querySelectorAll('.nav-link').forEach(a => a.classList.toggle('active', a.dataset.nav === nav));
    bind(route);
    window.scrollTo(0, 0);
  }

  function bind(route) {
    view.querySelectorAll('[data-go]').forEach(el => el.addEventListener('click', () => { location.hash = el.dataset.go; }));
    if (route === 'atelier') {
      const a = state.atelier;
      view.querySelectorAll('[data-step]').forEach(b => b.addEventListener('click', () => { a.step = +b.dataset.step; render(); }));
      $('#prev').addEventListener('click', () => { a.step = Math.max(1, a.step - 1); render(); });
      $('#next').addEventListener('click', () => { a.step = Math.min(5, a.step + 1); render(); });
      $('#langToggle').addEventListener('click', () => { a.lang = a.lang === 'fr' ? 'nl' : 'fr'; render(); });
      $('#exportBtn').addEventListener('click', () => alert('Démo : l\'export Word / PDF sera généré côté serveur dans la version complète.'));
      $('#dossierSel').addEventListener('change', e => { state.dossier = e.target.value; render(); });
      view.querySelectorAll('input[name=modele]').forEach(r => r.addEventListener('change', () => { a.modele = r.value; render(); }));
      $('#signataire').addEventListener('input', e => { a.signataire = e.target.value; $('.doc').innerHTML = docText(currentDossier(), a, calcul(currentDossier(), state.calc)); });
      $('#barreau').addEventListener('input', e => { a.barreau = e.target.value; $('.doc').innerHTML = docText(currentDossier(), a, calcul(currentDossier(), state.calc)); });
      $('#delai').addEventListener('change', e => { a.delai = +e.target.value; render(); });
      view.querySelectorAll('[data-clause]').forEach(cb => cb.addEventListener('change', () => { a[cb.dataset.clause] = cb.checked; state.calc.indemnite = a.indemnite; state.calc.penale = a.penale; render(); }));
      $('#signer').addEventListener('click', () => { $('#signMsg').textContent = 'Démo : en production, itsme s\'ouvre ici pour signer, puis le recommandé électronique est envoyé et journalisé.'; });
    }
    if (route === 'calculateurs') {
      const c = state.calc;
      const upd = () => render();
      $('#calcDossier').addEventListener('change', e => { state.dossier = e.target.value; upd(); });
      $('#regime').addEventListener('change', e => { c.regime = e.target.value; upd(); });
      $('#taux').addEventListener('change', e => { c.taux = Math.max(0, +e.target.value || 0); upd(); });
      $('#arrete').addEventListener('change', e => { if (e.target.value) { c.arrete = e.target.value; upd(); } });
      $('#optIndem').addEventListener('change', e => { c.indemnite = e.target.checked; state.atelier.indemnite = c.indemnite; upd(); });
      $('#optPenale').addEventListener('change', e => { c.penale = e.target.checked; state.atelier.penale = c.penale; upd(); });
      $('#optFrais').addEventListener('change', e => { c.frais = e.target.checked; upd(); });
      $('#exportCalc').addEventListener('click', () => alert('Démo : export du décompte en PDF dans la version complète.'));
    }
  }

  window.addEventListener('hashchange', render);
  render();
})();
