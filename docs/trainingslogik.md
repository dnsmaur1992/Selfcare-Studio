# Selfcare Studio – Trainingslogik

Stand: Version 2.9. Diese Datei beschreibt, wie die App rechnet. Sie ist die Grundlage für spätere Änderungen, auch in einem neuen Chat.

## Plan
- **Muskelgruppen** haben eine Größe (Po 6, Beine vorne 5, Rücken 5 …). Daraus entsteht das Volumen eines Tages in „effektiven Sätzen“, höchstens 22 pro Einheit.
- Pro Muskelgruppe 1–2 Übungen. Bei zwei Übungen wird ein anderes **Bewegungsmuster** bevorzugt (z. B. Hip Thrust + Kickback statt zweimal Hip Thrust).
- Jede Übung hat eine **Wirkung pro Muskel** `m` (1 = ideal). Sätze = Volumen ÷ Wirkung, gerundet, 2–5 Sätze (eigene Pläne 1–6).
- **Wiederholungen** nach Ziel: Aufbau 8–12/10–15, Aufbau+ 10–15/12–20 (Standard), Kraftausdauer 15–20/15–25 (Grund-/Isolationsübung).
  - „Rücken schonen“: Übungen mit Rückenlast (`back: mid`) +2 Wdh. und leicht abgewertet.
  - Körpergewicht/Band: +3/+5 Wdh., aber **höchstens 20**. Darüber gibt es stattdessen langsames Tempo (3 Sek. runter).
  - Option „Schwerere Sätze“: die erste rückenfreundliche Grundübung mit 6–10 Wdh.

## Ausweichen (gleicher Reiz)
- Reihenfolge der Alternativen: zuerst **gleiches Bewegungsmuster** (wenn höchstens 0,3 schwächer), dann nach Wirkung auf den Muskel. Hantel vor Körpergewicht.
- Volumen wird immer vom **ursprünglich geplanten** Ersatz-Ziel aus gerechnet, nie von Ersatz zu Ersatz.
- **Restvolumen:** Wurden schon Sätze gemacht, zählen sie mit: Rest = Ziel − geschaffte Sätze × Wirkung der alten Übung. Ist der Rest < 0,45, gilt die Übung als geschafft.
- „Besetzt“ gilt 10 Minuten, danach wird das Gerät wieder vorgeschlagen.
- „Später nochmal fragen“ schiebt die Übung hinter die letzte offene Kraftübung.
- „Gibt's hier nicht“ blendet das Hauptgerät dauerhaft aus (Profil → Geräte).
- Einschränkungen (Knie, Schulter, Handgelenk) schließen belastende Übungen aus (Liste `LIMITS`).

## Gewichte
- Bekannte Übung: Gewicht **und Wiederholungen** vom letzten Mal, Satz für Satz (`makeLog`).
- Neue Übung: Schätzung aus der letzten Übung mit gleichem Muster. 1RM nach Epley `w × (1 + r/30)`, umgerechnet mit groben Gerätefaktoren (Maschine 1, Smith 0,9, Kabel 0,62, Kurzhantel/Kettlebell 0,42, einseitig × 0,55). Arbeitsgewicht = 1RM ÷ (1 + (Ziel-Wdh. + 2)/30), also 2 Wdh. im Tank. Angezeigt als „ca.“ mit Testsatz.
- **Nachsteuern** nach jedem Satz: 2+ Wdh. über dem Bereich → schwerer, unter dem Bereich → leichter (über Epley, mindestens eine Gewichtsstufe). Stufen: Kurzhantel 1 kg (ab 10 kg 2 kg), Kettlebell 4 kg, sonst 2,5 kg.

## Ablauf im Training
Ein Bildschirm, ein Schritt: Cardio (Gerät wählen) → Aktivierung mit Timer → Kraftübungen (Gerät frei? → Sätze → Pause) → Cool-down → Abschluss.
- **Aufwärmen 10–15 Min** (Mini 8–10): Cardio 6 Min (Kurz 5, Mini 4,5), 4–5 Aktivierungsübungen à 40 s passend zu den Muskelgruppen.
- **Aufwärmsätze auf Nachfrage:** Bei jeder großen Übung mit Gewicht (Grundübung, nicht Mini-Training) fragt die App vor dem ersten Arbeitssatz „Möchtest du einen Aufwärmsatz machen?“ und nach jedem Aufwärmsatz „Noch ein Aufwärmsatz?“. Vorschlag (`warmSuggest`): der n-te Aufwärmsatz vom letzten Training dieser Übung; gibt es ihn nicht, wird der vorige Aufwärmsatz dieser Einheit übernommen, sonst 50 % des Arbeitsgewichts × 10. Pause nach Aufwärmsätzen 45 s. Nach einem Tausch wird erneut gefragt, solange noch kein Arbeitssatz gemacht ist. **Rückwege:** Im Aufwärmsatz „Doch kein Aufwärmsatz – direkt loslegen“ (Satz wird entfernt, keine weitere Frage). Beim ersten Arbeitssatz jeder Übung mit Gewicht (auch Isolation, nicht Mini) „Stattdessen erst einen Aufwärmsatz“ – danach fragt die App wie gewohnt „Noch ein Aufwärmsatz?“.
- **Speichern:** Aufwärmsätze werden mit der Einheit gespeichert (`warm: true`). Sie zählen **nicht** für Sätze, Wochenvolumen, Rekorde, Fortschritt und Gewichtsvorschläge, aber **für die Gesamtlast** (kg × Wdh. aller Sätze). Verlauf und Abschluss zeigen „davon … kg Aufwärmen“.
- **Cool-down ca. 5 Min:** eine Dehnung pro trainierter Muskelgruppe, 35 s je Seite.
- Zeitübungen: 10 s „Bereit machen“, Gong, Ansage, weiter von selbst.
- **Status jedes Schritts** (`stepStatus`): erledigt (alle Arbeitssätze bzw. Zeit abgelaufen), teilweise (z. B. 1/3), übersprungen, offen. Abgehakt wird nur, was wirklich geschafft ist.
- **Springen über die Übersicht:** Alles zwischen der aktuellen Position und dem Ziel, das noch offen ist, wird als „übersprungen“ markiert. Springt man zu einem übersprungenen Schritt zurück, ist er wieder offen. „Weiter“ überspringt erledigte und übersprungene Schritte.
- **Entfernen:** × in der Übersicht nimmt eine offene oder übersprungene Übung aus der Einheit (mit geschafften Sätzen wird sie nur abgeschlossen).
- **Ende:** Sind noch Übungen offen, teilweise oder übersprungen, zeigt die App sie zum Nachholen, statt sofort zu speichern. Gespeichert werden nur geschaffte Sätze.
- **Satzpause** (`S.restC` große Übungen, `S.restI` kleine Übungen): Voreinstellung je **3:00 Min**, wählbar 1:00–4:00. Einstellbar bei der Einrichtung, im Profil, in „Training vorbereiten“, im Satz („Danach … Pause · ändern“) und während der Pause (läuft mit der neuen Länge weiter). Bestehende Nutzerinnen mit den alten Voreinstellungen (90/60 s) werden einmalig auf 3:00 gesetzt (`restMig`). Schwere Sätze mind. 2:00, Fokus „Körperfett verlieren“ × 0,75, Mini-Training und Aufwärmsätze 45 s.
- **Satz übernimmt Satz:** Nach einem Arbeitssatz stehen dessen Gewicht und Wiederholungen in allen folgenden offenen Arbeitssätzen. Ausnahme: Die Nachsteuerung ändert das Gewicht (2+ Wdh. über bzw. unter dem Bereich) – dann neues Gewicht und Ziel-Wiederholungen.
- Ton: Gong und Ansage über laufende Musik (`audioSession.type = "transient"` ab iOS 17).

## Pilates & Mobility (`buildFlow`, `flowGoto`, `flowTick`)
- Pilates: 10 Positionen in 2 Runden, Mobility: 11 Positionen in 1 Runde, Positionen mit Seiten je links/rechts. Zeit pro Position so, dass es ca. 30 Min sind (40–90 s), 10 s Bereitmachen.
- Ton und Ansage wie im Krafttraining: „Gleich: …“ bzw. „Seitenwechsel: …“ beim Bereitmachen, Signalton bei Start und Ende jeder Position, Countdown in den letzten 3 Sekunden, „Noch 10 Sekunden“ ab 30 s Haltezeit.

## Gerätefrage und Gerätezeiten
- Keine „Frei?“-Frage bei Übungen nur mit Matte, Band oder Gymnastikball (`noAsk`). Ist so eine Übung Ersatz, wird nur angeboten: „Original ist jetzt frei“.
- Jede Antwort „Frei“/„Besetzt“/„Später“ wird mit Gerät, Wochentag und Stunde gespeichert (`eqLog`, max. 400). Gilt ein Gerät zur gleichen Zeit (±1 Std., gleicher Wochentag, mind. 3 Antworten) zu ≥ 60 % als besetzt, rückt die Übung beim Start ans Ende.

## Mini-Aufwärmen
Kein Cardio, keine Aufwärmsätze. 5 Mobilisations- und Dehnübungen nach Tagesart (`DAYMOB`), Zeit pro Übung so, dass es ca. 5 Min sind.

## Belastung
- Nach jeder Einheit Anstrengung: Locker 3, Gut machbar 5, Fordernd 7, Sehr hart 9, Zu viel 10.
- **Entlastungswoche** (−40 % Sätze, gleiche Gewichte): nach 7 Trainingswochen oder wenn der Schnitt der letzten 3–4 Einheiten ≥ 8,5 ist. Lässt sich pro Woche abschalten.
- **Wiedereinstieg** nach ≥ 14 Tagen ohne Kraft: −25 % Sätze.
- **Wochen-Check-in:** stressig −20 %, entspannt +10 %.
- **Tagesform** (Schlaf + Energie, je 0–2): Summe ≤ 1 → −30 %, = 2 → −15 %.
- Alle Faktoren multipliziert, begrenzt auf 50–110 %.
- **Wochenvolumen:** effektive Sätze pro Muskelgruppe (Satz × Wirkung ab 0,3), Zielbereiche in `TARGET` (z. B. Po 10–16).

## Pausen, verpasste Einheiten, Fokus
- **Pause** (krank / verletzt / Urlaub): Der Plan ruht, verpasste Einheiten werden nicht angemahnt. Wochen, die ganz oder teilweise in einer Pause liegen, unterbrechen die Wochenserie nicht.
- **Nach der Pause** sanfter Wiedereinstieg über einige Tage (`S.ramp`, Faktor 0,75), unabhängig von der 14-Tage-Regel.
- **Verpasste Einheiten** der laufenden Woche: „Nachholen“ (heute) oder „Auslassen“ mit Rückgängig. Ausgelassene Einheiten zählen nicht als offen.
- **48-Stunden-Warnung:** Wird eine Krafteinheit neben eine andere gelegt, die eine große Muskelgruppe (Zielbereich ab 6 Sätzen) teilt, fragt die App „Trotzdem?“.
- **Fokus-Block** (6 Wochen): Po aufbauen, Rücken stärken, Stärker werden oder Körperfett verlieren. Fokus-Muskeln × 1,3, übrige × 0,9; „Stärker werden“ schaltet die schwereren Sätze ein. Am Ende Vergleich der besten Gewichte vorher/nachher.
- **Körperfett verlieren:** Volumen unverändert (Muskeln halten), Pausen × 0,75 (mind. 45 s), nach den Kraftübungen 12 Min zügiges Cardio (Gerät nach Wahl, in „Training vorbereiten“ abschaltbar, im Training „Ausdauer heute auslassen“). Keine Ernährungs- oder Kalorienangaben. Vergleich am Ende über die Körpermaße (Stand beim Start → letzter Stand).
- **6-Wochen-Check:** ab 8 Krafteinheiten und 42 Tagen seit dem letzten Check: Gewichtsentwicklung pro Übung und Körpermaße.

## Ton
- Gong als in der App erzeugte WAV-Datei über `<audio>` (zuverlässiger als Web Audio auf dem iPhone), freigeschaltet beim ersten Antippen.
- Letzte 3 Sekunden von Bereit-machen und Pause: kurze Pieptöne, dann Gong, Ansage ca. 1 Sekunde später.
- **Signalton wählbar** (`S.sound`, `SOUNDS`): Gong (Standard), Klangschale, Sanfter Dreiklang, Küchentimer, Wecker, Ringglocke oder Kein Ton. Alle werden in der App aus Teiltönen als WAV erzeugt, nichts wird geladen. **Countdown** (`S.tick`): Piep (Standard), leises Ticken oder aus. Einstellbar unter Profil → Sprachansage → „Töne wählen & testen“.
- Ein unhörbarer Dauerton gegen das Einschlafen der Audioausgabe wird bewusst **nicht** genutzt: Er würde laufende Musik dauerhaft leiser stellen.

## Erfolge
- Wochenserie: Wochen mit mindestens 2 Einheiten am Stück (die laufende Woche zählt, sobald sie 2 hat).
- Rekord: höheres Arbeitsgewicht als je zuvor bei dieser Übung.
- 15 Abzeichen (`BADGES`), einmal vergeben mit Datum.
- **Abschluss-Bildschirm:** Häkchen, hochzählende Zahlen, Wochenring „x von y“ (alle nicht ausgelassenen Einheiten der Woche), goldene Karte bei kompletter Woche mit Serie, Gesamtbilanz (Einheiten, Stunden). Bei „Bewegung reduzieren“ ohne Animation.

## Figur
- Outfit (5 Vorlagen oder eigene Farben) und Frisur (`HAIRS`: Zopf, Dutt, Kurz, Lang offen, Cap, Ohne) mit Haarfarbe (`--hair`, Standard = Figurfarbe). Die Frisur wird in Kopf-Koordinaten gezeichnet und mit dem Oberkörper gedreht; nur der Zopf schwingt eigenständig.

## Hilfe in der App
- **App-Tour** (`TOUR`, 8 Stationen) mit Spotlight; einmal nach der Einrichtung bzw. nach „Was ist neu“ angeboten, sonst Profil → App-Tour.
- **Zum Lesen** (`READS`): 6 Themen, Abschnitte mit höchstens 3 Sätzen, jede Seite mit Quellen. Erreichbar über das Profil und in Pausen über 40 Sekunden.
- **Was ist neu** (`NEWS`) mit aufklappbaren früheren Versionen (`NEWS.old`).

## Körperdaten (freiwillig)
- **Geburtsjahr und Größe** im Profil (`S.body`), **Gewicht** als Messwert mit Verlauf bei den Maßen (`gewicht` in `S.measures`; Eingabe im Profil schreibt den heutigen Eintrag).
- **Maximalpuls** nach Tanaka: 208 − 0,7 × Alter. Pulsbereiche: Aufwärm-Cardio 50–65 %, Ausdauer im Fokus „Körperfett verlieren“ 65–75 %. Angezeigt nur, wenn ein Geburtsjahr eingetragen ist.
- **BMI** = Gewicht ÷ Größe² (Hinweis: unterscheidet nicht zwischen Muskeln und Fett). **Taille zu Größe** = Taille ÷ Größe, unter 0,5 gilt als günstig.
- **Kraft im Verhältnis:** Im Fortschritt bei Grundübungen bestes Gewicht ÷ Körpergewicht zum jeweiligen Datum.
- Gewicht und Größe beeinflussen **nicht** Sätze, Wiederholungen oder Startgewichte: Die App rechnet mit dem, was tatsächlich geschafft wird.

## Daten
Alles in `localStorage` unter `satzwerk.v1`. Backup als JSON-Datei über das Profil.
