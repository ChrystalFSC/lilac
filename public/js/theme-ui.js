// Appearance dialog: colour theme and light/dark. Changes apply instantly.
(() => {
  const t = (k, v) => Lilac.i18n.t(k, v);
  const dialog = document.getElementById("theme-dialog");
  const form = document.getElementById("theme-form");
  const note = document.getElementById("theme-note");

  function fill() {
    const p = Lilac.theme.get();
    form.theme.value = p.theme;
    form.mode.value = p.mode;
    const signedIn = !["unconfigured", "signed-out"].includes(Lilac.sync?.info().status);
    note.textContent = t(signedIn ? "theme.synced" : "theme.local");
  }

  document.getElementById("theme-open").addEventListener("click", () => {
    fill();
    dialog.showModal();
  });

  form.addEventListener("change", () => {
    Lilac.theme.set({ theme: form.theme.value, mode: form.mode.value });
  });

  // A newer choice synced from another device: keep the open dialog in step.
  Lilac.theme.onChange(() => { if (dialog.open) fill(); });
  Lilac.i18n.onChange(() => { if (dialog.open) fill(); });
})();
