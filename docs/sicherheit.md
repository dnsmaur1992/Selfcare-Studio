# Sicherheit & Datenschutz – Selfcare Studio

Stand: Version 4.6.2 (Prüfung vom 27.11.2026)

## Grundprinzip

Selfcare Studio ist eine reine Browser-App ohne Server, Konto oder Analyse-Dienste. Alle Daten liegen im `localStorage` des Geräts (`satzwerk.v1`). Seit 4.6.2 baut die App **keine einzige Verbindung zu Dritten** mehr auf – auch die Schriften liegen im Repo (`fonts/`, SIL Open Font License).

## Geprüft

| Bereich | Ergebnis |
|---|---|
| Einschleusen von Code (XSS) über Backup-Import | Prüflauf mit Schadcode in **jedem** Feld und Schlüssel eines Backups, danach alle Seiten, Blätter und ein komplettes Training: 1 Lücke gefunden und behoben (Schlüssel der Botschaften), danach 0 Treffer |
| Geteilte Trainingstag-Links (`?tag=`) | Inhalt wird vollständig geprüft (`cleanDay`, Muster für IDs), Texte maskiert – 0 Treffer |
| `botschaften.js` | Texte und Absender werden maskiert angezeigt – 0 Treffer |
| Playlist-Link | War nur bei der Eingabe geprüft; ein Backup konnte `javascript:` einschleusen → jetzt nur `https://`, beim Laden und beim Anzeigen geprüft |
| Prototype Pollution | `__proto__`/`constructor` aus Backups und Links wurden übernommen → `safeParse()` verwirft sie |
| Externe Verbindungen | Vorher Google Fonts bei jedem Start (IP-Adresse an Google) → jetzt keine |
| Content-Security-Policy | Neu: nur eigene Skripte, Schriften, Bilder; keine Verbindungen nach außen (`connect-src 'self'`), keine Plugins, kein `<base>` – blockiert auch das Abfließen von Daten über eingeschleuste Bilder oder Anfragen |
| Service Worker | Speichert nur eigene Dateien; räumt nur eigene Caches auf (Ringzeit-Caches bleiben unberührt) |
| Links nach außen | `target="_blank"` immer mit `rel="noopener"`; Erklärvideos (4.7) sind reine Links zur YouTube-Suche, nichts wird eingebettet |
| Kalender-Export | Texte werden für das iCalendar-Format maskiert |
| Geheimnisse im Repo | Keine Schlüssel, Passwörter oder E-Mail-Adressen gefunden |
| Abhängigkeiten | Keine fremden Bibliotheken in der App (jsdom nur für Tests) |

## Bleibende Hinweise (nicht per Code lösbar)

1. **Gemeinsame Adresse mit anderen Apps.** Alle GitHub-Pages-Projekte unter `dnsmaur1992.github.io` (z. B. Ringzeit) teilen sich denselben Ursprung. Jede dieser Seiten könnte technisch die Selfcare-Daten im Speicher lesen oder löschen. Solange alle Projekte von dir stammen, ist das Risiko gering. Sauber getrennt wäre es mit einer eigenen Adresse (eigene Domain/Subdomain für das Repo oder ein eigenes GitHub-Konto/eine Organisation). Daten zieht man dann per Backup um.
2. **Wer ins Repo schreiben kann, steuert die App.** Konto mit Zwei-Faktor-Anmeldung schützen; das gilt auch für `botschaften.js`.
3. **Das Repo ist öffentlich.** Code und Botschaften sind für alle lesbar (keine persönlichen Daten darin).
4. **Backups sind unverschlüsselt.** Sie enthalten Körperdaten und Trainingsverlauf – nur an sicheren Orten ablegen.
5. **Einbetten in fremde Seiten** lässt sich auf GitHub Pages nicht per Header verbieten; die App hat aber keine Ein-Tipp-Aktionen, die dabei schaden könnten.
