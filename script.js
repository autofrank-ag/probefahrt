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

document.getElementById("clearSig").onclick = ()=>{ ctx.clearRect(0,0,canvas.width,canvas.height); };

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

  // Pflichtfelder prüfen
  form.querySelectorAll("[required]").forEach(field=>{
    field.style.border = "";
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
  let y = 10;

  // Logo
  const logo = new Image();
  logo.src = 'assets/autofrank-logo.png';
  logo.onload = () => {

    pdf.addImage(logo,'PNG',12,10,50,20);
    pdf.setFontSize(16);
    pdf.text("Probefahrt – Autofrank AG", 12, 35);
    y = 40;
    pdf.setFontSize(12);

    // 1. Fahrer & Kontaktdaten
    pdf.text("1. Fahrer- & Kontaktdaten", 12, y); y+=6;
    ["name","vorname","adresse","plzOrt","mobile","email","geburtsdatum","ausweisNr"].forEach(f=>{
      pdf.text(`${document.getElementById(f).previousElementSibling.textContent} ${document.getElementById(f).value}`, 12, y);
      y+=6;
    });

    // 2. Fahrzeug
    y+=2; pdf.text("2. Fahrzeug", 12, y); y+=6;
    ["marke","modell","kontrollschild","kilometerstand","vin","wagenNr"].forEach(f=>{
      pdf.text(`${document.getElementById(f).previousElementSibling.textContent} ${document.getElementById(f).value}`, 12, y);
      y+=6;
    });

    // 3. Probefahrt-Daten
    y+=2; pdf.text("3. Probefahrt-Daten", 12, y); y+=6;
    pdf.text(`Startzeit: ${document.getElementById("startzeit").value}`, 12, y); y+=6;
    pdf.text(`Endzeit: ${document.getElementById("endzeit").value}`, 12, y); y+=6;

    // 4. Mitarbeiter
    y+=2; pdf.text(`4. Mitarbeiter: ${document.getElementById("mitarbeiter").value}`, 12, y); y+=6;
    // 5. Verkäufer
    pdf.text(`5. Verkäufer: ${document.getElementById("verkaeufer").value}`, 12, y); y+=6;

    // 6. Versicherung
    y+=2; pdf.text("6. Versicherung", 12, y); y+=6;
    pdf.text(`Selbstbehalt: ${document.getElementById("selbstbehalt").value}`, 12, y); y+=6;
    pdf.text(`Lenker: ${document.getElementById("lenkerAlter").value}`, 12, y); y+=6;

    // 7. Sonstiges
    y+=2; pdf.text("7. Sonstiges", 12, y); y+=6;
    pdf.text(`Bemerkungen: ${document.getElementById("bemerkungen").value}`, 12, y); y+=6;
    pdf.text(`Hinweise: ${document.getElementById("hinweise").value}`, 12, y); y+=6;

    // 8. Ausweis-Foto
    const foto = document.getElementById("fotoPreview");
    if(foto && foto.src && foto.style.display!=="none"){
      y+=2; pdf.text("8. Ausweis-Foto", 12, y); y+=4;
      pdf.addImage(foto.src,"JPEG",12,y,60,40); y+=45;
    }

    // 9. Datenschutz
    y+=2; pdf.text("9. Datenschutz",12,y); y+=6;
    const dsCheck = document.getElementById("datenschutzOk").checked ? "Ja":"Nein";
    pdf.text(`Datenschutz akzeptiert: ${dsCheck}`,12,y); y+=10;

    // 10. Signaturen
    y+=2; pdf.text("10. Unterschriften",12,y); y+=6;
    if(sigF){
      pdf.addImage(sigF,"PNG",12,y,60,25);
      pdf.text(`${document.getElementById("vorname").value} ${document.getElementById("name").value}`,12,y+27);
    }
    if(sigG){
      pdf.addImage(sigG,"PNG",80,y,60,25);
      pdf.text(`${document.getElementById("mitarbeiter").value}`,80,y+27);
    }

    // Dynamischer Dateiname
    const vorname = document.getElementById("vorname").value || "Vorname";
    const name = document.getElementById("name").value || "Nachname";
    const now = new Date();
    const timestamp = now.getFullYear().toString()+
                      String(now.getMonth()+1).padStart(2,'0')+
                      String(now.getDate()).padStart(2,'0')+"_"+ 
                      String(now.getHours()).padStart(2,'0')+
                      String(now.getMinutes()).padStart(2,'0')+
                      String(now.getSeconds()).padStart(2,'0');

    pdf.save(`Probefahrt_${vorname}_${name}_${timestamp}.pdf`);
  };
};
