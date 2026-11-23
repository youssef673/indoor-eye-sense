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

  const preview = document.getElementById("preview-feedback");
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
})();