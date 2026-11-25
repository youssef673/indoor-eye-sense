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

  // Detailed synthetic 3D room preview, rendered with Three.js.
  function initScene2D(canvas) {
    const ctx=canvas.getContext("2d"); if(!ctx)return;
    let yaw=-.72,pitch=.72,zoom=1,dragging=false,lastX=0,lastY=0;
    const project=(p,w,h)=>{const x=p[0]*Math.cos(yaw)-p[1]*Math.sin(yaw),y=p[0]*Math.sin(yaw)+p[1]*Math.cos(yaw),yy=y*Math.cos(pitch)-p[2]*Math.sin(pitch),z=y*Math.sin(pitch)+p[2]*Math.cos(pitch),k=5/(7-z),scale=Math.min(w,h)*.12*zoom;return[w*.5+x*scale*k,h*.57+yy*scale*k];};
    function draw(){const w=canvas.width,h=canvas.height;ctx.clearRect(0,0,w,h);const line=(a,b,c)=>{const p=project(a,w,h),q=project(b,w,h);ctx.beginPath();ctx.moveTo(...p);ctx.lineTo(...q);ctx.strokeStyle=c;ctx.stroke();};const poly=(pts,fill,stroke)=>{ctx.beginPath();pts.forEach((v,i)=>{const p=project(v,w,h);i?ctx.lineTo(...p):ctx.moveTo(...p);});ctx.closePath();ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle=stroke;ctx.stroke();};poly([[-4,-3,0],[4,-3,0],[4,3,0],[-4,3,0]],"#d8e2dc","#8da99b");for(let x=-4;x<=4;x+=.5)line([x,-3,.01],[x,3,.01],"rgba(75,111,96,.15)");for(let y=-3;y<=3;y+=.5)line([-4,y,.01],[4,y,.01],"rgba(75,111,96,.15)");poly([[-4,-3,0],[-4,3,0],[-4,3,2.8],[-4,-3,2.8]],"#c8d9d1","#79998a");poly([[-4,3,0],[4,3,0],[4,3,2.8],[-4,3,2.8]],"#dce8e1","#79998a");function b(x,y,sx,sy,sz,c){const a=[x-sx/2,y-sy/2,0],bb=[x+sx/2,y-sy/2,0],cc=[x+sx/2,y+sy/2,0],d=[x-sx/2,y+sy/2,0],A=[a[0],a[1],sz],B=[bb[0],bb[1],sz],C=[cc[0],cc[1],sz],D=[d[0],d[1],sz];poly([a,bb,B,A],c,"#648a79");poly([bb,cc,C,B],"#9fb9aa","#648a79");poly([d,a,A,D],"#e0e9e3","#648a79");poly([A,B,C,D],"#edf3ef","#648a79");}b(-2,-.4,1.7,.8,.65,"#9db7a9");b(1.7,.8,.9,.8,1.05,"#d5b18a");const p=project([0,-2.2,.1],w,h);ctx.beginPath();ctx.arc(...p,6,0,Math.PI*2);ctx.fillStyle="#188baf";ctx.fill();}
    const resize=()=>{const r=canvas.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);canvas.width=Math.max(1,Math.round(r.width*d));canvas.height=Math.max(1,Math.round(r.height*d));draw();};
    canvas.addEventListener("pointerdown",e=>{dragging=true;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture(e.pointerId);});canvas.addEventListener("pointermove",e=>{if(!dragging)return;yaw+=(e.clientX-lastX)*.009;pitch=Math.max(.25,Math.min(1.2,pitch+(e.clientY-lastY)*.006));lastX=e.clientX;lastY=e.clientY;draw();});canvas.addEventListener("pointerup",()=>dragging=false);canvas.addEventListener("pointercancel",()=>dragging=false);canvas.addEventListener("wheel",e=>{e.preventDefault();zoom=Math.max(.7,Math.min(1.5,zoom-e.deltaY*.001));draw();},{passive:false});canvas.closest(".scene3d-wrap")?.querySelector("[data-scene-reset]")?.addEventListener("click",()=>{yaw=-.72;pitch=.72;zoom=1;draw();});if("ResizeObserver"in window)new ResizeObserver(resize).observe(canvas);else window.addEventListener("resize",resize);resize();
  }
  function initScene3D(canvas) {
    if(!window.THREE){initScene2D(canvas);return;}
    const T=window.THREE,wrap=canvas.closest(".scene3d-wrap"),renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:true});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputEncoding=T.sRGBEncoding;renderer.setClearColor(0xeaf2ed,1);
    const scene=new T.Scene();scene.background=new T.Color(0xeaf2ed);scene.fog=new T.Fog(0xeaf2ed,15,28);
    const camera=new T.PerspectiveCamera(42,1,.1,60);let yaw=.82,pitch=.72,distance=12,dragging=false,lastX=0,lastY=0;const target=new T.Vector3(0,.7,0);
    scene.add(new T.HemisphereLight(0xf4fbff,0x7b897d,1.35));const sun=new T.DirectionalLight(0xfff2d9,2.1);sun.position.set(-5,10,7);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-9;sun.shadow.camera.right=9;sun.shadow.camera.top=9;sun.shadow.camera.bottom=-9;scene.add(sun);const fill=new T.PointLight(0x8bd7d0,.7,15);fill.position.set(3,4,-2);scene.add(fill);
    const mat=(c,r=.82,m=0)=>new T.MeshStandardMaterial({color:c,roughness:r,metalness:m}),floorMat=mat(0xc9bba4),wallMat=mat(0xe8e4d9),trimMat=mat(0xb9c9c0),wood=mat(0x9b7658),woodLight=mat(0xc49a70),fabric=mat(0x547d79),fabricLight=mat(0x719b91),dark=mat(0x35454b),glass=new T.MeshStandardMaterial({color:0x8bc8d0,roughness:.18,metalness:.12,transparent:true,opacity:.58});
    function mesh(g,m,x,y,z,cast=true){const o=new T.Mesh(g,m);o.position.set(x,y,z);o.castShadow=cast;o.receiveShadow=true;scene.add(o);return o;}function box(x,y,z,sx,sy,sz,m){return mesh(new T.BoxGeometry(sx,sy,sz),m,x,y,z);}
    box(0,-.12,0,8.4,.24,6.4,floorMat,false);
    const seamPts=[];for(let z=-2.9;z<=3;z+=.48)seamPts.push(new T.Vector3(-4.12,.006,z),new T.Vector3(4.12,.006,z));for(let x=-3.7;x<=4;x+=1.25)seamPts.push(new T.Vector3(x,.007,-3.12),new T.Vector3(x,.007,3.12));scene.add(new T.LineSegments(new T.BufferGeometry().setFromPoints(seamPts),new T.LineBasicMaterial({color:0x9c927f,transparent:true,opacity:.25})));
    // Room shell, window and door.
    box(0,1.48,3.12,8.35,3,.16,wallMat);box(-4.12,1.48,0,.16,3,6.25,wallMat);box(0,.12,3.015,8.3,.22,.08,trimMat);box(-4.015,.12,0,.08,.22,6.1,trimMat);
    box(-1.9,1.85,3.015,1.85,1.25,.035,dark,false);box(-1.9,1.85,2.985,1.68,1.08,.025,glass,false);const frame=mat(0xf4f0e7);box(-1.9,1.85,2.96,.035,1.15,.05,frame,false);box(-1.9,1.85,2.96,1.75,.035,.05,frame,false);
    box(2.75,1.05,3.015,1.15,2.1,.035,woodLight);box(2.75,1.05,2.985,1.02,1.96,.025,wood);mesh(new T.SphereGeometry(.055,16,12),mat(0xd6c7a5,.25,.65),3.12,1.02,2.94);
    // Sofa, cushions, coffee table and cabinet.
    box(-2.45,.32,.95,2.15,.48,.9,fabric);box(-2.45,.82,1.34,2.15,.78,.22,dark);box(-3.42,.67,.96,.25,.7,.9,fabricLight);box(-1.48,.67,.96,.25,.7,.9,fabricLight);box(-2.9,.63,.88,.82,.34,.68,fabricLight);box(-2,.63,.88,.82,.34,.68,fabricLight);
    box(-.25,.58,.25,1.45,.12,.85,woodLight);for(const x of[-.82,.32])for(const z of[-.04,.54])box(x,.29,z,.07,.52,.07,dark);
    box(3.25,.52,.55,1.05,.9,1.65,wood);box(3.25,1.02,.55,1.08,.08,1.68,woodLight);for(const z of[-.05,.5,1.05])box(2.71,.5,z,.025,.65,.025,mat(0xd8c7a7));
    mesh(new T.CylinderGeometry(.22,.17,.38,20),mat(0xb77d58),-3.35,.19,-2.2);for(let i=0;i<7;i++){const leaf=mesh(new T.ConeGeometry(.12,.75,8),mat(i%2?0x4e866d:0x6b9c79),-3.35+Math.sin(i*2.4)*.2,.62+Math.cos(i)*.08,-2.2+Math.cos(i*2.4)*.2);leaf.rotation.z=Math.sin(i*2.4)*.48;leaf.rotation.x=Math.cos(i*2.4)*.35;}
    // Synthetic obstacle volumes with amber outlines and floor footprints.
    const obstacleMat=new T.MeshStandardMaterial({color:0xe5a34c,transparent:true,opacity:.2,roughness:.5}),edgeMat=new T.LineBasicMaterial({color:0xc47b28,transparent:true,opacity:.9});
    function obstacle(x,z,sx,sz,h){const body=box(x,h/2,z,sx,h,sz,obstacleMat,false),edges=new T.LineSegments(new T.EdgesGeometry(body.geometry),edgeMat);edges.position.copy(body.position);scene.add(edges);const footprint=new T.Mesh(new T.PlaneGeometry(sx+.18,sz+.18),new T.MeshBasicMaterial({color:0xeab46c,transparent:true,opacity:.24,side:T.DoubleSide}));footprint.rotation.x=-Math.PI/2;footprint.position.set(x,.018,z);scene.add(footprint);}
    obstacle(-1.55,-1.05,.72,.65,1.15);obstacle(1.35,.75,.9,.7,.82);
    const marker=mesh(new T.CylinderGeometry(.14,.18,.12,28),mat(0x1598ae,.35,.25),0,.09,-2.35),halo=mesh(new T.TorusGeometry(.34,.018,8,48),new T.MeshBasicMaterial({color:0x1598ae,transparent:true,opacity:.75}),0,.035,-2.35);halo.rotation.x=Math.PI/2;
    const routePts=[new T.Vector3(0,.025,-2.35),new T.Vector3(0,.025,-1.6),new T.Vector3(.65,.025,-.9),new T.Vector3(.65,.025,.05)],route=new T.Line(new T.BufferGeometry().setFromPoints(routePts),new T.LineDashedMaterial({color:0x168fa2,dashSize:.14,gapSize:.1,transparent:true,opacity:.8}));route.computeLineDistances();scene.add(route);
    function label(text,color){const c=document.createElement("canvas");c.width=512;c.height=96;const g=c.getContext("2d");g.fillStyle="rgba(255,255,255,.92)";g.strokeStyle="rgba(91,125,112,.35)";g.lineWidth=3;g.beginPath();g.roundRect(4,4,504,88,18);g.fill();g.stroke();g.font="bold 30px system-ui";g.fillStyle=color;g.textAlign="center";g.textBaseline="middle";g.fillText(text,256,48);const tex=new T.CanvasTexture(c);tex.encoding=T.sRGBEncoding;const s=new T.Sprite(new T.SpriteMaterial({map:tex,transparent:true,depthTest:false}));s.scale.set(1.55,.29,1);return s;}
    const l1=label("OSTACOLO A","#98601e");l1.position.set(-1.55,1.42,-1.05);scene.add(l1);const l2=label("OSTACOLO B","#98601e");l2.position.set(1.35,1.08,.75);scene.add(l2);const l3=label("POSIZIONE DEMO","#167d91");l3.scale.set(1.8,.34,1);l3.position.set(0,.55,-2.35);scene.add(l3);
    function updateCamera(){const cp=Math.cos(pitch);camera.position.set(target.x+distance*cp*Math.sin(yaw),target.y+distance*Math.sin(pitch),target.z+distance*cp*Math.cos(yaw));camera.lookAt(target);}
    function render(){renderer.render(scene,camera);}function resize(){const r=canvas.getBoundingClientRect();if(!r.width||!r.height)return;renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();updateCamera();render();}
    canvas.addEventListener("pointerdown",e=>{dragging=true;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture(e.pointerId);});canvas.addEventListener("pointermove",e=>{if(!dragging)return;yaw-=(e.clientX-lastX)*.006;pitch=Math.max(.22,Math.min(1.18,pitch+(e.clientY-lastY)*.005));lastX=e.clientX;lastY=e.clientY;updateCamera();render();});canvas.addEventListener("pointerup",()=>dragging=false);canvas.addEventListener("pointercancel",()=>dragging=false);canvas.addEventListener("wheel",e=>{e.preventDefault();distance=Math.max(7,Math.min(19,distance+e.deltaY*.012));updateCamera();render();},{passive:false});wrap?.querySelector("[data-scene-reset]")?.addEventListener("click",()=>{yaw=.82;pitch=.72;distance=12;updateCamera();render();});if("ResizeObserver"in window)new ResizeObserver(resize).observe(canvas);else window.addEventListener("resize",resize);resize();render();
  }
  document.querySelectorAll("[data-scene3d]").forEach(initScene3D);

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