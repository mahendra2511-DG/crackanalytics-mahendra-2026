/* CrackAnalytics — course mode: lessons, progress, counter, PDF reader */

var LESSONS = [];

function lessonIds(){
  if(!LESSONS.length){
    document.querySelectorAll(".lesson").forEach(function(s){ LESSONS.push(s.id); });
  }
  return LESSONS;
}

function showLesson(id){
  var ids = lessonIds();
  if(ids.indexOf(id) === -1) id = ids[0];
  document.querySelectorAll(".lesson").forEach(function(s){
    s.classList.toggle("active", s.id === id);
  });
  document.querySelectorAll(".sb-lesson").forEach(function(a){
    a.classList.toggle("active", a.getAttribute("data-lesson") === id);
  });
  var sec = id.split("-")[0];
  document.querySelectorAll(".sb-sec").forEach(function(d){
    if(d.getAttribute("data-sec") === sec) d.classList.add("open");
  });
  var sb = document.getElementById("sidebar");
  if(sb) sb.classList.remove("open");
  if(location.hash !== "#" + id){ history.replaceState(null, "", "#" + id); }
  window.scrollTo({top:0, behavior:"instant"});
}

function currentLesson(){
  var h = (location.hash || "").replace("#","");
  var ids = lessonIds();
  return ids.indexOf(h) !== -1 ? h : ids[0];
}

function gotoOffset(delta){
  var ids = lessonIds();
  var i = ids.indexOf(currentLesson());
  if(delta > 0){ setDone(ids[i], true); }
  var j = Math.min(Math.max(i + delta, 0), ids.length - 1);
  showLesson(ids[j]);
}

function toggleSec(tid){
  var d = document.querySelector('.sb-sec[data-sec="' + tid + '"]');
  if(d) d.classList.toggle("open");
}

function toggleSidebar(){
  var sb = document.getElementById("sidebar");
  if(sb) sb.classList.toggle("open");
}

function getDone(){
  try { return JSON.parse(localStorage.getItem("ca_done") || "[]"); }
  catch(e){ return []; }
}
function setDone(id, done){
  var arr = getDone();
  var i = arr.indexOf(id);
  if(done && i === -1) arr.push(id);
  if(!done && i !== -1) arr.splice(i, 1);
  localStorage.setItem("ca_done", JSON.stringify(arr));
  paintProgress();
}
function markComplete(id, checked){ setDone(id, checked); }

function paintProgress(){
  var done = getDone(), ids = lessonIds();
  document.querySelectorAll(".sb-lesson").forEach(function(a){
    a.classList.toggle("done", done.indexOf(a.getAttribute("data-lesson")) !== -1);
  });
  document.querySelectorAll("input[data-done]").forEach(function(cb){
    cb.checked = done.indexOf(cb.getAttribute("data-done")) !== -1;
  });
  var pct = ids.length ? Math.round(done.length / ids.length * 100) : 0;
  var fill = document.getElementById("sb-fill");
  if(fill) fill.style.width = pct + "%";
  var pctEl = document.getElementById("sb-pct");
  if(pctEl) pctEl.textContent = pct + "%";
  var dEl = document.getElementById("sb-done");
  if(dEl) dEl.textContent = done.length;
}

document.addEventListener("DOMContentLoaded", function(){
  showLesson(currentLesson());
  window.addEventListener("hashchange", function(){ showLesson(currentLesson()); });
  paintProgress();

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

/* VISITOR COUNTER — WORKSPACE must stay your unique name */
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

function showCompany(id){
  document.querySelectorAll(".co-panel").forEach(function(p){
    p.classList.toggle("active", p.id === "co-" + id);
  });
  document.querySelectorAll(".co-btn").forEach(function(b){
    b.classList.toggle("active", b.getAttribute("data-co") === id);
  });
}

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
