/* =====================================================================
   Botschaften für Selfcare Studio
   ---------------------------------------------------------------------
   Hier stehen kleine, bestärkende Nachrichten, die die App an besonderen Momenten
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
  // Absender: erscheint als „Eine Nachricht von …“ und als Unterschrift
  von: "Selfcare Studio",
  texte: {
    // Einmal, beim ersten Öffnen nach dem Update (auf der Startseite)
    "willkommen": "Schön, dass du da bist!\nAb und zu wartet hier eine kleine Nachricht auf dich – an besonderen Tagen und manchmal einfach so.",

    // Am Geburtstag (falls im Profil eingetragen), jedes Jahr (auf der Startseite)
    "geburtstag": "Alles Gute zum Geburtstag!\nAuf ein starkes neues Lebensjahr.",

    // Nach dem 10., 25., 50. … Training (alle Arten zusammen)
    "training-10": "Zehn Trainings!\nDer Anfang ist geschafft – und was für einer.",
    "training-25": "25 Trainings!\nDu bleibst dran. Stark.",
    "training-50": "50 Trainings!\nEin echter Meilenstein. Glückwunsch!",
    "training-75": "75 Trainings. Beeindruckend, wie konsequent du dabei bist.",
    "training-100": "100 Trainings!\nEine dreistellige Zahl – das ist richtig groß. Herzlichen Glückwunsch!",
    "training-150": "150 Trainings. Beständigkeit wie aus dem Lehrbuch.",
    "training-200": "200 Trainings! Darauf kannst du stolz sein.",
    "training-250": "250 Trainings. Ein Vierteltausend – stark!",
    "training-300": "300 Trainings!\nWas für eine Leistung. Weiter so!",
    "training-400": "400 Trainings. Einfach großartig.",
    "training-500": "500 Trainings!\nEin halbes Tausend. Ganz herzlichen Glückwunsch zu dieser Leistung!",

    // Wochen am Stück mit mindestens 2 Einheiten
    "serie-4": "Vier Wochen am Stück!\nSo sieht Dranbleiben aus.",
    "serie-8": "Acht Wochen in Folge. Richtig stark!",
    "serie-12": "Zwölf Wochen in Folge – ein ganzes Vierteljahr. Hut ab!",
    "serie-26": "Ein halbes Jahr, Woche für Woche. Großartig!",
    "serie-52": "Ein ganzes Jahr, jede einzelne Woche.\nDas ist eine außergewöhnliche Leistung!",

    // Rekorde insgesamt (1 = der nächste Rekord, wenn noch keiner da war)
    "rekorde-1": "Neuer Rekord!\nDer erste von vielen.",
    "rekorde-10": "Zehn Rekorde! Es geht sichtbar voran.",
    "rekorde-25": "25 Rekorde. Schritt für Schritt stärker – schwarz auf weiß.",
    "rekorde-50": "50 Rekorde! Eine beeindruckende Entwicklung.",

    // Lieber kurz als gar nicht: 1., 5., 10. Mal statt auszulassen kurz trainiert
    "kurz-1": "Lieber kurz als gar nicht – genau richtig!\nAuch kurze Einheiten bringen dich weiter.",
    "kurz-5": "Fünf Mal kurz statt gar nicht. So bleibt man dran!",
    "kurz-10": "Zehn Mal kurz statt gar nicht. Stark, wie du dranbleibst!",

    // Wieder da: erstes Training nach einer Lücke von 6+ Tagen oder nach
    // einer verpassten/ausgelassenen Einheit (kann öfter kommen)
    "comeback": "Schön, dass du wieder da bist!\nJedes Training zählt – auch und gerade dieses.",

    // Zwischendurch: ab und zu nach einem Training, frühestens 6 Einheiten
    // nach der letzten Nachricht, jede nur einmal. Beliebig viele.
    "zwischendurch": [
      "Gut gemacht! Wieder ein Training geschafft.",
      "Jede Einheit zählt – diese auch.",
      "Satz für Satz, Woche für Woche: Es geht voran.",
      "Stark, dass du heute dabei warst.",
      "Training erledigt. Darauf kannst du stolz sein.",
      "Kleine Schritte, große Wirkung. Weiter so!",
      "Schon wieder ein Training mehr auf deiner Kette. Schön!",
      "Dranbleiben lohnt sich – du bist der beste Beweis.",
    ],
  },
};
