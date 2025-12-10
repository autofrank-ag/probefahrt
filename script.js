/* ===========================================================
   FOTO-PREVIEW
=========================================================== */
document.getElementById("ausweisFoto").addEventListener("change", e => {
  const file = e.target.files[0];
  const img = document.getElementById("fotoPreview");
  if (!file) return img.style.display = "none";
  const reader = new FileReader();
  reader.onload = ev => { img.src = ev.target.result; img.style.display="block"; }
  reader.readAsDataURL(file);
});

/* ===========================================================
   SIGNATUR-MODAL
=========================================================== */
let currentSig = null;
const modal = document.getElementById("modal");
const canvas = document.getElementById("signatureCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 400;
canvas.height = 220;
ctx.lineWidth = 2;
ctx.lineCap = "round";

let drawing = false;
canvas.addEventListener("mousedown", e => { drawing=true; ctx.beginPath(); ctx.moveTo(e.offsetX, e.offsetY); });
canvas.addEventListener("mousemove", e => { if(drawing){ ctx.lineTo(e.offsetX,e.offsetY); ctx.stroke(); }});
canvas.addEventListener("mouseup", ()=> drawing=false);
canvas.addEventListener("mouseleave", ()=> drawing=false);

// Touch support
canvas.addEventListener("touchstart", e => {
  e.preventDefault();
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  ctx.beginPath();
  ctx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
  drawing = true;
});
canvas.addEventListener("touchmove", e => {
  e.preventDefault();
  if(!drawing) return;
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
  ctx.stroke();
});
canvas.addEventListener("touchend", e => { drawing=false; });

document.querySelectorAll(".signature-box").forEach(box=>{
  box.onclick = ()=>{
    currentSig = box.dataset.target;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    modal.classList.add("active");
  };
});

document.getElementById("clearSig").onclick = ()=>{
  ctx.clearRect(0,0,canvas.width,canvas.height);
};

document.getElementById("saveSig").onclick = ()=>{
  const data = canvas.toDataURL("image/png");
  if(currentSig==="fahrer"){
    document.getElementById("sigDataFahrer").value=data;
    document.getElementById("sigFahrer").src=data;
    document.getElementById("sigFahrer").style.display="block";
  } else {
    document.getElementById("sigDataGarage").value=data;
    document.getElementById("sigGarage").src=data;
    document.getElementById("sigGarage").style.display="block";
  }
  modal.classList.remove("active");
};

/* ===========================================================
   VALIDIERUNG UND PDF EXPORT
=========================================================== */
document.getElementById("pdfBtn").onclick = async ()=>{
  const form = document.getElementById("probefahrtForm");
  let valid = true;

  // Alle Pflichtfelder prüfen
  form.querySelectorAll("[required]").forEach(field=>{
    field.style.border = ""; // Reset
    let error = field.nextElementSibling;
    if(error && error.classList.contains("error-msg")) error.remove();

    if(field.type==="checkbox" && !field.checked){
      valid=false;
      field.style.border="2px solid red";
      const msg = document.createElement("div");
      msg.className="error-msg";
      msg.style.color="red";
      msg.style.fontSize="0.8rem";
      msg.textContent="Bitte bestätigen";
      field.parentNode.appendChild(msg);
    } else if((field.tagName==="INPUT" || field.tagName==="SELECT" || field.tagName==="TEXTAREA") && !field.value){
      valid=false;
      field.style.border="2px solid red";
      const msg = document.createElement("div");
      msg.className="error-msg";
      msg.style.color="red";
      msg.style.fontSize="0.8rem";
      msg.textContent="Bitte ausfüllen";
      field.parentNode.appendChild(msg);
    }
  });

  // Signaturen prüfen
  const sigF = document.getElementById("sigDataFahrer").value;
  const sigG = document.getElementById("sigDataGarage").value;
  if(!sigF){ valid=false; alert("Bitte die Unterschrift Fahrer:in erfassen."); }
  if(!sigG){ valid=false; alert("Bitte die Unterschrift Garage erfassen."); }

  if(!valid) return;

  // PDF generieren
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ unit:"mm", format:"a4" });

  pdf.setFontSize(16);
  pdf.text("Probefahrt – Autofrank AG", 12, 12);

  pdf.setFontSize(11);
  let y = 24;

  // Felder in gewünschter Reihenfolge
  const fields = ["name","vorname","adresse","plzOrt","mobile","email","geburtsdatum","ausweisNr",
                  "marke","modell","kontrollschild","kilometerstand","vin",
                  "startzeit","endzeit","fahrzeugId","verkaeufer",
                  "selbstbehalt","lenkerAlter","bemerkungen","hinweise"];
  fields.forEach(f=>{
    const val = document.getElementById(f).value || "Keine Angabe";
    pdf.text(`${f}: ${val}`, 12, y);
    y+=8;
  });

  // Signaturen
  if(sigF) pdf.addImage(sigF,"PNG",12,y,50,20);
  if(sigG) pdf.addImage(sigG,"PNG",80,y,50,20);
  y+=25;

  // Ausweis-Foto
  const foto = document.getElementById("fotoPreview");
  if(foto && foto.src && foto.style.display!=="none"){
    pdf.addImage(foto.src, "JPEG", 12, y, 60, 40);
  }

  // Datenschutz
  const dsCheck = document.getElementById("datenschutzOk").checked ? "Ja" : "Nein";
  y += 45;
  pdf.text(`Datenschutz akzeptiert: ${dsCheck}`, 12, y);

  pdf.save("probefahrt_autofrank.pdf");
};
