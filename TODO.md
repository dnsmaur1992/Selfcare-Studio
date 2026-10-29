# Selfcare Studio – Merkliste

Offene Wünsche für die nächsten Versionen. Erledigtes steht unten mit Version.

## Bei jedem Update
- Versionsnummer erhöhen (Profil unten, steuert auch den Cache in `sw.js`).
- **„Was ist neu“ (`NEWS` in `index.html`) auf die neue Version setzen** und die Änderungen in 3–6 kurzen Punkten beschreiben. Das Fenster erscheint dann bei jeder Nutzerin einmal beim nächsten Öffnen.
- Erledigtes unten in dieser Liste abhaken, `docs/trainingslogik.md` und Tests nachziehen.

## Offen
- [ ] **Auf dem echten iPhone prüfen** (ging hier nur in der Simulation):
  - Gong und Pieptöne mit laufender Musik (ohne Musik auf dem iPhone bestätigt, 28.10.).
  - Abstand oben (Inhalt nicht unter Uhrzeit/Akku), besonders im Vollbild-Training und bei der App-Tour.
  - Update-Hinweis „Neue Version ist da – Jetzt laden“ nach dem Hochladen.
- [ ] **Arbeitsweise:** Das Repo direkt in die Claude-Sitzung einbinden (wie bei Ringzeit; claude.ai → Einstellungen → Konnektoren → GitHub). Dann kann Claude `TODO.md`, Doku und Code im Repo lesen und mit Schreibrechten direkt committen, statt dass jede Datei per Handy hochgeladen werden muss. Quellcode dann wie bei Ringzeit unter `src/`, `index.html` wird daraus gebaut.
- [ ] **Eigene Animationen** für Rumpfrotation, TRX-Rudern, TRX-Brustpresse und Rückenstrecker-Maschine. Sie nutzen vorerst die Animation einer ähnlichen Übung (Pallof Press, Rudern am Kabel, Liegestütz an der Bank, Hyperextension).

## Ideen (besprochen, noch nicht beauftragt)
- **Varianten für Pilates und Mobility:** Themen (Bauch & Mitte, Po & Beine, Rücken & Haltung, Ganzkörper sanft · Hüfte & Rücken, Schultern & Nacken, Ganzkörper, Abends runterfahren), 10–15 neue Positionen mit Animation, Rotation, 15 oder 30 Minuten. Bisher sind die Einheiten jedes Mal gleich.
- **Ruhige Phase & Runterkommen:** Woche mit Pilates/Mobility statt Kraft ohne Serien-Druck, geführte Atemübung (3–5 Min) von der Startseite.
- **Signalton auch beim Start der Satzpause** (bisher nur am Ende, weil der Start durch Antippen ausgelöst wird).

## Bewusst nicht umgesetzt
- **Unhörbarer Dauerton** gegen das Einschlafen der Audioausgabe (Ringzeit-Idee): Er würde laufende Musik auf dem iPhone dauerhaft leiser stellen. Stattdessen Gong als echte Tondatei und Freischalten beim ersten Antippen.

## Erledigt in Version 3.5
- [x] Akzentfarbe wählbar: Pink, Koralle, Lavendel, Petrol, Blau, Graphit (Hell und Dunkel, Kontrast geprüft), unter Profil → Darstellung & Kalender.

## Erledigt in Version 3.4
- [x] Geräte-Einweisung: für alle 33 Maschinen „Einstellen · So gelingt's · Stolpersteine“, beim ersten Mal an einem Gerät im Training aufklappbar, immer unter „Tipps“. Hilft besonders Anfängerinnen.

## Erledigt in Version 3.3 (Abschlussprüfung 29.10.)
- [x] Automatische Prüfung aller 154 Übungen: IDs in allen Listen vorhanden, Geräte zugeordnet, Animationen ohne Rechenfehler, keine doppelten Namen.
- [x] Mini-Training: Oberkörper-Tage bekamen mangels Übungen ohne Gerät nur Beinübungen. Neu: Y-Heben in Bauchlage (Schultern), enge Liegestütz (Trizeps), Bridge mit Fersen weit vorn (Beinrückseite); Seitliches Beinheben zählt jetzt für die Abduktoren.
- [x] Kleine iPhones (320 px): Reiter im Verlauf und Kalenderzeile liefen über den Rand – behoben. Alle Ansichten bei 320 und 390 px, hell und dunkel ohne Überlauf und ohne Fehler.
- [x] Backup laden: neue Geräte werden ergänzt, alte Pausen-Voreinstellung angehoben (wie beim normalen Start).
- [x] Daten aus einer alten Version (vor 2.2) in 3.3 geöffnet: alles übernommen, keine Fehler.
- [x] „1 Sätze“ → „1 Satz“ im Abschluss; „Was ist neu“ auf die aktuellen Punkte gekürzt, Rest im Verlauf.

## Erledigt in Version 3.2
- [x] Fehler: Ausgeblendete Geräte (z. B. Hackenschmidt) tauchten in eigenen Trainingstagen weiter auf („Statt …“, „… ist jetzt frei“). Jetzt dauerhafter Ersatz mit gleichem Bewegungsmuster, Hinweis und „Dauerhaft ersetzen“ im Trainingsplan.
- [x] Geräteliste nach Bereichen gruppiert, „Alle an/aus“, Zahl der Übungen je Gerät.
- [x] Neue Geräte: Pendel-Kniebeuge, Rückenstrecker-Maschine, Rotations-Maschine, TRX, Mini-Band, Treppensteiger. Neue Übungen: Pendel-Kniebeuge, Rückenstrecker an der Maschine, Rumpfrotation, TRX-Rudern, TRX-Kniebeuge, TRX-Brustpresse, Seitwärtsgehen mit Mini-Band, Glute Bridge mit Mini-Band, Cardio Treppensteiger.

## Erledigt in Version 3.1
- [x] Töne auf dem iPhone: feste, bei Berührung freigeschaltete Ton-Elemente statt neuer Elemente je Ton. Signalton und Countdown kamen bei Pilates/Mobility nicht (Ansage schon). In Chromium mit „Ton nur nach Berührung“ nachgestellt: vorher 4 Töne blockiert, jetzt 0. Auf dem iPhone bestätigt (28.10.).

## Erledigt in Version 3.0
- [x] Profil aufgeräumt: Übersicht mit Gruppen (Du & deine Figur · Training: Plan, Ziel & Belastung, Satzpause, Ton & Musik, Geräte · App: Darstellung & Kalender, Daten & Backup, Hilfe & Infos), jede Zeile zeigt den aktuellen Stand, Details auf eigenen Seiten.
- [x] Tour, Hinweistexte („Profil → …“), „Erste Schritte“ (springt direkt zu Daten & Backup) und „Was ist neu“ an die neue Struktur angepasst.

## Erledigt in Version 2.9
- [x] Signalton wählbar (Gong, Klangschale, Sanfter Dreiklang, Küchentimer, Wecker, Ringglocke, Kein Ton) und Countdown (Piep, Ticken, aus), mit Anhören beim Antippen.
- [x] Pilates & Mobility: Sprachansagen, Signalton bei Start und Ende jeder Position, Countdown, „Noch 10 Sekunden“.

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
- [x] Tests erweitert (21 Prüfungen, mit 2.3: 28, mit 2.4: 33, mit 2.5: 36, mit 2.6: 41, mit 2.7: 45, mit 2.8: 47, mit 2.9: 49, mit 3.3: 56, mit 3.4: 58, mit 3.5: 59).

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
