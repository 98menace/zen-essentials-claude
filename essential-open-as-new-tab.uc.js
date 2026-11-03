(() => {
  const KEY = "__essentialOpenAsNewTab";
  if (window[KEY]) return;
  window[KEY] = true;

  const isPlainClick = e =>
    e.button === 0 && e.detail > 0 &&
    !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey;

  function getEssentialTab(e) {
    const path = e.composedPath();
    if (path.some(n => n?.localName === "toolbarbutton")) return null;
    return path.find(n => n?.localName === "tab" && n.hasAttribute("zen-essential")) || null;
  }

  function block(e) {
    if (!isPlainClick(e) || !getEssentialTab(e)) return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
  }

  function onMouseDown(e) {
    if (!isPlainClick(e)) return;
    const tab = getEssentialTab(e);
    if (!tab) return;

    block(e);
    if (e.detail !== 1) return; // ignore double-clicks

    const url =
      tab._zenPinnedInitialState?.entry?.url ||
      tab.linkedBrowser?.currentURI?.spec;
    if (!url || url === "about:blank") return;

    const userContextId = tab.userContextId || 0;
    const newTab = gBrowser.addTab(url, {
      userContextId,
      triggeringPrincipal: Services.scriptSecurityManager.createNullPrincipal({ userContextId }),
      relatedToCurrent: false, // don't insert next to the current tab
    });
    gBrowser.selectedTab = newTab;
  }

  window.addEventListener("mousedown", onMouseDown, true);
  window.addEventListener("mouseup", block, true);
  window.addEventListener("click", block, true);
})();
