# Selfcare Studio – Merkliste

Offene Wünsche für die nächsten Versionen. Erledigtes steht unten mit Version.

## Bei jedem Update
- Versionsnummer erhöhen (Profil unten, steuert auch den Cache in `sw.js`).
- **„Was ist neu“ (`NEWS` in `index.html`) auf die neue Version setzen** und die Änderungen in 3–6 kurzen Punkten beschreiben. Das Fenster erscheint dann bei jeder Nutzerin einmal beim nächsten Öffnen.
- Erledigtes unten in dieser Liste abhaken, `docs/trainingslogik.md` und Tests nachziehen.

## Offen
- [ ] **Auf dem echten iPhone prüfen** (ging hier nur in der Simulation):
  - Gong und Pieptöne nach Sprachansagen, mit laufender Musik und mit Lautlos-Schalter.
  - Abstand oben (Inhalt nicht unter Uhrzeit/Akku), besonders im Vollbild-Training und bei der App-Tour.
  - Update-Hinweis „Neue Version ist da – Jetzt laden“ nach dem Hochladen.
- [ ] **Arbeitsweise:** Das Repo direkt in die Claude-Sitzung einbinden (wie bei Ringzeit; claude.ai → Einstellungen → Konnektoren → GitHub). Dann kann Claude `TODO.md`, Doku und Code im Repo lesen und mit Schreibrechten direkt committen, statt dass jede Datei per Handy hochgeladen werden muss. Quellcode dann wie bei Ringzeit unter `src/`, `index.html` wird daraus gebaut.

## Bewusst nicht umgesetzt
- **Unhörbarer Dauerton** gegen das Einschlafen der Audioausgabe (Ringzeit-Idee): Er würde laufende Musik auf dem iPhone dauerhaft leiser stellen. Stattdessen Gong als echte Tondatei und Freischalten beim ersten Antippen.

## Erledigt in Version 2.8
- [x] Werte vom letzten Mal: Arbeitssätze und Aufwärmsätze starten mit Gewicht und Wiederholungen vom letzten Training; ohne Vorlage übernimmt der nächste Aufwärmsatz den vorigen.

## Erledigt in Version 2.7
- [x] Satzpause standardmäßig 3 Minuten (bestehende Voreinstellung einmalig angehoben), gut sichtbar einstellbar: Einrichtung, Profil, Training vorbereiten, im Satz und in der Pause.
- [x] Gewicht und Wiederholungen werden in den nächsten Satz übernommen, nur noch bestätigen.

## Erledigt in Version 2.6
- [x] Körperdaten (freiwillig): Geburtsjahr, Größe, Gewicht in Einrichtung und Profil; Gewicht mit Verlauf bei den Maßen.
- [x] Daraus: Alter, Maximalpuls und Pulsbereiche beim Cardio, BMI, Taille-zu-Größe, Kraft im Verhältnis zum Körpergewicht, Körperdaten im Physio-Auszug.

## Erledigt in Version 2.5
- [x] Rückwege beim Aufwärmen: im Aufwärmsatz „Doch kein Aufwärmsatz“, beim ersten Arbeitssatz „Stattdessen erst einen Aufwärmsatz“.

## Erledigt in Version 2.4
- [x] Springen über die Übersicht hakt nichts mehr ab: Ausgelassenes gilt als „übersprungen“, Stand je Übung (✓, 1/3, übersprungen), × zum Entfernen, am Ende Nachholen anbieten.

## Erledigt in Version 2.3
- [x] Aufwärmsätze auf Nachfrage bei jeder großen Übung („Möchtest du einen Aufwärmsatz machen?“, danach „Noch ein Aufwärmsatz?“), mit Gewichtsvorschlag.
- [x] Aufwärmsätze werden gespeichert, im Verlauf angezeigt und in der Gesamtlast (kg pro Training) mitgezählt; Sätze, Rekorde und Fortschritt zählen nur Arbeitssätze.
- [x] Fokus-Block „Körperfett verlieren“: Muskeln halten, kürzere Pausen, 12 Min Ausdauer zum Schluss, Vergleich der Maße.
- [x] „Übung hinzufügen“ scrollt wieder und ist nach Muskelgruppen gruppiert.
- [x] App-Tour ohne Wischen und Scrollen.

## Erledigt in Version 2.2
**Neu**
- [x] „Was ist neu“ mit aufklappbaren früheren Versionen.
- [x] „Deine Figur“: Frisur (Zopf, Dutt, Kurz, Lang offen, Cap, Ohne) und Haarfarbe, in Einrichtung und Profil, in allen Animationen. Voreinstellung Zopf.
- [x] App-Tour mit Spotlight in 8 Stationen, Training als Beispiel ohne echte Einheit; einmal angeboten, jederzeit im Profil.
- [x] Zum Lesen: 6 Themen (Mythen-Check, Krafttraining ab 40, Rücken, Schlaf, Entlastungswochen, Ersatzübungen) mit Quellen, im Profil und in längeren Pausen.

**Aus Ringzeit gelernt, Teil 2**
- [x] Gong als in der App erzeugte WAV-Datei über `<audio>`, Ton und Sprache beim ersten Antippen freigeschaltet, erst Gong, dann Ansage.
- [x] Letzte 3 Sekunden mit Pieptönen (Bereit machen und Pause).
- [x] Erfolgsmomente: Häkchen, hochzählende Zahlen, Wochenring, goldene Karte bei kompletter Woche, Abzeichen mit Lichtschimmer, Gesamtbilanz, Funken. Rücksicht auf „Bewegung reduzieren“.
- [x] Pause lebendiger: Ring pulsiert und färbt sich in den letzten 10 Sekunden, Blitz bei Satzbeginn, „Letzter Satz!“.
- [x] Lebendige Startseite: Farbstimmung nach Tageszeit, sanfte Übergänge zwischen den Tabs.
- [x] Fokus-Blöcke (6 Wochen: Po aufbauen, Rücken stärken, Stärker werden) mit Vorher-nachher-Vergleich.

**Aus Ringzeit gelernt, Teil 1**
- [x] „Erst installieren, dann einrichten“ – Hinweis im ersten Einrichtungsschritt und in `installieren.html`.
- [x] `navigator.storage.persist()` und Backup-Erinnerung alle 30 Tage.
- [x] Hinweis zum Lautlos-Schalter und „Ton testen“ im Profil.
- [x] Pausen (krank / verletzt / Urlaub): Plan ruht, Serie bleibt, sanfter Wiedereinstieg.
- [x] Verpasste Einheiten: Nachholen / Auslassen mit Rückgängig.
- [x] Warnung bei gleichen Muskeln an zwei Tagen hintereinander.
- [x] „Kurz zur Sicherheit“ einmal nach der Einrichtung bzw. nach dem Update.
- [x] Seite „Hinweise & Datenschutz“.
- [x] Update-Hinweis „Neue Version ist da – Jetzt laden“.
- [x] Feedback senden (WhatsApp, Mail, Kopieren) mit Version und Gerät.
- [x] Auszug für Physio oder Trainerin (letzte 4 Wochen).
- [x] 6-Wochen-Check.
- [x] README: Hochladen vom iPhone und „Actions“ erklärt.
- [x] Tests erweitert (21 Prüfungen, mit 2.3: 28, mit 2.4: 33, mit 2.5: 36, mit 2.6: 41, mit 2.7: 45, mit 2.8: 47).

## Erledigt in Version 2.1
- [x] Zoomen mit zwei Fingern und per Doppeltipp verhindert (Viewport, `touch-action: manipulation`, `gesturestart` abgefangen, Eingabefelder ≥ 16 px).
- [x] Keine „Frei?“-Frage bei Matte, Band und Gymnastikball. Ist eine solche Übung Ersatz für eine Maschine, steht nur „… ist jetzt frei“ für die ursprüngliche Maschine da.
- [x] Mini-Training ganz ohne Gerätefrage.
- [x] Mini-Aufwärmen: 5 Min Mobilisation und Andehnen nach Tagesart (viel gesessen / gestanden / gehoben & gebückt / gemischt), Voreinstellung im Profil unter „Dein Alltag“.
- [x] Darstellung Automatisch / Hell / Dunkel.
- [x] Gerätezeiten lernen: „Frei“/„Besetzt“ wird mit Wochentag und Uhrzeit gemerkt, oft besetzte Geräte kommen später dran. Übersicht unter Profil → Geräte.
- [x] Musik-Knopf ♪ im Training (Playlist-Link im Profil).
- [x] Erfolge: Wochenserie, Rekorde, 15 Abzeichen, Trainingskalender der letzten 12 Wochen.
- [x] Trainingstage als wiederkehrende Termine in den iPhone-Kalender (nur in der installierten App).
- [x] Körpermaße (Taille, Hüfte, Po, Oberschenkel) mit Verlauf.
- [x] Eigenes Outfit mit freier Farbwahl.
- [x] Trainingstag per Link teilen und übernehmen.
