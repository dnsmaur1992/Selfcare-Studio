# Dev-Update: Technikniveau und Fitness getrennt

Nur für https://github.com/dnsmaur1992/ringzeit-dev — Ausgangsstand b3fd728.
Die stabile Ringzeit-App wird mit diesem Paket nicht aktualisiert.

## Hochladen

1. Zuerst in der bisherigen Dev-App eine Sicherung exportieren.
2. ZIP entpacken. Enthalten sind nur neue/geänderte Dateien; die Ordnerstruktur gehört zum Repository.
3. Die Dateien im Dev-Repository in den gleichen Pfaden ersetzen. `src/app`, `src/core`, `tests` und `docs`
   enthalten Quelldateien, Tests und Dokumentation; `index.html` und `sw.js` sind die fertige App.
4. Nichts löschen, nichts nach ringzeit hochladen. Nicht nur `index.html` ersetzen: der Quellstand muss mitkommen.
5. GitHub-Pages-Veröffentlichung abwarten, App schließen und neu öffnen; bei zunächst altem Stand nochmals neu starten.

## Was sich ändert

- Unter Profil → Über mich → Sport & Gürtel für jede Sportart bzw. WT/ITF wählen:
  Grundlagen / Geübt / Erfahren. Die Beschreibung benennt bereits erlernte Techniken.
- Keine technischen Fitness-Sperren. Das technische Niveau ändert weder Gürtel noch Turnierziel.
- Ein vollständiger vergleichbarer Fitnesstest dosiert körperliche Belastung unabhängig von der Technik.
  Technikbewertung im Test bleibt Verlaufsinformation und schaltet keine Techniken frei.
- Der vorige Hauptsport behält sein gewähltes Technikniveau. Neue Sportarten/Styles beginnen bei Grundlagen;
  ihre Werte bleiben beim Hin-/Herwechsel erhalten.
- Ohne Test startet ein neues Profil körperlich zurückhaltend. Bestehende Profile behalten zunächst ihre
  bisher gewählte körperliche Grundeinstellung; neue vollständige Fitnesstests bestimmen die Dosierung.
- Begonnene Einheiten behalten ihre gespeicherten Dosierungen. Noch nicht begonnene Einheiten werden nach
  relevanten Änderungen beim nächsten Öffnen passend neu erstellt.
- Alters-, Grad- und Einschränkungsregeln, feste Kampfformate, Tagesform und Belastungssteuerung bleiben aktiv.

## Bitte auf dem Handy prüfen

1. **Bestehendes Profil:** Daten, Verlauf, bisheriges Niveau und Gürtel sind noch da.
2. **Erfahrung unabhängig:** Ohne neuen Fitnesstest zwischen Grundlagen und Erfahren wechseln.
   Es erscheinen keine Fitness-Sperren; die Beschreibungen ändern sich passend. Die körperliche
   Dosierungsstufe im Fitnesstest-Bereich steigt dadurch nicht automatisch.
3. **Sportwechsel:** Für Boxen Geübt wählen, zum vorherigen Sport wechseln und zurück.
   Beide Auswahlen bleiben erhalten. Dasselbe für WT und ITF mit unterschiedlichen Auswahlen testen.
4. **Einheit läuft:** Eine Einheit beginnen. Danach Erfahrung ändern bzw. einen neuen Test speichern.
   Beim Zurückkehren bleiben bisherige Einträge und laufende Übungsdosierungen erhalten.
5. **Getrennte Steuerung:** Falls du dafür einen Test mit Beispielwerten eingibst, ausschließlich im Dev-Profil
   nach Sicherung testen und danach die Sicherung zurückladen. Wenige Liegestütze/langsamer Lauf dürfen
   das gewählte Technikniveau Erfahren nicht herabsetzen. Gute Fitnesswerte schalten bei Grundlagen keine
   technisch komplexen Kombinationen frei. Für Änderungen einen noch nicht begonnenen Plan öffnen.
6. **Einrichtung/Sprachen:** Bei einem frischen Dev-Profil ist die Technik-Auswahl bereits in der ersten
   Einrichtungsseite sichtbar. DE und EN prüfen; weder Layout noch Buttons sollen abgeschnitten sein.
7. **Rückladen:** Dev-Sicherung exportieren und laden; Auswahlen je Sport/Style bleiben gleich.

Die Oberfläche und Ansagen müssen auf einem echten Gerät abgenommen werden. Automatisch bestanden:
246 Tests sowie die abschließende Ablauf-Matrix mit 216 Einheiten und Zusatzprüfungen.
Die bisherige Kickbox-Vergleichsbasis hat nur zusätzliche Dosierungs-/Technik-Metadaten erhalten;
bei identischen Ausgangseinstellungen bleiben ihre Pläne, Texte und Timer gleich.
