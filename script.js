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
   PDF EXPORT
=========================================================== */
document.getElementById("pdfBtn").onclick = async ()=>{

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ unit:"mm", format:"a4" });

  pdf.setFontSize(16);
  pdf.text("Probefahrt – Autofrank AG", 12, 12);

  pdf.setFontSize(11);
  pdf.text(`Name: ${document.getElementById("name").value}`, 12, 24);
  pdf.text(`Vorname: ${document.getElementById("vorname").value}`, 12, 32);
  pdf.text(`Adresse: ${document.getElementById("adresse").value}`, 12, 40);
  pdf.text(`PLZ/Ort: ${document.getElementById("plz").value}`, 12, 48);
  pdf.text(`Mobile: ${document.getElementById("mobile").value}`, 12, 56);
  pdf.text(`E-Mail: ${document.getElementById("email").value}`, 12, 64);
  pdf.text(`Geburtsdatum: ${document.getElementById("geburtsdatum").value}`, 12, 72);
  pdf.text(`Führerausweis-Nr.: ${document.getElementById("ausweisNr").value}`, 12, 80);

  pdf.text(`Marke: ${document.getElementById("marke").value}`, 12, 96);
  pdf.text(`Modell: ${document.getElementById("modell").value}`, 12, 104);
  pdf.text(`Kontrollschild: ${document.getElementById("schild").value}`, 12, 112);
  pdf.text(`Kilometerstand: ${document.getElementById("kilometerstand").value}`, 12, 120);
  pdf.text(`VIN: ${document.getElementById("vin").value}`, 12, 128);

  // Unterschriften
  const sigF = document.getElementById("sigDataFahrer").value;
  const sigG = document.getElementById("sigDataGarage").value;
  if(sigF){
    pdf.addImage(sigF, "PNG", 12, 140, 50, 20);
    pdf.text("Fahrer:in", 12, 135);
  }
  if(sigG){
    pdf.addImage(sigG, "PNG", 80, 140, 50, 20);
    pdf.text("Garage", 80, 135);
  }

  // Ausweis-Foto
  const foto = document.getElementById("fotoPreview");
  if(foto && foto.src && foto.style.display!=="none"){
    pdf.addImage(foto.src, "JPEG", 12, 170, 60, 40);
  }

  pdf.save("probefahrt_autofrank.pdf");
};
