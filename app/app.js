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
      if (active && window.matchMedia("(max-width: 760px)").matches) item.scrollIntoView({behavior: "smooth", block: "nearest", inline: "center"});
      if (active) item.setAttribute("aria-current", "page");
      else item.removeAttribute("aria-current");
    });
    const heading = document.querySelector(`[data-view="${name}"] h1`);
    if (heading) heading.setAttribute("tabindex", "-1"), heading.focus({preventScroll:true});
  }
  navItems.forEach((item) => item.addEventListener("click", () => showView(item.dataset.viewTarget)));
  // Local profile: no external account or cloud identity is implied.
  const profileForm = document.getElementById("profile-form");
  const profileNameInput = document.getElementById("profile-name-input");
  const profileNameDisplay = document.getElementById("profile-display-name");
  const profileAvatar = document.getElementById("profile-avatar");
  const profileFeedback = document.getElementById("profile-save-feedback");
  const profileDefaultName = "Youssef";
  let profileName = profileDefaultName;
  try { profileName = localStorage.getItem("ies-profile-name") || profileDefaultName; } catch (_) {}
  function applyProfileName(value) {
    const clean = (value || profileDefaultName).trim().slice(0, 40) || profileDefaultName;
    profileName = clean;
    const initial = clean.trim().charAt(0).toLocaleUpperCase("it-IT") || "Y";
    if (profileNameDisplay) profileNameDisplay.textContent = clean;
    if (profileAvatar) profileAvatar.textContent = initial;
    document.querySelectorAll(".sidebar-account__avatar,.topbar-profile").forEach(el => el.textContent = initial);
    const sideName = document.querySelector(".sidebar-account b");
    if (sideName) sideName.textContent = clean;
    const welcome = document.querySelector(".sense-welcome .topbar-title");
    if (welcome) welcome.textContent = "Bentornato, " + clean;
    if (profileNameInput) profileNameInput.value = clean;
  }
  applyProfileName(profileName);
  profileForm?.addEventListener("submit", ev => {
    ev.preventDefault();
    const clean = profileNameInput?.value.trim().slice(0,40);
    if (!clean) { if(profileFeedback) profileFeedback.textContent = "Inserisci un nome valido."; return; }
    applyProfileName(clean);
    try { localStorage.setItem("ies-profile-name", clean); } catch (_) {}
    if(profileFeedback) profileFeedback.textContent = "Nome aggiornato su questo dispositivo.";
    toast("Profilo aggiornato.");
  });
  document.getElementById("profile-reset")?.addEventListener("click", () => {
    applyProfileName(profileDefaultName);
    try { localStorage.removeItem("ies-profile-name"); } catch (_) {}
    if(profileFeedback) profileFeedback.textContent = "Nome ripristinato.";
    toast("Profilo ripristinato.");
  });

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
    const ctx=canvas.getContext("2d");if(!ctx)return;const wrap=canvas.closest(".sense-scene-stage, .scene3d-wrap");let yaw=-.6,pitch=.7,zoom=1,drag=false,lx=0,ly=0;
    const project=(p,w,h)=>{const x=p[0]*Math.cos(yaw)-p[1]*Math.sin(yaw),y=p[0]*Math.sin(yaw)+p[1]*Math.cos(yaw),yy=y*Math.cos(pitch)-p[2]*Math.sin(pitch),z=y*Math.sin(pitch)+p[2]*Math.cos(pitch),k=5/(7-z),scale=Math.min(w,h)*.12*zoom;return[w*.5+x*scale*k,h*.57+yy*scale*k];};
    function draw(){const w=canvas.width,h=canvas.height;ctx.clearRect(0,0,w,h);const line=(a,b,c)=>{const p=project(a,w,h),q=project(b,w,h);ctx.beginPath();ctx.moveTo(...p);ctx.lineTo(...q);ctx.strokeStyle=c;ctx.stroke();};const poly=(pts,fill,stroke)=>{ctx.beginPath();pts.forEach((v,i)=>{const p=project(v,w,h);i?ctx.lineTo(...p):ctx.moveTo(...p);});ctx.closePath();ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle=stroke;ctx.stroke();};
      poly([[-4,-3,0],[4,-3,0],[4,3,0],[-4,3,0]],"#c9bba9","#9a8d7b");for(let x=-4;x<=4;x+=.5)line([x,-3,.01],[x,3,.01],"rgba(105,104,93,.15)");for(let y=-3;y<=3;y+=.5)line([-4,y,.01],[4,y,.01],"rgba(105,104,93,.15)");poly([[-4,3,0],[4,3,0],[4,3,2.8],[-4,3,2.8]],"#e8e2d8","#a99f91");poly([[-4,-3,0],[-4,3,0],[-4,3,2.8],[-4,-3,2.8]],"#d7d3c8","#a99f91");
      function cuboid(x,y,z,sx,sy,sz,fill){const a=[x-sx/2,y-sy/2,z-sz/2],b=[x+sx/2,y-sy/2,z-sz/2],c=[x+sx/2,y-sy/2,z+sz/2],d=[x-sx/2,y-sy/2,z+sz/2],A=[a[0],a[1]+sy,a[2]],B=[b[0],b[1]+sy,b[2]],C=[c[0],c[1]+sy,c[2]],D=[d[0],d[1]+sy,d[2]];poly([a,b,B,A],fill,"#8f887a");poly([b,c,C,B],"#b0a391","#8f887a");poly([A,B,C,D],"#e4dbcf","#8f887a");}
      cuboid(1.15,.6,1.45,2.55,1.1,1,"#d8c8b7");cuboid(.0,.45,.15,1.45,.7,.88,"#b88c61");cuboid(-3.35,.5,-.4,1.4,.8,.5,"#8b7462");const p=project([.5,.15,-2],w,h);ctx.beginPath();ctx.arc(...p,6,0,Math.PI*2);ctx.fillStyle="#10a99b";ctx.fill();}
    const resize=()=>{const r=canvas.getBoundingClientRect(),d=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.max(1,Math.round(r.width*d));canvas.height=Math.max(1,Math.round(r.height*d));draw();};
    canvas.addEventListener("pointerdown",ev=>{drag=true;lx=ev.clientX;ly=ev.clientY;canvas.setPointerCapture(ev.pointerId);});canvas.addEventListener("pointermove",ev=>{if(!drag)return;yaw+=(ev.clientX-lx)*.008;pitch=Math.max(.25,Math.min(1.2,pitch+(ev.clientY-ly)*.006));lx=ev.clientX;ly=ev.clientY;draw();});canvas.addEventListener("pointerup",()=>drag=false);canvas.addEventListener("pointercancel",()=>drag=false);canvas.addEventListener("wheel",ev=>{ev.preventDefault();zoom=Math.max(.65,Math.min(1.8,zoom-ev.deltaY*.001));draw();},{passive:false});
    const zoomBy=f=>{zoom=Math.max(.65,Math.min(1.8,zoom*f));draw();};wrap?.querySelector("[data-scene-zoom-in]")?.addEventListener("click",()=>zoomBy(1.18));wrap?.querySelector("[data-scene-zoom-out]")?.addEventListener("click",()=>zoomBy(.85));wrap?.querySelector("[data-scene-reset]")?.addEventListener("click",()=>{yaw=-.6;pitch=.7;zoom=1;draw();});const presets={"3d":[-.6,.7,1],"top":[0,1.35,1.15],"front":[0,.32,1],"side":[1.2,.45,1]};const setPreset=k=>{[yaw,pitch,zoom]=presets[k]||presets["3d"];draw();wrap?.querySelectorAll("[data-scene-view]").forEach(b=>b.classList.toggle("is-selected",b.dataset.sceneView===k));const sel=wrap?.querySelector("[data-scene-preset]");if(sel)sel.value=k;};wrap?.querySelectorAll("[data-scene-view]").forEach(b=>b.addEventListener("click",()=>setPreset(b.dataset.sceneView)));wrap?.querySelector("[data-scene-preset]")?.addEventListener("change",ev=>setPreset(ev.target.value));wrap?.querySelector("[data-scene-fullscreen]")?.addEventListener("click",()=>{if(document.fullscreenElement)document.exitFullscreen?.();else wrap.requestFullscreen?.();});if("ResizeObserver"in window)new ResizeObserver(resize).observe(canvas);else window.addEventListener("resize",resize);resize();
  }
  function initScene3D(canvas) {
    if(!window.THREE){initScene2D(canvas);return;}const T=window.THREE,wrap=canvas.closest(".sense-scene-stage, .scene3d-wrap"),renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:true});renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputEncoding=T.sRGBEncoding;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.92;renderer.setClearColor(0xe9eeeb,1);
    const scene=new T.Scene();scene.background=new T.Color(0xe9eeeb);scene.fog=new T.Fog(0xe9eeeb,20,36);const camera=new T.PerspectiveCamera(39,1,.1,80);let yaw=Math.PI,pitch=.43,distance=11.6,dragging=false,lastX=0,lastY=0;const target=new T.Vector3(0,.9,.45);
    scene.add(new T.HemisphereLight(0xfff8ed,0x82796d,1.15));const sun=new T.DirectionalLight(0xffe8ca,1.9);sun.position.set(-3.5,8,4);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-8;sun.shadow.camera.right=8;sun.shadow.camera.top=8;sun.shadow.camera.bottom=-8;sun.shadow.bias=-.00022;sun.shadow.radius=5;scene.add(sun);const fill=new T.DirectionalLight(0xc7e8f3,.48);fill.position.set(4,5,-4);scene.add(fill);const lamp=new T.PointLight(0xffd99b,.75,6);lamp.position.set(0,2.6,1.6);scene.add(lamp);
    const mat=(color,rough=.8,metal=0)=>new T.MeshStandardMaterial({color,roughness:rough,metalness:metal}),cream=mat(0xe8e3da),sideCream=mat(0xdedbd2),trim=mat(0xf8f5ed),oak=mat(0x8d6549,.58),oakLight=mat(0xb78c65,.55),sofa=mat(0x9c8e80,.94),cushion=mat(0xcbbdaf,.96),cushion2=mat(0xb7a899,.95),dark=mat(0x454b4c,.55),metal=mat(0x9b9e98,.3,.72),leafMat=mat(0x477c5d,.9),leaf2=mat(0x6c9c70,.92),potMat=mat(0xb97959,.88);
    function add(g,m,x=0,y=0,z=0,cast=true){const o=new T.Mesh(g,m);o.position.set(x,y,z);o.castShadow=cast;o.receiveShadow=true;scene.add(o);return o;}function box(x,y,z,sx,sy,sz,m,cast=true){return add(new T.BoxGeometry(sx,sy,sz),m,x,y,z,cast);}
    function rounded(x,y,z,sx,sy,sz,m,r=.07){const sh=new T.Shape(),w=sx/2-r,h=sy/2-r;sh.moveTo(-w,-h-r);sh.lineTo(w,-h-r);sh.quadraticCurveTo(w+r,-h-r,w+r,-h);sh.lineTo(w+r,h);sh.quadraticCurveTo(w+r,h+r,w,h+r);sh.lineTo(-w,h+r);sh.quadraticCurveTo(-w-r,h+r,-w-r,h);sh.lineTo(-w-r,-h);sh.quadraticCurveTo(-w-r,-h-r,-w,-h-r);const g=new T.ExtrudeGeometry(sh,{depth:Math.max(.04,sz-2*r),bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:r*.7,bevelThickness:r*.7,curveSegments:8});g.translate(0,0,-(sz-2*r)/2);return add(g,m,x,y,z);}
    function texture(draw,w=512,h=512){const c=document.createElement("canvas");c.width=w;c.height=h;const g=c.getContext("2d");draw(g,w,h);const t=new T.CanvasTexture(c);t.wrapS=T.RepeatWrapping;t.wrapT=T.RepeatWrapping;t.anisotropy=renderer.capabilities.getMaxAnisotropy();t.encoding=T.sRGBEncoding;return t;}

    // Procedural material maps: subtle wood grain and upholstery weave.
    const woodTex=texture((g,w,h)=>{g.fillStyle="#a77954";g.fillRect(0,0,w,h);for(let y=0;y<h;y+=3){const a=.025+((y*17)%11)/180;g.strokeStyle="rgba(60,31,17,"+a+")";g.lineWidth=1;g.beginPath();g.moveTo(0,y);g.bezierCurveTo(w*.22,y+Math.sin(y*.11)*5,w*.7,y-Math.cos(y*.07)*4,w,y+Math.sin(y*.04)*3);g.stroke();}for(let i=0;i<18;i++){const x=(i*97)%w,y=(i*53)%h;g.strokeStyle="rgba(78,43,24,.12)";g.lineWidth=2;g.beginPath();g.ellipse(x,y,18+(i%5)*5,3+(i%3),0,0,Math.PI*2);g.stroke();}},512,512);
    woodTex.repeat.set(1.6,1.2);oak.map=woodTex;oak.bumpMap=woodTex;oak.bumpScale=.018;oakLight.map=woodTex;oakLight.bumpMap=woodTex;oakLight.bumpScale=.012;oak.needsUpdate=true;oakLight.needsUpdate=true;
    const fabricTex=texture((g,w,h)=>{g.fillStyle="#9c8e80";g.fillRect(0,0,w,h);for(let y=0;y<h;y+=4){g.strokeStyle="rgba(255,255,255,.10)";g.lineWidth=1;g.beginPath();g.moveTo(0,y);g.lineTo(w,y);g.stroke();}for(let x=0;x<w;x+=4){g.strokeStyle="rgba(48,39,33,.09)";g.lineWidth=1;g.beginPath();g.moveTo(x,0);g.lineTo(x,h);g.stroke();}},256,256);
    fabricTex.repeat.set(4,3);sofa.map=fabricTex;cushion.map=fabricTex;cushion2.map=fabricTex;sofa.bumpMap=fabricTex;cushion.bumpMap=fabricTex;sofa.bumpScale=.012;cushion.bumpScale=.01;sofa.needsUpdate=true;cushion.needsUpdate=true;cushion2.needsUpdate=true;
    const contactTex=texture((g,w,h)=>{const grad=g.createRadialGradient(w/2,h/2,3,w/2,h/2,w*.48);grad.addColorStop(0,"rgba(35,29,22,.27)");grad.addColorStop(.55,"rgba(35,29,22,.12)");grad.addColorStop(1,"rgba(35,29,22,0)");g.fillStyle=grad;g.fillRect(0,0,w,h);},256,256);
    function contactShadow(x,z,sx,sz,opacity=1){const m=new T.MeshBasicMaterial({map:contactTex,transparent:true,opacity,depthWrite:false});const o=new T.Mesh(new T.PlaneGeometry(sx,sz),m);o.rotation.x=-Math.PI/2;o.position.set(x,.008,z);scene.add(o);return o;}
    const floorTex=texture((g,w,h)=>{g.fillStyle="#c8c0b4";g.fillRect(0,0,w,h);for(let y=0;y<h;y+=128)for(let x=0;x<w;x+=128){g.fillStyle=(x/128+y/128)%2?"#d5cec3":"#cfc7bb";g.fillRect(x+2,y+2,124,124);g.strokeStyle="#b5ad9f";g.lineWidth=3;g.strokeRect(x+1,y+1,126,126);}});floorTex.repeat.set(2,2);const floor=new T.Mesh(new T.PlaneGeometry(8.5,6.8),new T.MeshStandardMaterial({map:floorTex,roughness:.86}));floor.rotation.x=-Math.PI/2;floor.position.y=-.035;floor.receiveShadow=true;scene.add(floor);
    // Room shell and baseboards.
    box(0,1.48,3.27,8.5,3,.16,cream,false);box(-4.22,1.48,0,.16,3,6.5,sideCream,false);box(0,.10,3.16,8.45,.2,.07,trim,false);box(-4.12,.10,0,.07,.2,6.4,trim,false);
    // Window with a procedural outdoor view, frame and curtains.
    const outside=texture((g,w,h)=>{const sky=g.createLinearGradient(0,0,0,h);sky.addColorStop(0,"#8bc5e4");sky.addColorStop(.6,"#d9e8d1");sky.addColorStop(1,"#77a36e");g.fillStyle=sky;g.fillRect(0,0,w,h);for(let i=0;i<18;i++){const x=(i*71)%w,y=100+(i*37)%250;g.fillStyle=i%2?"#3f8050":"#6a9d5f";g.beginPath();g.arc(x,y,28+(i%4)*8,0,Math.PI*2);g.fill();}});const glass=new T.MeshStandardMaterial({map:outside,roughness:.34,emissive:0x142b31,emissiveIntensity:.12,side:T.DoubleSide});add(new T.PlaneGeometry(1.65,1.4),glass,-2.18,1.92,3.175,false);for(const x of[-3.03,-1.33])box(x,1.92,3.13,.065,1.55,.08,trim,false);for(const y of[1.18,2.66])box(-2.18,y,3.13,1.75,.065,.08,trim,false);box(-2.18,1.9,3.105,.045,1.4,.06,trim,false);rounded(-2.18,1.12,3.03,1.95,.12,.22,oakLight,.04);const curtain=mat(0xcac7bf,.95);rounded(-3.18,1.95,3.0,.24,1.65,.12,curtain,.05);rounded(-1.17,1.95,3.0,.2,1.65,.12,curtain,.05);box(-2.18,2.82,3.03,2.2,.045,.05,metal,false);
    // Door, frame, panels and handle.
    rounded(3.05,1.12,3.145,1.18,2.22,.08,oakLight,.045);rounded(3.05,1.12,3.09,1.02,2.08,.07,oak,.04);rounded(3.05,1.45,3.045,.74,.88,.025,oakLight,.03);rounded(3.05,.55,3.045,.74,.75,.025,oakLight,.03);add(new T.SphereGeometry(.05,18,12),metal,3.44,1.02,3.01);
    // Woven rug on tile floor.
    const rugTex=texture((g,w,h)=>{g.fillStyle="#bcb1a2";g.fillRect(0,0,w,h);for(let i=0;i<1800;i++){const x=(i*73)%w,y=(i*137)%h;g.fillStyle=i%2?"rgba(255,255,255,.1)":"rgba(91,77,63,.08)";g.fillRect(x,y,2,1);}g.strokeStyle="#d8cdbf";g.lineWidth=15;g.strokeRect(16,16,w-32,h-32);g.strokeStyle="#a89987";g.lineWidth=2;g.strokeRect(35,35,w-70,h-70);});const rug=new T.Mesh(new T.PlaneGeometry(4.35,3.25),new T.MeshStandardMaterial({map:rugTex,roughness:1,side:T.DoubleSide}));rug.rotation.x=-Math.PI/2;rug.position.set(-.05,.006,.25);rug.receiveShadow=true;scene.add(rug);
    // Soft contact shadows anchor the furniture to the floor.
    contactShadow(1.28,1.72,3.5,1.9,.95);contactShadow(-.05,.22,2.0,1.45,.78);contactShadow(-3.55,-.55,1.35,2.0,.72);
    // Sofa: visible upholstered base, cushion, rounded armrests, pillows and feet.
    rounded(1.28,.39,1.72,2.72,.42,1.08,sofa,.12);rounded(1.28,.93,2.2,2.62,.88,.28,sofa,.12);rounded(-.0,.68,1.78,.28,.66,1.12,sofa,.1);rounded(2.56,.68,1.78,.28,.66,1.12,sofa,.1);rounded(.68,.65,1.56,1.12,.18,.78,cushion,.08);rounded(1.88,.65,1.56,1.12,.18,.78,cushion,.08);rounded(.45,1.08,2.015,.78,.58,.18,cushion2,.08);rounded(1.28,1.1,2.015,.78,.58,.18,cushion,.08);rounded(2.1,1.08,2.015,.78,.58,.18,cushion2,.08);\n    const pillowA=rounded(.55,.96,1.94,.48,.42,.17,cushion2,.09);pillowA.rotation.z=-.12;const pillowB=rounded(2.05,.96,1.94,.46,.40,.17,cushion,.09);pillowB.rotation.z=.1;\n    const sofaLeg=mat(0x5a5147,.6);for(const x of[.18,2.38])for(const z of[1.3,2.1])add(new T.CylinderGeometry(.045,.06,.22,12),sofaLeg,x,.12,z);
    // Coffee table centered in front of sofa.
    rounded(-.05,.67,.22,1.55,.12,.94,oakLight,.055);for(const x of[-.68,.58])for(const z of[-.14,.58])box(x,.34,z,.055,.62,.055,dark);rounded(-.05,.755,.18,.62,.035,.24,mat(0xeee5d8),.02);rounded(.32,.78,.25,.42,.045,.28,mat(0x9b7362),.02);
    // Left-side console with drawers, legs, lamp and plant.
    const cred=rounded(-3.55,.53,-.55,1.7,.82,.58,oak,.065);cred.rotation.y=-Math.PI/2;const credTop=rounded(-3.55,.98,-.55,1.82,.09,.68,oakLight,.04);credTop.rotation.y=-Math.PI/2;for(const z of[-1.15,-.55,.05]){const d=rounded(-3.245,.56,z,.045,.28,.49,oakLight,.02);d.rotation.y=-Math.PI/2;add(new T.SphereGeometry(.027,12,8),metal,-3.205,.58,z);}for(const z of[-1.17,.08])add(new T.CylinderGeometry(.035,.04,.34,12),dark,-3.55,.16,z);
    add(new T.CylinderGeometry(.18,.14,.38,24),potMat,-2.28,.19,1.38);for(let i=0;i<11;i++){const a=i*2.399,dir=new T.Vector3(Math.cos(a)*(.26+(i%3)*.08),.68+(i%4)*.09,Math.sin(a)*(.25+(i%2)*.08));const leaf=add(new T.ConeGeometry(.105,.73,10),i%3?leafMat:leaf2,-2.28+dir.x,.34+dir.y/2,1.38+dir.z);leaf.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),dir.clone().normalize());}
    add(new T.CylinderGeometry(.09,.12,.18,18),potMat,-3.05,.98,-.55);for(let i=0;i<5;i++){const leaf=add(new T.ConeGeometry(.055,.32,8),leafMat,-3.05+Math.sin(i*1.2)*.1,1.2,-.55+Math.cos(i*1.2)*.1);leaf.rotation.z=Math.sin(i)*.3;}add(new T.SphereGeometry(.16,24,16),mat(0xffe6ae,.24),-3.75,1.12,-.55);const glow=new T.PointLight(0xffce7d,.35,2);glow.position.set(-3.75,1.25,-.55);scene.add(glow);
    // Minimal art piece on rear wall.
    rounded(.15,2.05,3.16,1.25,.82,.07,mat(0x8b735f),.035);rounded(.15,2.05,3.105,1.12,.68,.035,mat(0xf0ede6),.025);box(-.12,2.05,3.08,.04,.66,.012,mat(0xb19c86),false);box(.25,2.05,3.08,.04,.66,.012,mat(0x8e9b8f),false);
    // Amber volumes correspond precisely to the sofa and coffee table above.
    const volumeMat=new T.MeshStandardMaterial({color:0xf3a63f,transparent:true,opacity:.12,roughness:.6,depthWrite:false}),edgeMat=new T.LineBasicMaterial({color:0xe6a036,transparent:true,opacity:.96});function obstacle(x,z,sx,sz,h){const body=new T.Mesh(new T.BoxGeometry(sx,h,sz),volumeMat);body.position.set(x,h/2+.02,z);scene.add(body);const edge=new T.LineSegments(new T.EdgesGeometry(body.geometry),edgeMat);edge.position.copy(body.position);scene.add(edge);const floorMark=new T.Mesh(new T.PlaneGeometry(sx,sz),new T.MeshBasicMaterial({color:0xf2b65e,transparent:true,opacity:.18,side:T.DoubleSide}));floorMark.rotation.x=-Math.PI/2;floorMark.position.set(x,.012,z);scene.add(floorMark);}obstacle(1.28,1.72,2.82,1.12,1.42);obstacle(-.05,.22,1.68,1.02,.82);
    // Teal route / illustrative user position.
    const curve=new T.CatmullRomCurve3([new T.Vector3(.3,.025,-2.65),new T.Vector3(.15,.028,-2),new T.Vector3(-.55,.03,-1.35),new T.Vector3(-.55,.03,-.45),new T.Vector3(-.2,.03,0)]);add(new T.TubeGeometry(curve,80,.018,8,false),new T.MeshBasicMaterial({color:0x28d6c1,transparent:true,opacity:.9}),0,0,0,false);add(new T.TubeGeometry(curve,80,.055,8,false),new T.MeshBasicMaterial({color:0x35e2d0,transparent:true,opacity:.14}),0,0,0,false);const marker=add(new T.TorusGeometry(.37,.035,10,56),new T.MeshBasicMaterial({color:0x00d4c2}),.3,.045,-2.55);marker.rotation.x=Math.PI/2;const arrow=add(new T.ConeGeometry(.16,.28,3),new T.MeshBasicMaterial({color:0x00bfae}),.3,.18,-2.55);arrow.rotation.x=Math.PI/2;
    function label(text){const c=document.createElement("canvas");c.width=512;c.height=100;const g=c.getContext("2d");g.fillStyle="#b9680b";g.beginPath();g.roundRect(4,4,504,92,28);g.fill();g.strokeStyle="#fff2da";g.lineWidth=5;g.stroke();g.font="bold 32px system-ui";g.fillStyle="#fff";g.textAlign="center";g.textBaseline="middle";g.fillText(text,256,51);const tex=new T.CanvasTexture(c);tex.encoding=T.sRGBEncoding;const sp=new T.Sprite(new T.SpriteMaterial({map:tex,transparent:true,depthTest:false}));sp.scale.set(1.2,.24,1);return sp;}const a=label("OSTACOLO A");a.position.set(1.28,1.72,1.3);scene.add(a);const b=label("OSTACOLO B");b.position.set(-.05,1,.18);scene.add(b);
    function render(){renderer.render(scene,camera);}function updateCamera(){const cp=Math.cos(pitch);camera.position.set(target.x+distance*cp*Math.sin(yaw),target.y+distance*Math.sin(pitch),target.z+distance*cp*Math.cos(yaw));camera.lookAt(target);}
    function setPreset(k){if(k==="top"){yaw=Math.PI;pitch=1.48;distance=12.4;}else if(k==="front"){yaw=Math.PI;pitch=.16;distance=11.8;}else if(k==="side"){yaw=Math.PI/2;pitch=.36;distance=12.8;}else{yaw=Math.PI;pitch=.43;distance=11.6;}updateCamera();render();wrap?.querySelectorAll("[data-scene-view]").forEach(v=>v.classList.toggle("is-selected",v.dataset.sceneView===k));const select=wrap?.querySelector("[data-scene-preset]");if(select)select.value=k;}
    const zoomBy=f=>{distance=Math.max(7,Math.min(18,distance*f));updateCamera();render();};wrap?.querySelector("[data-scene-zoom-in]")?.addEventListener("click",()=>zoomBy(.84));wrap?.querySelector("[data-scene-zoom-out]")?.addEventListener("click",()=>zoomBy(1.19));wrap?.querySelector("[data-scene-reset]")?.addEventListener("click",()=>setPreset("3d"));wrap?.querySelectorAll("[data-scene-view]").forEach(v=>v.addEventListener("click",()=>setPreset(v.dataset.sceneView)));wrap?.querySelector("[data-scene-preset]")?.addEventListener("change",v=>setPreset(v.target.value));wrap?.querySelector("[data-scene-fullscreen]")?.addEventListener("click",()=>{if(document.fullscreenElement)document.exitFullscreen?.();else wrap.requestFullscreen?.();});
    const pointers=new Map();let pinchStart=0,pinchDistance=distance;const pd=()=>{const p=[...pointers.values()];return p.length<2?0:Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);};canvas.addEventListener("pointerdown",v=>{pointers.set(v.pointerId,{x:v.clientX,y:v.clientY});canvas.setPointerCapture(v.pointerId);if(pointers.size===2){pinchStart=pd();pinchDistance=distance;dragging=false;}else{dragging=true;lastX=v.clientX;lastY=v.clientY;}});canvas.addEventListener("pointermove",v=>{if(!pointers.has(v.pointerId))return;pointers.set(v.pointerId,{x:v.clientX,y:v.clientY});if(pointers.size>=2){if(pinchStart>0){distance=Math.max(7,Math.min(18,pinchDistance*pinchStart/Math.max(1,pd())));updateCamera();render();}return;}if(!dragging)return;yaw-=(v.clientX-lastX)*.006;pitch=Math.max(.16,Math.min(1.25,pitch+(v.clientY-lastY)*.005));lastX=v.clientX;lastY=v.clientY;updateCamera();render();});const end=v=>{pointers.delete(v.pointerId);if(pointers.size<2)pinchStart=0;dragging=pointers.size===1;if(dragging){const p=[...pointers.values()][0];lastX=p.x;lastY=p.y;}};canvas.addEventListener("pointerup",end);canvas.addEventListener("pointercancel",end);canvas.addEventListener("wheel",v=>{v.preventDefault();zoomBy(v.deltaY>0?1.08:.92);},{passive:false});function resize(){const r=canvas.getBoundingClientRect();if(!r.width||!r.height)return;renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();updateCamera();render();}if("ResizeObserver"in window)new ResizeObserver(resize).observe(canvas);else window.addEventListener("resize",resize);resize();setPreset("3d");
  }
  document.querySelectorAll("[data-scene3d]").forEach(initScene3D);

  // SENSE Assistant: project-focused chat UI. The model endpoint remains protected server-side.
  const aiPanel=document.getElementById("sense-ai-panel"),aiOpen=document.getElementById("sense-ai-open"),aiClose=document.getElementById("sense-ai-close");
  const aiForm=document.getElementById("sense-ai-form"),aiInput=document.getElementById("sense-ai-input"),aiMessages=document.getElementById("sense-ai-messages");
  const aiStatus=document.getElementById("sense-ai-status"),aiClear=document.getElementById("sense-ai-clear"),aiPrompts=[...document.querySelectorAll("[data-ai-prompt]")];
  let aiHistory=[],aiBusy=false;
  const aiGreeting="Ciao! Sono SENSE, l'assistente del progetto INDOOR EYE SENSE. Posso aiutarti a capire il prototipo, il bracciale concept, la mappa 3D e le prossime fasi di sviluppo. Ricorda: la scena 3D è illustrativa e il dispositivo non è ancora collegato ai sensori.";
  function setAi(open){if(!aiPanel||!aiOpen)return;aiPanel.hidden=!open;aiOpen.setAttribute("aria-expanded",String(open));if(open)aiInput?.focus();}
  aiOpen?.addEventListener("click",()=>setAi(aiPanel.hidden));aiClose?.addEventListener("click",()=>setAi(false));
  function setAiStatus(text,state="idle"){if(!aiStatus)return;aiStatus.textContent=text;aiStatus.dataset.state=state;}
  function addMessage(text,kind,extraClass=""){const p=document.createElement("p");p.className="sense-ai-message "+(kind==="user"?"sense-ai-message--user":"sense-ai-message--bot")+(extraClass?" "+extraClass:"");p.textContent=text;aiMessages.appendChild(p);aiMessages.scrollTop=aiMessages.scrollHeight;return p;}
  function resetAiChat(){aiHistory=[];if(aiMessages){aiMessages.replaceChildren();addMessage(aiGreeting,"bot");}setAiStatus("Pronto a rispondere");}
  aiClear?.addEventListener("click",resetAiChat);
  aiPrompts.forEach(button=>button.addEventListener("click",()=>{if(aiBusy)return;aiInput.value=button.dataset.aiPrompt||"";aiForm?.requestSubmit();}));
  async function askSense(q){
    if(aiBusy||!q)return;aiBusy=true;addMessage(q,"user");const wait=addMessage("SENSE sta elaborando la domanda…","bot","sense-ai-typing");
    const send=aiForm?.querySelector('button[type="submit"]');if(send){send.disabled=true;send.textContent="…";}if(aiInput)aiInput.disabled=true;setAiStatus("Elaborazione in corso","busy");
    try{
      const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),30000);
      let response;try{response=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:[...aiHistory,{role:"user",content:q}] }),signal:controller.signal});}finally{clearTimeout(timeout);}
      const data=await response.json().catch(()=>({}));
      if(!response.ok)throw new Error(data.error||"Il servizio AI non è disponibile in questo momento.");
      if(typeof data.answer!=="string"||!data.answer.trim())throw new Error("Non è arrivata una risposta leggibile. Riprova.");
      wait.textContent=data.answer;wait.classList.remove("sense-ai-typing");aiHistory.push({role:"user",content:q},{role:"assistant",content:data.answer});aiHistory=aiHistory.slice(-8);setAiStatus("Risposta ricevuta","ready");
    }catch(err){
      wait.classList.remove("sense-ai-typing");wait.textContent=err.name==="AbortError"?"La richiesta ha superato il tempo massimo. Controlla la connessione e riprova.":(err.message||"Non riesco a raggiungere SENSE. Riprova più tardi.");
      setAiStatus("Servizio momentaneamente non disponibile","error");
    }finally{aiBusy=false;if(send){send.disabled=false;send.textContent="↑";}if(aiInput){aiInput.disabled=false;aiInput.focus();}}
  }
  aiForm?.addEventListener("submit",e=>{e.preventDefault();const q=aiInput?.value.trim().slice(0,1200);if(!q)return;aiInput.value="";askSense(q);});
})();