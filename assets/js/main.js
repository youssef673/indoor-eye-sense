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
  const history=[];
  function toggleSiteAi(open){if(!aiPanel||!aiOpen)return;aiPanel.hidden=!open;aiOpen.setAttribute("aria-expanded",String(open));if(open)aiInput?.focus();}
  aiOpen?.addEventListener("click",()=>toggleSiteAi(aiPanel.hidden));aiClose?.addEventListener("click",()=>toggleSiteAi(false));
  function addSiteMessage(t,kind){const e=document.createElement("p");e.className=kind==="user"?"site-ai-user":"site-ai-bot";e.textContent=t;aiMessages.appendChild(e);aiMessages.scrollTop=aiMessages.scrollHeight;return e;}
  aiForm?.addEventListener("submit",async e=>{e.preventDefault();const q=aiInput.value.trim();if(!q)return;addSiteMessage(q,"user");aiInput.value="";const wait=addSiteMessage("Sto preparando la risposta…","bot");const payload=[...history,{role:"user",content:q}];const send=aiForm.querySelector('button[type="submit"]');if(send)send.disabled=true;
    try{const r=await fetch("https://indoor-eye-sense.vercel.app/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:payload})});const data=await r.json();if(!r.ok)throw new Error(data.error||"Servizio AI temporaneamente non disponibile.");wait.textContent=data.answer;history.push({role:"user",content:q},{role:"assistant",content:data.answer});}
    catch(err){wait.textContent=err.message||"Non riesco a raggiungere l'assistente. Riprova più tardi.";}
    finally{if(send)send.disabled=false;aiInput.focus();}
  });
})();