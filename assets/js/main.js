(() => {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.primary-nav');

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      toggle.setAttribute('aria-label', expanded ? 'Apri il menu' : 'Chiudi il menu');
      nav.classList.toggle('is-open', !expanded);
    });

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Apri il menu');
        nav.classList.remove('is-open');
      });
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) {
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Apri il menu');
        nav.classList.remove('is-open');
        toggle.focus();
      }
    });
  }

  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  const aiPanel=document.getElementById("site-ai-panel"),aiOpen=document.getElementById("site-ai-open"),aiClose=document.getElementById("site-ai-close"),aiForm=document.getElementById("site-ai-form"),aiInput=document.getElementById("site-ai-input"),aiMessages=document.getElementById("site-ai-messages");
  function toggleSiteAi(open){if(!aiPanel||!aiOpen)return;aiPanel.hidden=!open;aiOpen.setAttribute("aria-expanded",String(open));if(open)aiInput?.focus();}
  aiOpen?.addEventListener("click",()=>toggleSiteAi(aiPanel.hidden));aiClose?.addEventListener("click",()=>toggleSiteAi(false));
  function siteAnswer(q){const s=q.toLowerCase();if(/bracciale|finale|wearable/.test(s))return "La direzione finale di SENSE è un bracciale indossabile compatto, collegato alla companion app. Ergonomia, sensori, autonomia e prestazioni devono ancora essere sviluppati e verificati.";if(/prototipo|primo|ultrasuoni/.test(s))return "Il primo prototipo mostrato è un modulo sperimentale da banco con due trasduttori ultrasonici e un indicatore luminoso. Serve per prove iniziali, non è il prodotto finale.";if(/3d|mappa|spazio/.test(s))return "La companion app include una scena 3D interattiva dimostrativa. È una geometria simulata e non una scansione reale dell'ambiente.";if(/vendita|prezzo|acquist/.test(s))return "SENSE non è ancora in vendita. Prima occorrono un prototipo funzionante, verifiche, prezzo, supporto e condizioni commerciali.";if(/ai|intelligenza artificiale/.test(s))return "Questa è una preview conversazionale. Per collegare un vero modello AI serve un backend sicuro: la chiave API non deve mai essere inserita nel JavaScript pubblico.";return "Posso spiegarti il prototipo, il bracciale finale, la mappa 3D, i sensori e la companion app. Su quale aspetto vuoi informazioni?";}
  function addSiteMessage(t,kind){const e=document.createElement("p");e.className=kind==="user"?"site-ai-user":"site-ai-bot";e.textContent=t;aiMessages.appendChild(e);aiMessages.scrollTop=aiMessages.scrollHeight;}
  aiForm?.addEventListener("submit",e=>{e.preventDefault();const q=aiInput.value.trim();if(!q)return;addSiteMessage(q,"user");aiInput.value="";setTimeout(()=>addSiteMessage(siteAnswer(q),"bot"),150);});
})();