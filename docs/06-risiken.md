# 06 — Risiken & Lücken im Ausgangskonzept

Du hast explizit darum gebeten, aktiv auf Punkte hingewiesen zu werden, die in
der Projektbeschreibung fehlen oder anders laufen müssen. Hier sind sie,
sortiert nach Wichtigkeit.

## 1. „Öffentliche API" ≠ Bildlizenz — der größte blinde Fleck

Die Annahme „Content über freie APIs beziehen, dann sind Uploads/Lizenzen
gelöst" stimmt für **Metadaten**, aber nicht für **Anime-Bilder**: Jikan ist
nur ein Wrapper um MyAnimeList, und die Bilder dort sind geschützte Artworks
(Toei/Shueisha). Eine öffentliche API erteilt keine Nutzungsrechte — und
gerade die One-Piece-Rechteinhaber gehen aktiv gegen unlizenzierte Nutzung
vor. **Konsequenz:** eigener Avatar-Stil bzw. Text-Fallback (Dok 04, 4.5).
Das ist die teuerste Einzelabweichung vom Wunschkonzept, aber nicht
verhandelbar, wenn „rechtlich sauber" das Ziel ist.

## 2. „Sinngemäß plausibel" funktioniert nicht für lebende Personen

Die zentrale Leitplanke („Zitate müssen nur sinngemäß zugeschrieben oder
stilistisch plausibel sein") ist für Anime-Figuren und lange Verstorbene
tragfähig — für lebende Personen ist ein untergeschobenes Zitat einer der
schwersten Persönlichkeitsrechts-Eingriffe überhaupt, und **kein Disclaimer
repariert das**. Deshalb die harte, technisch erzwungene Regel: lebende
Personen nur mit belegten (ggf. übersetzten) Aussagen, Zwei-Quellen-Regel,
Vier-Augen-Freigabe (Dok 02 V4/V6, Dok 04 4.4). Der spielerische „Stil-Zitat"-
Spielraum bleibt — bei Fiktion und Geschichte, nicht bei Lebenden.

## 3. Auch die Zitat-*Texte* haben Rechteinhaber

Im Konzept fehlte: Anime-Dialogzeilen sind Werkteile, und **offizielle deutsche
Übersetzungen (Synchro, Carlsen-Manga) sind eigene geschützte Werke**. Lösung
ist eingeplant (kurze Sätze, eigene sinngemäße Übersetzung, Kennzeichnung
`translated`/`paraphrased`) — aber es bedeutet: nie Text 1:1 aus der deutschen
Fassung oder aus Fan-Subs kopieren.

## 4. Ton-Risiko: „kontrovers" kippt schnell

„Gern kontrovers" ist als Reiz nachvollziehbar, hat aber zwei Kippkanten:
(a) Paarungen, die wie eine Gleichsetzung wirken („geliebter Anime-Held sagt
Dinge wie Diktator X") können als Verharmlosung oder Herabwürdigung gelesen
werden — ein Reputations- und Community-Risiko, bevor es ein juristisches ist;
(b) falls später App-Stores, Werbenetzwerke oder Schul-/Jugendkontexte relevant
werden, gelten deren strengere Policies. Antwort: Auswahl-Policy + `tone_flags`
+ Redaktionskonferenz für Grenzfälle (Dok 04, 4.4 Nr. 6).

## 5. Replayability: 50 Paare sind nach zwei Sessions „durchgespielt"

Das Konzept unterschätzt, wie schnell ein Ratespiel seinen Pool verbrennt: Wer
ein Paar zweimal sieht, rät nicht mehr — er erinnert sich. Gegenmittel sind
eingeplant: No-Repeat-Fenster, Schwierigkeitskurve, monatliche Content-Batches
und vor allem die **Daily Challenge** (Stufe 2) als Format, das mit wenig
Content täglich Wiederkehr erzeugt. Trotzdem gilt: Der laufende
Redaktionsrhythmus (Dok 03) ist kein „nice to have", sondern die
Lebensversicherung des Spiels.

## 6. Leaderboard = Cheating-Fläche + DSGVO-Fläche

Im Konzept stand „Highscore wird gespeichert" — sobald das global wird, ist
ein rein clientseitiges Spiel trivial manipulierbar (jeder kann Score 9999
POSTen), und Nicknames sind potenziell personenbezogene Daten plus
Moderationsfläche (beleidigende Namen). Lösung: serverseitige Score-Führung,
Rate-Limits, Namensfilter, Löschweg (Dok 01). Im MVP bewusst nur lokal.

## 7. API-Verfügbarkeit ist ein Betriebsrisiko

Jikan ist ein Community-Projekt mit Rate-Limits und Ausfällen; Wikimedia
drosselt Hotlinking. Wer zur Laufzeit lädt, koppelt die Spiel-Verfügbarkeit an
fremde Infrastruktur. Lösung ist eingeplant: alle Assets und Metadaten werden
zur **Build-Zeit** synchronisiert und selbst ausgeliefert (Dok 01).

## 8. Monetarisierung verändert die Rechtslage — jetzt entscheiden, dass sie *später* entschieden wird

Das Konzept erwähnt Monetarisierung nicht. Wichtig zu wissen: Werbung oder
Bezahlmodelle verschärfen mehrere Punkte gleichzeitig (kommerzielle Nutzung
von Bildnissen realer Personen wird deutlich heikler, Marken-/Urheberfragen
werden schärfer bewertet, Impressums-/Steuer­pflichten). Empfehlung: MVP und
Stufe 2 bewusst nicht-kommerziell betreiben; vor einer Monetarisierung
gezielter Rechts-Check (Gate 3 in Dok 05).

## 9. Quellen-Verrottung

Belege, die heute online sind, sind es in zwei Jahren oft nicht mehr — dann
steht ein Klasse-C-Zitat ohne Beleg da. Gegenmittel: Archivlinks (Wayback)
beim Erfassen, `last_checked_at` + 12-Monats-Re-Review (Dok 03).

## 10. Kleinere offene Entscheidungen (vor Woche 1 zu klären)

- **Sprache:** MVP nur Deutsch (empfohlen — Zielgruppe und Rechtstexte sind
  deutsch), Englisch später über die vorbereitete i18n-Struktur.
- **Score-Mechanik:** Hard-Reset (wie Higher-Lower) oder „3 Leben"? Hard-Reset
  ist das bekannte Format; „3 Leben" verzeiht mehr und verlängert Sessions —
  im Prototyp beides testen (Gate 1, Dok 05).
- **Projektname/Domain:** „WhoseQuote" o. ä. — vor Launch kurze Markenrecherche
  (keine Kollision mit bestehenden Quiz-Marken).
- **Barrierefreiheit-Anspruch** (BFSG greift für rein private, nicht-
  kommerzielle Angebote i. d. R. nicht, aber Grundniveau ist eingeplant,
  Dok 01).

## Was im Konzept bereits richtig angelegt ist

Der Vollständigkeit halber — diese Instinkte im Ausgangskonzept sind gut und
wurden übernommen: Kennzeichnung direkt am Zitat (nicht nur im
Kleingedruckten), „Übersetzungen dürfen abweichen" offensiv kommunizieren,
kuratierter statt generierter Content, Start klein mit einem Universum, und
die Erwartung, dass Zitat-Content der eigentliche Engpass ist — genau darauf
ist die ganze Planung zugeschnitten.
