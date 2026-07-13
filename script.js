/* CrackAnalytics — single-page tab logic + shared features */

/* ---------- Tab switching ---------- */
var VALID_TABS = ["home","introduction","projects","powerbi","tableau","excel","sql","dsai","company","resume","ba","warehousing","resources"];

function showTab(id){
  if(VALID_TABS.indexOf(id) === -1) id = "home";
  document.querySelectorAll(".tab-section").forEach(function(s){
    s.classList.toggle("active", s.id === id);
  });
  document.querySelectorAll("nav.tabs a").forEach(function(a){
    a.classList.toggle("active", a.getAttribute("data-tab") === id);
  });
  /* close mobile menu after choosing */
  var t = document.getElementById("tabs");
  if(t) t.classList.remove("open");
  window.scrollTo({top:0, behavior:"instant"});
}

function currentHashTab(){
  return (location.hash || "#home").replace("#","");
}

/* Mobile menu */
function toggleMenu(){
  var t = document.getElementById("tabs");
  if(t) t.classList.toggle("open");
}

document.addEventListener("DOMContentLoaded", function(){
  /* open the tab from the URL (#sql etc.) so links are shareable */
  showTab(currentHashTab());
  window.addEventListener("hashchange", function(){ showTab(currentHashTab()); });

  /* Copy buttons for SQL / code blocks */
  document.querySelectorAll("pre").forEach(function(pre){
    var btn = document.createElement("button");
    btn.className = "copy-btn";
    btn.textContent = "Copy";
    btn.addEventListener("click", function(){
      var code = pre.querySelector("code");
      navigator.clipboard.writeText(code ? code.innerText : pre.innerText).then(function(){
        btn.textContent = "Copied!";
        setTimeout(function(){ btn.textContent = "Copy"; }, 1500);
      });
    });
    pre.appendChild(btn);
  });

  initCounter();
});

/*
  VISITOR COUNTER
  ----------------
  Free CounterAPI (counterapi.dev) keeps one shared count across ALL
  visitors. Each browser session is counted once.

  IMPORTANT: change WORKSPACE to your own unique name before deploying
  (e.g. 'crackanalytics-mahendra-2026') so nobody shares your counter.

  If the API is unreachable, a locally stored number is shown so the
  card never looks broken. For a 100% reliable counter later, switch
  to Supabase (free) — ask Claude for the setup when ready.
*/
var WORKSPACE = "crackanalytics-mahendra-2026";
var COUNTER = "visits";

function initCounter(){
  var el = document.getElementById("visit-count");
  if(!el) return;

  var KEY = "ca_visit_cache";
  var shouldIncrement = !sessionStorage.getItem("ca_counted");
  var url = "https://api.counterapi.dev/v1/" + WORKSPACE + "/" + COUNTER + (shouldIncrement ? "/up" : "");

  fetch(url)
    .then(function(r){ if(!r.ok) throw new Error("bad response"); return r.json(); })
    .then(function(data){
      var n = data.count || data.value || 0;
      el.textContent = n.toLocaleString("en-IN");
      localStorage.setItem(KEY, n);
      if(shouldIncrement) sessionStorage.setItem("ca_counted", "1");
    })
    .catch(function(){
      var cached = parseInt(localStorage.getItem(KEY) || "0", 10);
      if(shouldIncrement){ cached += 1; sessionStorage.setItem("ca_counted","1"); }
      localStorage.setItem(KEY, cached);
      el.textContent = cached.toLocaleString("en-IN");
    });
}


/* ---------- Company-wise sub-buttons ---------- */
function showCompany(id){
  document.querySelectorAll(".co-panel").forEach(function(p){
    p.classList.toggle("active", p.id === "co-" + id);
  });
  document.querySelectorAll(".co-btn").forEach(function(b){
    b.classList.toggle("active", b.getAttribute("data-co") === id);
  });
}

/* ---------- In-site PDF reader (question banks are read-only on site) ---------- */
function openViewer(path, title){
  var ov = document.getElementById("pdf-overlay");
  var fr = document.getElementById("pdf-frame");
  document.getElementById("pdf-title").textContent = title || "Document";
  fr.src = path + "#toolbar=0&navpanes=0";
  ov.classList.add("open");
  document.body.style.overflow = "hidden";
}
function closeViewer(e){
  if(e && e.target && e.target.id !== "pdf-overlay" && !e.target.classList.contains("pdf-close")) return;
  var ov = document.getElementById("pdf-overlay");
  var fr = document.getElementById("pdf-frame");
  ov.classList.remove("open");
  fr.src = "";
  document.body.style.overflow = "";
}
document.addEventListener("keydown", function(e){ if(e.key === "Escape") closeViewer(); });
