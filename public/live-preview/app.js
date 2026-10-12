// DEMO-ONLY(live-preview): reads the recipe from the hash and draws a clickable admin around the
// chosen pages' captures. Nothing here leaves the page.
(function () {
  var data = { theme: "Voilet", primary: "", stack: "", pages: [], details: [] };
  try { data = Object.assign(data, JSON.parse(decodeURIComponent(location.hash.slice(1)))); } catch (e) {}
  var root = document.documentElement;
  if (/^#[0-9a-f]{3,8}$/i.test(data.primary)) root.style.setProperty("--primary", data.primary);
  document.title = data.theme + " · live preview";
  document.getElementById("brand").textContent = data.theme;
  document.getElementById("mark").textContent = data.theme.charAt(0);
  document.getElementById("stack").textContent = data.stack;
  var nav = document.getElementById("nav"), title = document.getElementById("title"), shot = document.getElementById("shot");
  var demo = document.querySelector(".demo"), details = document.getElementById("details");
  var buttons = [];
  // On a phone the sidebar closes after a pick; never on the first draw, when the frame may not
  // have its width yet.
  function mark(current, picked) {
    buttons.forEach(function (b) { b.toggleAttribute("aria-current", false); });
    current.setAttribute("aria-current", "page");
    if (picked && window.matchMedia("(max-width: 640px)").matches) document.getElementById("app").classList.add("collapsed");
  }
  function show(i, picked) {
    var page = data.pages[i];
    if (!page) return;
    title.textContent = page.title;
    shot.src = page.src;
    shot.alt = page.title + " page";
    shot.hidden = false; demo.hidden = false; details.hidden = true;
    mark(buttons[i], picked);
  }
  // The theme's own page: what was chosen, as the storefront sends it (`details`).
  // It is the preview's own page, not one of the reader's: tagged so, and said plainly that it is not
  // in the download.
  function showDetails(button) {
    title.textContent = "Theme details";
    var titleTag = document.createElement("span"); titleTag.className = "tag"; titleTag.textContent = "Preview only";
    title.appendChild(titleTag);
    shot.hidden = true; shot.removeAttribute("src"); demo.hidden = true; details.hidden = false;
    details.innerHTML = "";
    var notice = document.createElement("p");
    notice.className = "notice"; notice.setAttribute("role", "note");
    notice.innerHTML = "<strong>This screen isn't part of your download.</strong>It's here in the preview to show what you chose. Your package contains only the pages listed below.";
    details.appendChild(notice);
    var list = document.createElement("dl");
    data.details.forEach(function (row) {
      var item = document.createElement("div");
      var dt = document.createElement("dt"); dt.textContent = row.label;
      var dd = document.createElement("dd"); dd.textContent = row.value;
      if (row.label === "Primary colour" && /^#/.test(row.value)) {
        var swatch = document.createElement("span"); swatch.className = "swatch"; swatch.style.background = row.value; dd.prepend(swatch);
      }
      item.append(dt, dd); list.appendChild(item);
    });
    details.appendChild(list);
    mark(button, true);
  }
  data.pages.forEach(function (page, i) {
    var b = document.createElement("button");
    b.type = "button";
    b.textContent = page.title;
    b.addEventListener("click", function () { show(i, true); });
    nav.appendChild(b);
    buttons.push(b);
  });
  if (data.details.length) {
    var line = document.createElement("hr"); line.className = "nav-line"; nav.appendChild(line);
    var d = document.createElement("button");
    d.type = "button";
    d.textContent = "Theme details";
    var navTag = document.createElement("span"); navTag.className = "tag"; navTag.textContent = "Preview only";
    d.appendChild(navTag);
    d.addEventListener("click", function () { showDetails(d); });
    nav.appendChild(d);
    buttons.push(d);
  }
  document.getElementById("toggle-side").addEventListener("click", function () { document.getElementById("app").classList.toggle("collapsed"); });
  // The storefront sets the scheme from its own light/dark switch, and hears this page's toggle back.
  var darkButton = document.getElementById("toggle-dark");
  function setScheme(dark) {
    root.classList.toggle("dark", dark);
    darkButton.setAttribute("aria-pressed", String(dark));
  }
  darkButton.addEventListener("click", function () {
    var dark = !root.classList.contains("dark");
    setScheme(dark);
    if (window.parent !== window) window.parent.postMessage({ type: "voilet:scheme", scheme: dark ? "dark" : "light" }, "*");
  });
  window.addEventListener("message", function (e) {
    if (e.data && e.data.type === "voilet:scheme") setScheme(e.data.scheme === "dark");
  });
  show(0);
})();
