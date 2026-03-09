/* CMS LOADER v2 — charge les JSON et injecte dans le DOM */

/* Config centralisée — voir assets/js/site-config.js */
var GH_USER = (window.ZV_CONFIG && window.ZV_CONFIG.GH_USER) || 'llmdev-ops';
var GH_REPO = (window.ZV_CONFIG && window.ZV_CONFIG.GH_REPO) || 'llmdev-ops.github.io';

async function loadJSON(path) {
  try {
    var res = await fetch(path + '?v=' + Date.now());
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
  } catch(e) { console.warn('[CMS]', path, e.message); return null; }
}

function inject(key, value) {
  if (value === undefined || value === null) return;
  document.querySelectorAll('[data-cms="' + key + '"]').forEach(function(el) {
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') el.value = String(value);
    else el.innerHTML = String(value);
  });
}

function toParas(text) {
  if (!text) return '';
  return text.split('\n').filter(function(l){ return l.trim(); })
    .map(function(l){ return '<p>' + l + '</p>'; }).join('');
}

/* ══ GLOBAL ══ */
async function loadGlobal() {
  var d = await loadJSON('content/settings/global.json'); if (!d) return;
  ['email','adresse','linkedin','copyright'].forEach(function(k){ inject('global.'+k, d[k]); });
  document.querySelectorAll('[data-cms-href="global.linkedin"]').forEach(function(el){ el.href = d.linkedin_url||'#'; });
  document.querySelectorAll('[data-cms-href="global.email"]').forEach(function(el){ el.href = 'mailto:'+d.email; });
}

/* ══ RÉSULTATS ══ */
async function loadResultats() {
  var d = await loadJSON('content/settings/resultats.json'); if (!d) return;
  ['r1','r2','r3','r4'].forEach(function(k){
    inject('resultats.'+k+'_chiffre', d[k+'_chiffre']);
    inject('resultats.'+k+'_label',   d[k+'_label']);
  });
}

/* ══ ACCUEIL ══ */
async function loadAccueil() {
  var d = await loadJSON('content/pages/accueil.json'); if (!d) return;
  ['eyebrow','tagline1','tagline2','soustitre','cta1','cta2','badge','quote',
   'stat1_num','stat1_label','stat2_num','stat2_label','stat3_num','stat3_label',
   'piliers_tag','piliers_h2','piliers_lead','piliers_cta',
   'card1_icon','card1_titre','card1_texte','card2_icon','card2_titre','card2_texte','card3_icon','card3_titre','card3_texte',
   'coco_tag','coco_h2','coco_lead','coco_cta',
   'rse_tag','rse_h2','rse_lead','rse_cta',
   'cta_tag','cta_h2','cta_desc','cta_btn'
  ].forEach(function(k){ inject('accueil.'+k, d[k]); });
}

/* ══ QSN ══ */
async function loadQSN() {
  var d = await loadJSON('content/pages/qui-sommes-nous.json'); if (!d) return;
  ['mission_tag','mission_h2','discours1','discours2','discours3',
   'vision_tag','vision','mission','vision_baseline',
   'outils_tag','outils_h2','principes_tag','principes_h2',
   'histoire_tag','histoire_h2','histoire1','histoire2','histoire3',
   'cta_h2','cta_desc'
  ].forEach(function(k){ inject('qsn.'+k, d[k]); });
}

/* ══ PRINCIPES ══ */
async function loadPrincipes() {
  var d = await loadJSON('content/pages/principes.json'); if (!d||!d.items) return;
  var c = document.getElementById('principes-container'); if (!c) return;
  c.innerHTML = d.items.map(function(p){
    return '<div class="principe-card reveal"><h3>'+(p.icon||'')+' '+(p.titre||'')+'</h3><p>'+(p.description||'')+'</p></div>';
  }).join('');
}

/* ══ OFFRES ══ */
async function loadOffres() {
  var d = await loadJSON('content/pages/offres.json'); if (!d) return;
  ['section_tag','h2','lead','resultats_tag','cas_tag','cas_h2','cta_h2','cta_desc','cta_btn'
  ].forEach(function(k){ inject('offres.'+k, d[k]); });
  if (!d.items) return;
  var c = document.getElementById('offres-container'); if (!c) return;
  c.innerHTML = d.items.map(function(o,i){
    return '<div class="offre-card reveal">'
      +'<div class="offre-num">0'+(i+1)+' — '+(o.categorie||'')+'</div>'
      +'<h3>'+(o.titre||'')+'</h3>'
      +'<p>'+(o.description||'')+'</p>'
      +'<a href="#" class="offre-link">'+(o.cta_label||'En savoir plus')+'</a>'
    +'</div>';
  }).join('');
}

/* ══ CAS CLIENTS ══ */
window._casData = [];

async function loadCasClients() {
  var d = await loadJSON('content/pages/cas-clients.json'); if (!d||!d.items) return;
  window._casData = d.items;
  var c = document.getElementById('cas-container'); if (!c) return;
  c.innerHTML = d.items.map(function(cas, i){
    var resultats = (cas.resultats||[]).map(function(r){
      return '<div class="cas-result"><span class="cas-result-num">'+r.chiffre+'</span><span class="cas-result-label">'+r.label+'</span></div>';
    }).join('');
    return '<div class="cas-card reveal">'
      +'<blockquote>'+(cas.citation||'')+'</blockquote>'
      +'<h3>'+(cas.titre||'')+'</h3>'
      +'<p class="cas-desc">'+(cas.description||'')+'</p>'
      +resultats
      +'<button type="button" class="btn btn-outline zv-cas-btn" data-i="'+i+'" style="margin-top:1.2rem;width:auto;">Voir le cas client →</button>'
    +'</div>';
  }).join('');
}

/* Délégation au niveau document — zéro risque de timing ou de propagation */
document.addEventListener('click', function(e) {
  var btn = e.target.closest('.zv-cas-btn');
  if (!btn) return;
  e.preventDefault();
  e.stopPropagation();
  var idx = parseInt(btn.getAttribute('data-i'), 10);
  var cas = window._casData[idx];
  if (cas) {
    window.showCasDetail(cas);
  } else {
    console.error('[ZV] Cas introuvable index', idx, '| _casData:', window._casData.length, 'items');
  }
});

window.showCasDetail = function showCasDetail(cas) {
  function set(id, html){ var el=document.getElementById(id); if(el) el.innerHTML=html||''; }

  set('cd-titre',    cas.titre||'');
  set('cd-citation', cas.citation||'');
  set('cd-contexte', toParas(cas.contexte||''));
  set('cd-enjeu',    cas.enjeu ? '<p>'+cas.enjeu+'</p>' : '');
  set('cd-enjeu-mission', (cas.enjeu_mission||[]).map(function(m){ return '<li>'+m+'</li>'; }).join(''));
  set('cd-approche', toParas(cas.approche||''));
  set('cd-approche-points', (cas.approche_points||[]).map(function(m){ return '<li>'+m+'</li>'; }).join(''));
  set('cd-resultats', (cas.resultats_detail||cas.resultats||[]).map(function(r){
    return '<div class="cas-resultat-item"><div class="cas-resultat-chiffre">'+(r.chiffre||r.num||'')+'</div><div class="cas-resultat-texte">'+(r.texte||r.label||'')+'</div></div>';
  }).join(''));
  set('cd-benefices', (cas.benefices||[]).map(function(b){
    return '<div class="cas-benefice-item"><div class="cas-benefice-titre">'+(b.titre||'')+'</div><div class="cas-benefice-texte">'+(b.texte||'')+'</div></div>';
  }).join(''));
  set('cd-conclusion', cas.conclusion||'');

  showPage('cas-detail');
  window.scrollTo({top:0,behavior:'smooth'});
};

/* ══ FORMATION ══ */
async function loadFormation() {
  var d = await loadJSON('content/pages/formation.json'); if (!d) return;
  ['section_tag','titre','soustitre','qualiopi_tag','qualiopi_h2','texte1','texte2',
   'catalogue_tag','catalogue_h2','catalogue_desc','catalogue_btn'
  ].forEach(function(k){ inject('formation.'+k, d[k]); });
  document.querySelectorAll('[data-cms-href="formation.catalogue"]').forEach(function(el){ el.href = d.catalogue_url||'#'; });
}

/* ══ RECRUTEMENT ══ */
async function loadRecrutement() {
  var d = await loadJSON('content/pages/recrutement.json'); if (!d) return;
  ['section_tag','titre','soustitre','intro','tagline',
   'engagements_tag','engagements_h2','profils_tag','profils_h2','processus_tag','processus_h2',
   'cta_h2','cta_desc','cta_btn'
  ].forEach(function(k){ inject('recrutement.'+k, d[k]); });
  if (d.engagements) {
    var c1=document.getElementById('engagements-container');
    if (c1) c1.innerHTML = d.engagements.map(function(e){
      return '<div class="engagement-card reveal"><div class="icon">'+(e.icon||'')+'</div><h3>'+(e.titre||'')+'</h3><p>'+(e.texte||'')+'</p></div>';
    }).join('');
  }
  if (d.profils) {
    var c2=document.getElementById('profils-container');
    if (c2) c2.innerHTML = d.profils.map(function(p){
      return '<div class="profil-card reveal"><h3>'+(p.icon||'')+' '+(p.titre||'')+'</h3><p>'+(p.description||'')+'</p></div>';
    }).join('');
  }
  if (d.processus) {
    var c3=document.getElementById('processus-container');
    if (c3) c3.innerHTML = d.processus.map(function(p,i){
      var num = (i===d.processus.length-1) ? '✓' : (i+1);
      return '<div class="processus-step reveal"><div class="step-circle">'+num+'</div><h4>'+(p.titre||'')+'</h4><p>'+(p.description||'')+'</p></div>';
    }).join('');
  }
}

/* ══ RSE ══ */
async function loadRSE() {
  var d = await loadJSON('content/pages/rse.json'); if (!d) return;
  ['section_tag','titre','intro','axe1_titre','axe1_texte','axe2_titre','axe2_texte',
   'mesures_tag','mesures_h2','cta_h2','cta_desc','cta_btn'
  ].forEach(function(k){ inject('rse.'+k, d[k]); });
  if (d.mesures) {
    var c=document.getElementById('mesures-container');
    if (c) c.innerHTML = d.mesures.map(function(m){
      return '<div class="rse-mesure reveal"><h4>'+(m.icon||'')+' '+(m.titre||'')+'</h4><p>'+(m.texte||'')+'</p></div>';
    }).join('');
  }
}

/* ══ LOGOS CLIENTS (GitHub API) ══ */
async function loadLogosClients() {
  var container = document.getElementById('clients-logos'); if (!container) return;
  try {
    var res = await fetch('https://api.github.com/repos/'+GH_USER+'/'+GH_REPO+'/contents/assets/images/logos-clients');
    if (!res.ok) return;
    var files = await res.json();
    var exts = ['jpg','jpeg','png','webp','svg','avif','gif'];
    var logos = files.filter(function(f){ return exts.includes(f.name.split('.').pop().toLowerCase()); });
    if (!logos.length) return;
    container.innerHTML = logos.map(function(f){
      var url = 'https://'+GH_USER+'.github.io/'+f.path;
      var name = f.name.replace(/\.[^.]+$/,'').replace(/[-_]/g,' ');
      return '<img class="client-logo" src="'+url+'" alt="'+name+'" loading="lazy" />';
    }).join('');
  } catch(e) { /* garder les placeholders */ }
}

/* ══ INIT ══ */
async function initCMS() {
  await Promise.all([
    loadGlobal(), loadResultats(), loadAccueil(), loadQSN(), loadPrincipes(),
    loadOffres(), loadCasClients(), loadFormation(), loadRecrutement(), loadRSE(),
    loadLogosClients()
  ]);
  if (typeof observeReveals === 'function') observeReveals();
}

document.addEventListener('DOMContentLoaded', initCMS);
