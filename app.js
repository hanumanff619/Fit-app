// Jednoduchá PWA tréninková appka pro dva profily (CZ, bez backendu)
(() => {
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  const navButtons = () => $$(".topbar nav button");

  // --- Úložiště (localStorage) ---
  const LS_KEY = "fitapp-v1";
  const defaults = {
    profily: [
      { id:"A", jmeno:"Holka", vyska:165, vaha:116, cil:"Zdraví & kondice" },
      { id:"B", jmeno:"Kluk",  vyska:186, vaha:146, cil:"Síla & kondice" }
    ],
    aktivniProfilId: "A",
    cviky: [{"id": "bench_db", "nazev": "Tlak s jednoručkami na lavičce", "partie": "Hrudník", "vybaveni": "Činky", "obtiznost": "Střední", "typ": "síla", "tipy": ["Lopatky stáhnout dozadu a dolů", "Zápěstí v rovině s předloktím"]}, {"id": "row_bent", "nazev": "Přítahy v předklonu", "partie": "Záda", "vybaveni": "Činka/činka EZ", "obtiznost": "Střední", "typ": "síla", "tipy": ["Rovná záda, neutrální krk", "Lokty táhni dozadu"]}, {"id": "ohp_db", "nazev": "Tlaky nad hlavu v sedě (jednoručky)", "partie": "Ramena", "vybaveni": "Činky", "obtiznost": "Střední", "typ": "síla", "tipy": ["Žebra dolů, core zpevnit", "Neprolamuj spodní záda"]}, {"id": "squat_box", "nazev": "Box dřep", "partie": "Spodní část těla", "vybaveni": "Multipress/činka", "obtiznost": "Lehká-Střední", "typ": "síla", "tipy": ["Kolena sledují špičky", "Kontrolovaný sed na box"]}, {"id": "rdl", "nazev": "Rumunský mrtvý tah", "partie": "Zadní řetězec", "vybaveni": "Činka", "obtiznost": "Střední", "typ": "síla", "tipy": ["Kyčelní ohyb, ne kulatá záda", "Činka blízko stehen"]}, {"id": "hip_thrust", "nazev": "Hip Thrust / Glute bridge", "partie": "Hýždě", "vybaveni": "Lavička/činka", "obtiznost": "Lehká-Střední", "typ": "síla", "tipy": ["Brada lehce u hrudi", "Vrchol s výdrží 1s"]}, {"id": "calf_raise", "nazev": "Výpony lýtek", "partie": "Lýtka", "vybaveni": "Stroj/činka", "obtiznost": "Lehká", "typ": "síla", "tipy": ["Plný rozsah pohybu", "Kontrolovaný návrat"]}, {"id": "plank", "nazev": "Plank", "partie": "Core", "vybaveni": "Podložka", "obtiznost": "Lehká", "typ": "mobilita", "tipy": ["Neprohýbat bedra", "Dech do břicha"]}, {"id": "facepull", "nazev": "Facepull s gumou/kladkou", "partie": "Zadní ramena", "vybaveni": "Guma/kladka", "obtiznost": "Lehká", "typ": "síla", "tipy": ["Lokty vysoko, palce k čelu"]}, {"id": "bike", "nazev": "Rotoped (čas)", "partie": "Kardio", "vybaveni": "Rotoped", "obtiznost": "Libovolná", "typ": "kardio", "tipy": ["Vol tempo Z2–Z3 podle dechu"]}, {"id": "stretch_ham", "nazev": "Protažení hamstringů", "partie": "Mobilita", "vybaveni": "Podložka", "obtiznost": "Lehká", "typ": "mobilita", "tipy": ["Jemné pnutí, ne bolest"]}],
    sablony: [{"id": "A_horni", "nazev": "Horní tělo", "polozky": [{"exerciseId": "bench_db", "series": 3, "reps": "6-10", "restSec": 90}, {"exerciseId": "row_bent", "series": 3, "reps": "8-12", "restSec": 90}, {"exerciseId": "ohp_db", "series": 3, "reps": "6-10", "restSec": 90}, {"exerciseId": "facepull", "series": 2, "reps": "12-15", "restSec": 60}, {"exerciseId": "plank", "series": 2, "reps": "40-60 s", "restSec": 45}]}, {"id": "B_spodni", "nazev": "Spodní tělo + rotoped", "polozky": [{"exerciseId": "squat_box", "series": 3, "reps": "6-10", "restSec": 120}, {"exerciseId": "rdl", "series": 3, "reps": "6-10", "restSec": 120}, {"exerciseId": "hip_thrust", "series": 3, "reps": "8-12", "restSec": 90}, {"exerciseId": "calf_raise", "series": 2, "reps": "12-15", "restSec": 60}, {"exerciseId": "bike", "series": 1, "reps": "15-20 min", "restSec": 0}]}, {"id": "C_okruh", "nazev": "Fullbody okruh", "polozky": [{"exerciseId": "row_bent", "series": 3, "reps": "40 s práce", "restSec": 30}, {"exerciseId": "bench_db", "series": 3, "reps": "40 s práce", "restSec": 30}, {"exerciseId": "squat_box", "series": 3, "reps": "40 s práce", "restSec": 30}, {"exerciseId": "plank", "series": 3, "reps": "40-60 s", "restSec": 30}, {"exerciseId": "stretch_ham", "series": 2, "reps": "45-60 s", "restSec": 15}]}],
    plany: [
      { id: "plan1", nazev:"Základ 3× týdně", tydny:[
        { dny: [
          { den:"A", sablonaId:"A_horni" },
          { den:"B", sablonaId:"B_spodni" },
          { den:"C", sablonaId:"C_okruh" }
        ]}
      ]}
    ],
    treninky: [], // záznamy dokončených tréninků
    nastaveni: { jednotky:"kg", tmavyRezim:true }
  };

  function load() {
    try { return JSON.parse(localStorage.getItem(LS_KEY)) || defaults; }
    catch { return defaults; }
  }
  function save(state) {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  }
  let state = load();

  // --- MET a výpočet kalorií ---
  // kcal/min = MET * 3.5 * vaha(kg) / 200
  const MET = {
    sila_mirna: 3.5, sila_intenzivni: 6.0,
    kardio_nizka: 5.0, kardio_stredni: 5.5, kardio_vyssi: 6.8, kardio_vysoka: 8.8,
    mobilita: 2.3
  };
  function kcalPerMin(vahaKg, met) {
    return met * 3.5 * vahaKg / 200;
  }
  function odhadKcal(profil, polozka) {
    const { cviky } = state;
    const ex = cviky.find(c=>c.id===polozka.exerciseId);
    if (!ex) return 0;
    const w = Number(profil.vaha) || 70;
    let prumMET = 3.0;
    if (ex.typ === "kardio") {
      // pokus o odhad podle "reps" textu (minuty)
      const m = (polozka.reps.match(/(\d+)\s*-\s*(\d+)/) || [])[1] ?
        ( (Number(polozka.reps.match(/(\d+)\s*-\s*(\d+)/)[1]) + Number(polozka.reps.match(/(\d+)\s*-\s*(\d+)/)[2]))/2 ) :
        Number((polozka.reps.match(/(\d+)\s*min/)||[])[1] || 15);
      prumMET = MET.kardio_stredni;
      return Math.round(kcalPerMin(w, prumMET) * m);
    }
    if (ex.typ === "mobilita") {
      // odhad 10 min celkem, 2 série
      const m = 10;
      prumMET = MET.mobilita;
      return Math.round(kcalPerMin(w, prumMET) * m);
    }
    // síla – průměr 4.2 MET (mix práce/pauzy)
    const m = 45/ (3); // hrubý odhad času na cvik v rámci tréninku (15 min/cvik)
    prumMET = 4.2;
    return Math.round(kcalPerMin(w, prumMET) * m);
  }

  // --- Router ---
  const routes = {
    home, workout, exercises, plans, stats, settings
  };
  function setActive(tab) {
    navButtons().forEach(b=>b.classList.toggle("active", b.dataset.nav===tab));
  }
  function navigate(tab) {
    window.location.hash = tab;
    render();
  }
  function render() {
    const tab = (location.hash || "#home").replace("#","");
    setActive(tab);
    const view = $("#view");
    view.innerHTML = routes[tab] ? routes[tab]() : "<div class='card'>Chybná stránka.</div>";
    bindActions();
  }

  // --- Pomocné ---
  function aktivniProfil() {
    return state.profil = state.profil || state.profil || state.profily.find(p=>p.id===state.aktivniProfilId) || state.profily[0];
  }
  function profById(id){return state.profily.find(p=>p.id===id);}
  function fmtKcal(k){return `${k} kcal`;}

  // --- View: Domů ---
  function home(){
    const profil = profById(state.aktivniProfilId);
    const posledni = [...state.treninky].slice(-3).reverse();
    const kcalDnes = posledni.filter(t=>t.datum === new Date().toISOString().slice(0,10))
      .reduce((s,t)=> s + (t.kcal[profil.id]||0), 0);

    return `
      <section class="card">
        <h2>Dnes</h2>
        <div class="grid cols-2">
          <div>
            <div class="kv">
              <div>Profil</div><div><select id="selProfil">${state.profily.map(p=>`<option value="${p.id}" ${p.id===state.aktivniProfilId?'selected':''}>${p.jmeno}</option>`).join("")}</select></div>
              <div>Výška</div><div><input id="pVyska" class="input" type="number" value="${profil.vyska}" /></div>
              <div>Váha</div><div><input id="pVaha" class="input" type="number" value="${profil.vaha}" /></div>
            </div>
            <div style="margin-top:10px" class="row">
              <button class="btn" id="btnUlozProfil">Uložit profil</button>
              <button class="btn ghost" id="btnNovyTrenink">Nový trénink</button>
            </div>
          </div>
          <div>
            <div class="item">
              <div><strong>Kalorie dnes</strong><br><small class="muted">${new Date().toLocaleDateString('cs-CZ')}</small></div>
              <span class="badge">${fmtKcal(kcalDnes)}</span>
            </div>
            <div class="list" style="margin-top:8px">
              ${posledni.map(t=>`
                <div class="item">
                  <div>${t.nazev}<br><small class="muted">${t.datum}</small></div>
                  <div><span class="badge">${t.kcal.A||0} A</span> <span class="badge">${t.kcal.B||0} B</span></div>
                </div>
              `).join("")}
            </div>
          </div>
        </div>
      </section>
    `;
  }

  // --- View: Trénink ---
  function workout(){
    const sab = state.sablony[0];
    const profilA = profById("A"), profilB = profById("B");
    // odhad kcal per user
    let kcalA=0, kcalB=0;
    sab.polozky.forEach(p=>{kcalA+=odhadKcal(profilA,p); kcalB+=odhadKcal(profilB,p);});
    return `
      <section class="card">
        <h2>Trénink – rychlý start</h2>
        <div class="kv">
          <div>Šablona</div><div><select id="selSablona">
            ${state.sablony.map(s=>`<option value="${s.id}">${s.nazev}</option>`).join("")}
          </select></div>
          <div>Název</div><div><input id="trenNazev" class="input" value="${sab.nazev}"></div>
          <div>Datum</div><div><input id="trenDatum" class="input" type="date" value="${new Date().toISOString().slice(0,10)}"></div>
        </div>
        <hr>
        <div class="list" id="seznamCviky">
          ${sab.polozky.map((p,i)=>{
            const ex = state.cviky.find(c=>c.id===p.exerciseId);
            const kcalA_i = odhadKcal(profilA,p);
            const kcalB_i = odhadKcal(profilB,p);
            return `<div class="item">
              <div><strong>${ex?ex.nazev:p.exerciseId}</strong><br><small class="muted">${p.series}× ${p.reps}${p.restSec?`, pauza ${p.restSec}s`:``}</small></div>
              <div style="display:flex;gap:6px">
                <span class="badge">${kcalA_i} A</span>
                <span class="badge">${kcalB_i} B</span>
              </div>
            </div>`;
          }).join("")}
        </div>
        <div class="row" style="margin-top:10px">
          <button class="btn" id="btnZahajit">Zahájit & Odškrtávat</button>
          <button class="btn ghost" id="btnUlozitOdhad">Uložit jako dokončené (odhad kcal)</button>
        </div>
      </section>
    `;
  }

  // --- View: Cviky ---
  function exercises(){
    return `
      <section class="card">
        <h2>Knihovna cviků</h2>
        <div class="list">
          ${state.cviky.map(c=>`
            <div class="item">
              <div><strong>${c.nazev}</strong><br><small class="muted">${c.partie} • ${c.vybaveni} • ${c.obtiznost}</small></div>
              <div class="badge">${c.typ}</div>
            </div>
          `).join("")}
        </div>
      </section>
    `;
  }

  // --- View: Plány ---
  function plans(){
    return `
      <section class="card">
        <h2>Plány</h2>
        <div class="list">
          ${state.plany.map(p=>`
            <div class="item">
              <div><strong>${p.nazev}</strong><br><small class="muted">${p.tydny.length} týdnů • předloha: ${state.sablony.length} šablon</small></div>
              <button class="btn ghost" data-edit-plan="${p.id}">Otevřít</button>
            </div>
          `).join("")}
        </div>
        <div class="row" style="margin-top:10px">
          <button class="btn" id="btnNovyPlan">Nový plán</button>
          <button class="btn ghost" id="btnImport">Import JSON</button>
          <button class="btn ghost" id="btnExport">Export JSON</button>
        </div>
      </section>
    `;
  }

  // --- View: Statistiky ---
  function stats(){
    const soucetA = state.treninky.reduce((s,t)=>s+(t.kcal.A||0),0);
    const soucetB = state.treninky.reduce((s,t)=>s+(t.kcal.B||0),0);
    return `
      <section class="card">
        <h2>Statistiky</h2>
        <div class="grid cols-2">
          <div class="item"><div><strong>Součet kalorií – A</strong><br><small class="muted">Celkem</small></div><span class="badge">${soucetA} kcal</span></div>
          <div class="item"><div><strong>Součet kalorií – B</strong><br><small class="muted">Celkem</small></div><span class="badge">${soucetB} kcal</span></div>
        </div>
        <h3>Poslední tréninky</h3>
        <table>
          <thead><tr><th>Datum</th><th>Název</th><th>A (kcal)</th><th>B (kcal)</th></tr></thead>
          <tbody>
            ${state.treninky.slice(-10).reverse().map(t=>`<tr><td>${t.datum}</td><td>${t.nazev}</td><td>${t.kcal.A||0}</td><td>${t.kcal.B||0}</td></tr>`).join("")}
          </tbody>
        </table>
      </section>
    `;
  }

  // --- View: Nastavení ---
  function settings(){
    return `
      <section class="card">
        <h2>Nastavení</h2>
        <div class="row">
          <button class="btn" id="btnInstalovat">Přidat na plochu</button>
          <button class="btn ghost" id="btnReset">Reset aplikace</button>
        </div>
        <p><small class="muted">Export/Import najdeš v Plány. Aplikace funguje offline a ukládá data do tohoto zařízení.</small></p>
        <div class="card">
          <h3>Odhad kalorií (MET)</h3>
          <pre class="code">kcal/min = MET × 3.5 × váha (kg) / 200</pre>
          <p><small class="muted">Síla prům. ~4.2 MET; Rotoped 5.0–8.8 MET; Mobilita 2.3 MET.</small></p>
        </div>
      </section>
    `;
  }

  // --- Akce / události ---
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt = e; });

  function bindActions(){
    navButtons().forEach(b=>b.onclick=()=>navigate(b.dataset.nav));
    const selProfil = $("#selProfil");
    if (selProfil) selProfil.onchange = e => { state.aktivniProfilId = e.target.value; save(state); render(); };
    const btnUlozProfil = $("#btnUlozProfil");
    if (btnUlozProfil) btnUlozProfil.onclick = () => {
      const p = profById(state.aktivniProfilId);
      p.vyska = Number($("#pVyska").value||p.vyska);
      p.vaha  = Number($("#pVaha").value||p.vaha);
      save(state); alert("Profil uložen.");
    };
    const btnNovyTrenink = $("#btnNovyTrenink");
    if (btnNovyTrenink) btnNovyTrenink.onclick = ()=>navigate("workout");

    const btnUlozitOdhad = $("#btnUlozitOdhad");
    if (btnUlozitOdhad) btnUlozitOdhad.onclick = () => {
      const sabId = $("#selSablona").value;
      const sab = state.sablony.find(s=>s.id===sabId);
      const nazev = $("#trenNazev").value || sab?.nazev || "Trénink";
      const datum = $("#trenDatum").value || new Date().toISOString().slice(0,10);
      const kcalA = sab.polozky.reduce((s,p)=> s+odhadKcal(profById("A"),p),0);
      const kcalB = sab.polozky.reduce((s,p)=> s+odhadKcal(profById("B"),p),0);
      state.treninky.push({ id: 't'+Date.now(), nazev, datum, kcal:{A:kcalA,B:kcalB}, polozky: sab.polozky });
      save(state); alert("Uloženo."); navigate("stats");
    };

    const btnZahajit = $("#btnZahajit");
    if (btnZahajit) btnZahajit.onclick = () => {
      const sabId = $("#selSablona").value;
      const sab = state.sablony.find(s=>s.id===sabId);
      const nazev = $("#trenNazev").value || sab?.nazev || "Trénink";
      const datum = $("#trenDatum").value || new Date().toISOString().slice(0,10);
      // jednoduché odškrtávání – modální stránka
      const view = $("#view");
      view.innerHTML = `
        <section class="card">
          <h2>${nazev} – živý režim</h2>
          <div class="list">
            ${sab.polozky.map((p,i)=>{
              const ex = state.cviky.find(c=>c.id===p.exerciseId);
              return `<label class="checkbox"><input type="checkbox" data-set-a="${i}"> A – ${ex?ex.nazev:p.exerciseId}</label>
                      <label class="checkbox"><input type="checkbox" data-set-b="${i}"> B – ${ex?ex.nazev:p.exerciseId}</label>`;
            }).join("")}
          </div>
          <div class="row" style="margin-top:10px">
            <button class="btn" id="btnDokoncit">Dokončit a uložit</button>
            <button class="btn ghost" id="btnZpet">Zpět</button>
          </div>
        </section>`;

      $("#btnZpet").onclick = render;
      $("#btnDokoncit").onclick = () => {
        const kcalA = sab.polozky.reduce((s,p)=> s+odhadKcal(profById("A"),p),0);
        const kcalB = sab.polozky.reduce((s,p)=> s+odhadKcal(profById("B"),p),0);
        state.treninky.push({ id: 't'+Date.now(), nazev, datum, kcal:{A:kcalA,B:kcalB}, polozky: sab.polozky });
        save(state); alert("Uloženo."); navigate("stats");
      };
    };

    const btnExport = $("#btnExport");
    if (btnExport) btnExport.onclick = () => {
      const data = JSON.stringify(state, null, 2);
      const blob = new Blob([data], {type:"application/json"});
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "fitapp-export.json"; a.click();
      URL.revokeObjectURL(url);
    };
    const btnImport = $("#btnImport");
    if (btnImport) btnImport.onclick = () => {
      const inp = document.createElement("input");
      inp.type = "file"; inp.accept="application/json";
      inp.onchange = e => {
        const file = e.target.files[0]; if (!file) return;
        const fr = new FileReader();
        fr.onload = () => {
          try {
            const imported = JSON.parse(fr.result);
            localStorage.setItem(LS_KEY, JSON.stringify(imported));
            state = imported;
            alert("Import hotov."); render();
          } catch { alert("Chyba importu."); }
        };
        fr.readAsText(file);
      };
      inp.click();
    };

    const btnReset = $("#btnReset");
    if (btnReset) btnReset.onclick = () => {
      if (confirm("Smazat veškerá data v tomto zařízení?")) {
        localStorage.removeItem(LS_KEY);
        state = load();
        render();
      }
    };

    const btnInst = $("#btnInstalovat");
    if (btnInst) btnInst.onclick = async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        deferredPrompt = null;
      } else {
        alert("Instalace není k dispozici – otevři v prohlížeči (Chrome/Edge) a zkus znovu.");
      }
    };
  }

  // --- Init ---
  window.addEventListener("hashchange", render);
  navButtons().forEach(b=>b.addEventListener("click", ()=>navigate(b.dataset.nav)));
  render();
})();