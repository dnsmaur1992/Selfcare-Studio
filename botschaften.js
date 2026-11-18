/* =====================================================================
   Botschaften für Selfcare Studio
   ---------------------------------------------------------------------
   Hier stehen persönliche Nachrichten, die die App an besonderen Momenten
   zeigt (direkt nach dem Training oder auf der Startseite). Nach dem
   Öffnen bleiben sie in der App unter Verlauf → Rückblick zum Nachlesen.

   So geht's:
   - Text zwischen die Anführungszeichen schreiben: "Dein Text"
   - Leer lassen ("") = an diesem Moment kommt keine Nachricht.
   - Neue Zeile im Text: \n   (z. B. "Hallo Schatz,\nich bin stolz auf dich.")
   - Anführungszeichen im Text bitte als „ “ schreiben, nicht als ".
   - Jede Zeile endet mit einem Komma.
   - Nachrichten kommen nur beim Erreichen des Moments. Ist er schon
     vorbei, wenn du den Text einträgst, kommt diese Nachricht nicht mehr.

   Achtung: Das Repo ist öffentlich – wer die Seite auf GitHub ansieht,
   kann diese Texte lesen.
   ===================================================================== */
window.SC_BOTSCHAFTEN = {
  von: "Dennis",
  texte: {
    // Einmal, beim ersten Öffnen nach dem Update (auf der Startseite)
    "willkommen": "",

    // An ihrem Geburtstag, jedes Jahr (auf der Startseite)
    "geburtstag": "",

    // Nach dem 10., 25., 50. … Training (alle Arten zusammen)
    "training-10": "",
    "training-25": "",
    "training-50": "",
    "training-75": "",
    "training-100": "",
    "training-150": "",
    "training-200": "",
    "training-250": "",
    "training-300": "",
    "training-400": "",
    "training-500": "",

    // Wochen am Stück mit mindestens 2 Einheiten
    "serie-4": "",
    "serie-8": "",
    "serie-12": "",
    "serie-26": "",
    "serie-52": "",

    // Rekorde insgesamt (1 = der nächste Rekord, wenn noch keiner da war)
    "rekorde-1": "",
    "rekorde-10": "",
    "rekorde-25": "",
    "rekorde-50": "",

    // Lieber kurz als gar nicht: 1., 5., 10. Mal statt auszulassen kurz trainiert
    "kurz-1": "",
    "kurz-5": "",
    "kurz-10": "",

    // Wieder da: erstes Training nach einer Lücke von 6+ Tagen oder nach
    // einer verpassten/ausgelassenen Einheit (kann öfter kommen)
    "comeback": "",

    // Zwischendurch: ab und zu nach einem Training, frühestens 6 Einheiten
    // nach der letzten Nachricht, jede nur einmal. Beliebig viele.
    "zwischendurch": [
      "",
      "",
    ],
  },
};
