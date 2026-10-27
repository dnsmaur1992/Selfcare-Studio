# Selfcare Studio – Trainingslogik

Stand: Version 2.0. Diese Datei beschreibt, wie die App rechnet. Sie ist die Grundlage für spätere Änderungen, auch in einem neuen Chat.

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
- Bekannte Übung: letztes Arbeitsgewicht.
- Neue Übung: Schätzung aus der letzten Übung mit gleichem Muster. 1RM nach Epley `w × (1 + r/30)`, umgerechnet mit groben Gerätefaktoren (Maschine 1, Smith 0,9, Kabel 0,62, Kurzhantel/Kettlebell 0,42, einseitig × 0,55). Arbeitsgewicht = 1RM ÷ (1 + (Ziel-Wdh. + 2)/30), also 2 Wdh. im Tank. Angezeigt als „ca.“ mit Testsatz.
- **Nachsteuern** nach jedem Satz: 2+ Wdh. über dem Bereich → schwerer, unter dem Bereich → leichter (über Epley, mindestens eine Gewichtsstufe). Stufen: Kurzhantel 1 kg (ab 10 kg 2 kg), Kettlebell 4 kg, sonst 2,5 kg.

## Ablauf im Training
Ein Bildschirm, ein Schritt: Cardio (Gerät wählen) → Aktivierung mit Timer → Kraftübungen (Gerät frei? → Sätze → Pause) → Cool-down → Abschluss.
- **Aufwärmen 10–15 Min** (Mini 8–10): Cardio 6 Min (Kurz 5, Mini 4,5), 4–5 Aktivierungsübungen à 40 s passend zu den Muskelgruppen, 2 Aufwärmsätze (50 % × 10, 75 % × 5) vor der ersten großen Übung mit Gewicht.
- **Cool-down ca. 5 Min:** eine Dehnung pro trainierter Muskelgruppe, 35 s je Seite.
- Zeitübungen: 10 s „Bereit machen“, Gong, Ansage, weiter von selbst.
- Pausen: Grundübung 90 s (schwere Sätze 120 s), Isolation 60 s, Mini 45 s, Aufwärmsatz 45 s.
- Ton: Gong und Ansage über laufende Musik (`audioSession.type = "transient"` ab iOS 17).

## Belastung
- Nach jeder Einheit Anstrengung: Locker 3, Gut machbar 5, Fordernd 7, Sehr hart 9, Zu viel 10.
- **Entlastungswoche** (−40 % Sätze, gleiche Gewichte): nach 7 Trainingswochen oder wenn der Schnitt der letzten 3–4 Einheiten ≥ 8,5 ist. Lässt sich pro Woche abschalten.
- **Wiedereinstieg** nach ≥ 14 Tagen ohne Kraft: −25 % Sätze.
- **Wochen-Check-in:** stressig −20 %, entspannt +10 %.
- **Tagesform** (Schlaf + Energie, je 0–2): Summe ≤ 1 → −30 %, = 2 → −15 %.
- Alle Faktoren multipliziert, begrenzt auf 50–110 %.
- **Wochenvolumen:** effektive Sätze pro Muskelgruppe (Satz × Wirkung ab 0,3), Zielbereiche in `TARGET` (z. B. Po 10–16).

## Daten
Alles in `localStorage` unter `satzwerk.v1`. Backup als JSON-Datei über das Profil.
