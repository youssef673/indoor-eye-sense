(() => {
  const views = [...document.querySelectorAll("[data-view]")];
  const navItems = [...document.querySelectorAll("[data-view-target]")];
  const status = document.getElementById("app-status");
  const toast = (message) => {
    if (!status) return;
    status.textContent = message;
    status.classList.add("is-visible");
    window.clearTimeout(toast.timer);
    toast.timer = window.setTimeout(() => status.classList.remove("is-visible"), 3200);
  };
  function showView(name) {
    views.forEach((view) => view.classList.toggle("is-visible", view.dataset.view === name));
    navItems.forEach((item) => {
      const active = item.dataset.viewTarget === name;
      item.classList.toggle("is-active", active);
      if (active) item.setAttribute("aria-current", "page");
      else item.removeAttribute("aria-current");
    });
    const heading = document.querySelector(`[data-view="${name}"] h1`);
    if (heading) heading.setAttribute("tabindex", "-1"), heading.focus({preventScroll:true});
  }
  navItems.forEach((item) => item.addEventListener("click", () => showView(item.dataset.viewTarget)));
  document.querySelectorAll("[data-go-view]").forEach((item) => item.addEventListener("click", () => showView(item.dataset.goView)));

  document.querySelectorAll("[data-setting]").forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const active = toggle.getAttribute("aria-checked") === "true";
      toggle.setAttribute("aria-checked", String(!active));
      toggle.classList.toggle("is-on", !active);
      toast(`Preferenza demo ${!active ? "attivata" : "disattivata"}. Nessun dispositivo è stato modificato.`);
    });
  });

  const range = document.getElementById("intensity");
  const rangeValue = document.getElementById("intensity-value");
  if (range && rangeValue) range.addEventListener("input", () => { rangeValue.value = `${range.value} / 5`; rangeValue.textContent = `${range.value} / 5`; });

  const previewButton = document.getElementById("preview-feedback");
  const previewPanel = document.getElementById("feedback-preview");
  if (previewButton && previewPanel) previewButton.addEventListener("click", () => {
    const enabled = document.querySelector('[data-setting="haptic"]')?.getAttribute("aria-checked") === "true";
    if (!enabled) { toast("Attiva l'anteprima aptica per visualizzare l'esempio."); return; }
    previewPanel.classList.remove("is-active");
    void previewPanel.offsetWidth;
    previewPanel.classList.add("is-active");
    previewPanel.querySelector("b").textContent = "Sequenza dimostrativa visualizzata";
    previewPanel.querySelector("small").textContent = "Effetto grafico soltanto · nessuna vibrazione reale";
    toast("Anteprima grafica completata. Nessun feedback fisico è stato generato.");
  });

  const reset = document.getElementById("reset-settings");
  if (reset) reset.addEventListener("click", () => {
    document.querySelectorAll("[data-setting]").forEach((toggle) => {
      toggle.setAttribute("aria-checked", "true");
      toggle.classList.add("is-on");
    });
    if (range && rangeValue) { range.value = "3"; rangeValue.value = "3 / 5"; rangeValue.textContent = "3 / 5"; }
    if (previewPanel) {
      previewPanel.classList.remove("is-active");
      previewPanel.querySelector("b").textContent = "Anteprima pronta";
      previewPanel.querySelector("small").textContent = "Premi il pulsante per visualizzare un esempio";
    }
    toast("Le preferenze della demo sono state ripristinate.");
  });

  // Interactive 3D room preview: synthetic demonstration geometry.
  function initScene(canvas) {
    const ctx=canvas.getContext("2d"); if(!ctx)return;
    let yaw=-0.72,pitch=0.72,zoom=1,dragging=false,lastX=0,lastY=0;
    const project=(p,w,h,dpr)=>{const x=p[0]*Math.cos(yaw)-p[1]*Math.sin(yaw);const y=p[0]*Math.sin(yaw)+p[1]*Math.cos(yaw);const yy=y*Math.cos(pitch)-p[2]*Math.sin(pitch);const z=y*Math.sin(pitch)+p[2]*Math.cos(pitch);const k=5/(7-z);const scale=Math.min(w,h)*.12*zoom;return [w*.5+x*scale*k,h*.57+yy*scale*k];};
    function draw(){
      const w=canvas.width,h=canvas.height,dpr=Math.min(window.devicePixelRatio||1,2);ctx.clearRect(0,0,w,h);
      const line=(a,b,color,width)=>{const p=project(a,w,h,dpr),q=project(b,w,h,dpr);ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.lineTo(q[0],q[1]);ctx.strokeStyle=color;ctx.lineWidth=(width||1)*dpr;ctx.stroke();};
      const poly=(pts,fill,stroke)=>{ctx.beginPath();pts.forEach((v,i)=>{const p=project(v,w,h,dpr);i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]);});ctx.closePath();ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle=stroke;ctx.lineWidth=1.2*dpr;ctx.stroke();};
      for(let i=-4;i<=4;i++){line([i,-3,0],[i,3,0],"rgba(72,119,108,.19)");line([-4,i*.75,0],[4,i*.75,0],"rgba(72,119,108,.19)");}
      poly([[-3,-2.2,0],[3,-2.2,0],[3,2.2,0],[-3,2.2,0]],"rgba(220,237,226,.3)","#8cae9c");
      line([-3,-2.2,0],[-3,-2.2,2.3],"#6d9787",2);line([-3,-2.2,2.3],[3,-2.2,2.3],"#6d9787",2);line([3,-2.2,2.3],[3,-2.2,0],"#6d9787",2);
      line([-3,-2.2,2.3],[-3,2.2,2.3],"rgba(109,151,135,.7)");line([3,-2.2,2.3],[3,2.2,2.3],"rgba(109,151,135,.7)");
      function box(x,y,sx,sy,sz,label){
        const a=[x-sx/2,y-sy/2,0],b=[x+sx/2,y-sy/2,0],c=[x+sx/2,y+sy/2,0],d=[x-sx/2,y+sy/2,0],A=[a[0],a[1],sz],B=[b[0],b[1],sz],C=[c[0],c[1],sz],D=[d[0],d[1],sz];
        poly([a,b,B,A],"#b9d7c8","#729d8b");poly([b,c,C,B],"#9fc5b3","#729d8b");poly([d,a,A,D],"#d3e7da","#729d8b");poly([A,B,C,D],"#e0eee4","#729d8b");
        const p=project([x,y,sz+.18],w,h,dpr);ctx.fillStyle="#426b5d";ctx.font=(9*dpr)+"px ui-monospace,monospace";ctx.textAlign="center";ctx.fillText(label,p[0],p[1]);
      }
      box(-1.55,-.75,1.05,.85,1.15,"OSTACOLO A");box(1.35,.45,.85,.75,.8,"OSTACOLO B");
      const p=project([0,1.35,.1],w,h,dpr);ctx.beginPath();ctx.arc(p[0],p[1],5*dpr,0,Math.PI*2);ctx.fillStyle="#0d8071";ctx.fill();ctx.strokeStyle="#fff";ctx.lineWidth=2*dpr;ctx.stroke();ctx.fillStyle="#477266";ctx.font=(8*dpr)+"px ui-monospace,monospace";ctx.textAlign="center";ctx.fillText("POSIZIONE DEMO",p[0],p[1]+18*dpr);
    }
    const resize=()=>{const r=canvas.getBoundingClientRect(),d=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.max(1,Math.round(r.width*d));canvas.height=Math.max(1,Math.round(r.height*d));draw();};
    canvas.addEventListener("pointerdown",e=>{dragging=true;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture(e.pointerId);});
    canvas.addEventListener("pointermove",e=>{if(!dragging)return;const dx=e.clientX-lastX,dy=e.clientY-lastY;lastX=e.clientX;lastY=e.clientY;yaw+=dx*.009;pitch=Math.max(.25,Math.min(1.2,pitch+dy*.006));draw();});
    canvas.addEventListener("pointerup",()=>dragging=false);canvas.addEventListener("pointercancel",()=>dragging=false);
    canvas.addEventListener("wheel",e=>{e.preventDefault();zoom=Math.max(.7,Math.min(1.5,zoom-e.deltaY*.001));draw();},{passive:false});
    const reset=canvas.closest(".scene3d-wrap")?.querySelector("[data-scene-reset]");if(reset)reset.addEventListener("click",()=>{yaw=-.72;pitch=.72;zoom=1;draw();});
    if("ResizeObserver" in window)new ResizeObserver(resize).observe(canvas);else window.addEventListener("resize",resize);resize();
  }
  document.querySelectorAll("[data-scene3d]").forEach(initScene);

  // Connected SENSE AI through the protected Vercel server endpoint.
  const aiPanel=document.getElementById("sense-ai-panel"),aiOpen=document.getElementById("sense-ai-open"),aiClose=document.getElementById("sense-ai-close");
  const aiForm=document.getElementById("sense-ai-form"),aiInput=document.getElementById("sense-ai-input"),aiMessages=document.getElementById("sense-ai-messages");
  const aiHistory=[];
  function setAi(open){if(!aiPanel||!aiOpen)return;aiPanel.hidden=!open;aiOpen.setAttribute("aria-expanded",String(open));if(open)aiInput?.focus();}
  aiOpen?.addEventListener("click",()=>setAi(aiPanel.hidden));aiClose?.addEventListener("click",()=>setAi(false));
  function addMessage(text,kind){const p=document.createElement("p");p.className="sense-ai-message "+(kind==="user"?"sense-ai-message--user":"sense-ai-message--bot");p.textContent=text;aiMessages.appendChild(p);aiMessages.scrollTop=aiMessages.scrollHeight;return p;}
  aiForm?.addEventListener("submit",async e=>{e.preventDefault();const q=aiInput.value.trim();if(!q)return;addMessage(q,"user");aiInput.value="";const wait=addMessage("Sto preparando la risposta…","bot");const send=aiForm.querySelector('button[type="submit"]');if(send)send.disabled=true;
    try{const r=await fetch("https://indoor-eye-sense.vercel.app/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:[...aiHistory,{role:"user",content:q}]})});const data=await r.json();if(!r.ok)throw new Error(data.error||"Servizio AI temporaneamente non disponibile.");wait.textContent=data.answer;aiHistory.push({role:"user",content:q},{role:"assistant",content:data.answer});}
    catch(err){wait.textContent=err.message||"Non riesco a raggiungere l'assistente. Riprova più tardi.";}
    finally{if(send)send.disabled=false;aiInput.focus();}
  });
})();