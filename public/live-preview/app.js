// DEMO-ONLY(live-preview): reads the recipe from the hash and draws a clickable admin around the
// chosen pages' captures. Nothing here leaves the page.
(function () {
  var data = { theme: "Voilet", primary: "", stack: "", pages: [] };
  try { data = Object.assign(data, JSON.parse(decodeURIComponent(location.hash.slice(1)))); } catch (e) {}
  var root = document.documentElement;
  if (/^#[0-9a-f]{3,8}$/i.test(data.primary)) root.style.setProperty("--primary", data.primary);
  document.title = data.theme + " · live preview";
  document.getElementById("brand").textContent = data.theme;
  document.getElementById("mark").textContent = data.theme.charAt(0);
  document.getElementById("stack").textContent = data.stack;
  var nav = document.getElementById("nav"), title = document.getElementById("title"), shot = document.getElementById("shot");
  function show(i) {
    var page = data.pages[i];
    if (!page) return;
    title.textContent = page.title;
    shot.src = page.src;
    shot.alt = page.title + " page";
    Array.prototype.forEach.call(nav.children, function (b, j) { b.toggleAttribute("aria-current", false); if (j === i) b.setAttribute("aria-current", "page"); });
    if (window.matchMedia("(max-width: 640px)").matches) document.getElementById("app").classList.add("collapsed");
  }
  data.pages.forEach(function (page, i) {
    var b = document.createElement("button");
    b.type = "button";
    b.textContent = page.title;
    b.addEventListener("click", function () { show(i); });
    nav.appendChild(b);
  });
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
