// DSG Text
document.getElementById("datenschutzText").textContent = `
Verantwortliche Stelle
Autofrank AG
Trockenloostrasse 65
8105 Regensdorf
Tel.: +41 43 388 68 68
E-Mail: verkauf@autofrank.ch

1) Zweck der Datenbearbeitung
Wir bearbeiten Ihre Personendaten im Rahmen der Probefahrt zum Zweck:
• der Prüfung Ihrer Fahrberechtigung
• der Durchführung und Abwicklung der Probefahrt
• der Identifikation im Schadenfall
• der Sicherstellung vertraglicher und versicherungsrechtlicher Pflichten
• der Wahrung unserer berechtigten Interessen (u. a. Schutz von Fahrzeugen)
Die Bereitstellung der Daten ist für die Durchführung einer Probefahrt erforderlich.
Ohne diese Angaben ist eine Probefahrt nicht möglich.

2) Kategorien von Personendaten
Wir bearbeiten insbesondere folgende Datenkategorien:
• Identifikationsdaten (Name, Vorname, Adresse, Geburtsdatum)
• Kontaktdaten (Telefonnummer, E-Mail falls angegeben)
• Führerausweis-Daten (Nummer, Gültigkeit)
• Fahrzeugbezogene Daten der Probefahrt (Kennzeichen, Kilometerstand, Datum, Fahrzeiten)
• Unterschrift
Falls ein Schaden entsteht, können zusätzliche Angaben erforderlich sein (z. B. Beschreibung des Vorfalls).

3) Empfänger von Personendaten
Ihre Daten können weitergegeben werden an:
• Versicherungen
• Strafverfolgungsbehörden / zuständige Ämter (nur falls erforderlich)
• Partnerunternehmen zur administrativen Unterstützung
Eine Weitergabe erfolgt ausschliesslich für die oben genannten Zwecke.

4) Aufbewahrungsdauer
Die Daten werden nur so lange gespeichert, wie dies:
• zur Erreichung der Zwecke erforderlich ist oder
• gesetzliche Aufbewahrungsfristen bestehen (z. B. Versicherungs- / Haftpflichtrecht)
Danach werden die Daten gelöscht oder anonymisiert.

5) Rechte der betroffenen Person
Sie haben nach revDSG folgende Rechte:
• Auskunft über Ihre bearbeiteten Personendaten
• Berichtigung unrichtiger oder unvollständiger Daten
• Löschung, sofern keine gesetzlichen Pflichten entgegenstehen
• Einschränkung der Bearbeitung
• Widerspruch gegen Bearbeitung, soweit sich diese auf überwiegende Interessen stützt
Anfragen richten Sie bitte an: verkauf@autofrank.ch
Wir beantworten Ihr Anliegen so schnell wie möglich und gemäss den gesetzlichen Vorgaben.

6) Datensicherheit
Wir schützen Ihre Daten mit angemessenen technischen und organisatorischen Massnahmen
gegen Verlust, unberechtigten Zugriff, Manipulation und unbefugte Weitergabe.

7) Bestätigung
Mit Ihrer Unterschrift bestätigen Sie, dass Sie diese Datenschutzinformation
zur Kenntnis genommen haben und mit der Bearbeitung der Personendaten einverstanden sind.
`;

// Foto
document.getElementById("ausweisFoto").addEventListener("change", e => {
  const file = e.target.files[0];
  const img = document.getElementById("fotoPreview");
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    img.src = ev.target.result;
    img.style.display = "block";
  };
  reader.readAsDataURL(file);
});

// Signaturen
document.querySelectorAll(".signature-box").forEach(box => {
  box.onclick = () => {
    const target = box.dataset.target;
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 150;
    canvas.style.position = "fixed";
    canvas.style.top = "50%";
    canvas.style.left = "50%";
    canvas.style.transform = "translate(-50%, -50%)";
    canvas.style.border = "2px solid black";
    canvas.style.background = "white";
    canvas.style.zIndex = "9999";
    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    let drawing = false;

    canvas.onmousedown = e => {
      drawing = true;
      ctx.beginPath();
      ctx.moveTo(e.offsetX, e.offsetY);
    };

    canvas.onmousemove = e => {
      if (drawing) {
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
      }
    };

    canvas.onmouseup = () => drawing = false;
    canvas.onmouseleave = () => drawing = false;

    canvas.ondblclick = () => {
      const data = canvas.toDataURL();
      const img = document.getElementById(target);
      document.getElementById("sigData" + target.replace("sig", "")).value = data;
      img.src = data;
      img.style.display = "block";
      canvas.remove();
    };
  };
});

// PDF = nur Druckdialog
document.getElementById("pdfBtn").onclick = () => {
  window.print();
};
