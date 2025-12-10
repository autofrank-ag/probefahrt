// FOTO-Preview
document.getElementById("ausweisFoto").addEventListener("change", e=>{
  const file = e.target.files[0];
  const img = document.getElementById("fotoPreview");
  if(!file){ img.style.display="none"; img.src=""; return; }
  const reader = new FileReader();
  reader.onload = ev => { img.src = ev.target.result; img.style.display="block"; }
  reader.readAsDataURL(file);
});

// Signatur-Modal
let currentSig=null;
const canvas=document.createElement("canvas");
canvas.width=400; canvas.height=220;
const ctx=canvas.getContext("2d");
ctx.lineWidth=2; ctx.lineCap="round";
let drawing=false;

canvas.addEventListener("mousedown",e=>{drawing=true; ctx.beginPath(); ctx.moveTo(e.offsetX,e.offsetY);});
canvas.addEventListener("mousemove",e=>{if(drawing){ctx.lineTo(e.offsetX,e.offsetY);ctx.stroke();}});
canvas.addEventListener("mouseup",()=>drawing=false);
canvas.addEventListener("mouseleave",()=>drawing=false);

// Touch support
canvas.addEventListener("touchstart",e=>{e.preventDefault(); const t=e.touches[0]; const r=canvas.getBoundingClientRect(); ctx.beginPath(); ctx.moveTo(t.clientX-r.left,t.clientY-r.top); drawing=true;});
canvas.addEventListener("touchmove",e=>{e.preventDefault(); if(!drawing)return; const t=e.touches[0]; const r=canvas.getBoundingClientRect(); ctx.lineTo(t.clientX-r.left,t.clientY-r.top); ctx.stroke();});
canvas.addEventListener("touchend",e=>{drawing=false;});

document.querySelectorAll(".signature-box").forEach(box=>{box.onclick=()=>{
  currentSig=box.dataset.target; ctx.clearRect(0,0,canvas.width,canvas.height);
  document.body.appendChild(canvas);
  canvas.style.position="fixed"; canvas.style.left="50%"; canvas.style.top="50%"; canvas.style.transform="translate(-50%,-50%)"; canvas.style.zIndex="9999"; canvas.style.border="1px solid #000";
}});
canvas.addEventListener("dblclick",()=>{document.body.removeChild(canvas);});

// PDF-Export
document.getElementById("pdfBtn").onclick=()=>{
  const {jsPDF}=window.jspdf;
  const pdf=new jsPDF({unit:"mm",format:"a4"});
  let y=10;

  // Logo
  const logo=new Image();
  logo.src='assets/autofrank-logo.png';
  logo.onload=()=>{
    pdf.addImage(logo,'PNG',12,10,50,20);
    pdf.setFontSize(16); pdf.text("Probefahrt – Autofrank AG",12,35);
    y=40; pdf.setFontSize(12);

    // Fahrer-Daten
    pdf.text("1. Fahrer- & Kontaktdaten",12,y); y+=6;
    ["name","vorname","adresse","plzOrt","mobile","email","geburtsdatum","ausweisNr"].forEach(f=>{
      pdf.text(`${document.getElementById(f).placeholder} ${document.getElementById(f).value}`,12,y); y+=6;
    });

    // Fahrzeug
    y+=2; pdf.text("2. Fahrzeug",12,y); y+=6;
    ["marke","modell","kontrollschild","kilometerstand","vin","wagenNr"].forEach(f=>{
      pdf.text(`${document.getElementById(f).placeholder} ${document.getElementById(f).value}`,12,y); y+=6;
    });

    // Probefahrt-Daten
    y+=2; pdf.text("3. Probefahrt-Daten",12,y); y+=6;
    pdf.text(`Startzeit: ${document.getElementById("startzeit").value}`,12,y); y+=6;
    pdf.text(`Endzeit: ${document.getElementById("endzeit").value}`,12,y); y+=6;

    // Mitarbeiter + Verkäufer
    y+=2; pdf.text(`4. Mitarbeiter: ${document.getElementById("mitarbeiter").value}`,12,y); y+=6;
    pdf.text(`5. Verkäufer: ${document.getElementById("verkaeufer").value}`,12,y); y+=6;

    // Versicherung
    y+=2; pdf.text("6. Versicherung",12,y); y+=6;
    pdf.text(`Selbstbehalt: ${document.getElementById("selbstbehalt").value}`,12,y); y+=6;
    pdf.text(`Lenker: ${document.getElementById("lenkerAlter").value}`,12,y); y+=6;

    // Sonstiges
    y+=2; pdf.text("7. Sonstiges",12,y); y+=6;
    pdf.text(`Bemerkungen: ${document.getElementById("bemerkungen").value}`,12,y); y+=6;
    pdf.text(`Hinweise: ${document.getElementById("hinweise").value}`,12,y); y+=6;

    // Ausweis-Foto
    const foto=document.getElementById("fotoPreview");
    if(foto && foto.src && foto.style.display!=="none"){y+=2; pdf.text("8. Ausweis-Foto",12,y); y+=4; pdf.addImage(foto.src,"JPEG",12,y,60,40); y+=45;}

    // Datenschutz
    y+=2; pdf.text("9. Datenschutz",12,y); y+=6;
    const dsCheck=document.getElementById("datenschutzOk").checked?"Ja":"Nein";
    pdf.text(`Datenschutz akzeptiert: ${dsCheck}`,12,y); y+=10;

    // Signaturen
    y+=2; pdf.text("10. Unterschriften",12,y); y+=6;
    const sigF=document.getElementById("sigDataFahrer").value;
    const sigG=document.getElementById("sigDataGarage").value;
    if(sigF){pdf.addImage(sigF,"PNG",12,y,60,25); pdf.text(`${document.getElementById("vorname").value} ${document.getElementById("name").value}`,12,y+27);}
    if(sigG){pdf.addImage(sigG,"PNG",80,y,60,25); pdf.text(`${document.getElementById("mitarbeiter").value}`,80,y+27);}

    // Dynamischer Dateiname
    const vorname=document.getElementById("vorname").value||"Vorname";
    const name=document.getElementById("name").value||"Nachname";
    const now=new Date();
    const timestamp=now.getFullYear().toString()+String(now.getMonth()+1).padStart(2,'0')+String(now.getDate()).padStart(2,'0')+"_"+String(now.getHours()).padStart(2,'0')+String(now.getMinutes()).padStart(2,'0')+String(now.getSeconds()).padStart(2,'0');

    pdf.save(`Probefahrt_${vorname}_${name}_${timestamp}.pdf`);
  };
};
