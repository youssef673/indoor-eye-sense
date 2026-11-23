# INDOOR EYE SENSE

Sito pubblico del progetto INDOOR EYE SENSE: concept di tecnologia assistiva indossabile, scheda prodotto SENSE P1 e demo interattiva della companion web app.

## Pubblicazione

Il sito è statico e non richiede un processo di build.

GitHub Pages è configurato tramite GitHub Actions. In **Settings → Pages**, la sorgente di pubblicazione deve essere **GitHub Actions**. Il workflow `.github/workflows/pages.yml` pubblica automaticamente il contenuto del branch `main`.

URL: https://youssef673.github.io/indoor-eye-sense/

## Pagine

- `index.html` — home, visione INDOOR EYE, introduzione prodotto, tecnologia, piattaforma, roadmap e FAQ.
- `product.html` — scheda SENSE P1, architettura candidata e disponibilità.
- `app/index.html` — demo interattiva della companion web app.
- `privacy.html` — impostazione di privacy e sicurezza del progetto.
- `404.html` — pagina non trovata.
- `assets/css/site.css` — stile pubblico responsive.
- `assets/js/main.js` — navigazione pubblica.
- `app/app.css`, `app/app.js` — interfaccia e interazioni della demo.
- `assets/favicon.svg` — icona del progetto.

## Stato reale del progetto

SENSE P1 è in fase di progettazione. I componenti citati sono candidati tecnici, non componenti dichiarati come già integrati o verificati. Non sono pubblicati dati non misurati su precisione, portata, autonomia, peso o prezzo.

Il prototipo non è attualmente in vendita: non sono attivi ordini, pagamenti, preordini o spedizioni. La pagina prodotto comunica esplicitamente questo stato. Il flusso commerciale potrà essere attivato quando saranno definiti un prototipo funzionante, la validazione, il prezzo, il supporto e le condizioni di vendita.

La companion web app è una demo front-end. Include una scena 3D sintetica ruotabile e un assistente conversazionale locale basato su risposte preimpostate: non è collegato a un vero modello AI. Non si collega a hardware, non riceve misurazioni reali, non usa fotocamera o microfono e non salva le preferenze della sessione.

## Accessibilità e tecnologia

- HTML semantico, responsive layout, navigazione da tastiera e focus visibile.
- Supporto a `prefers-reduced-motion`.
- Accessibilità impostata come obiettivo di progetto con riferimento a WCAG 2.2; non è stata dichiarata né certificata una conformità completa.
- Nessuna libreria JavaScript o font esterno obbligatorio.
- Grafica originale realizzata in HTML/CSS/SVG.
- Nessun servizio di analisi o form di raccolta dati integrato nella demo.

## Verifiche prima della pubblicazione commerciale

Prima di presentare il prototipo come prodotto acquistabile, completare test hardware, misure documentate, valutazioni di sicurezza, prove di usabilità accessibili, revisione privacy, definizione delle condizioni di vendita e attivazione di un canale di supporto reale.

Le pagine descrivono le intenzioni di progetto e non costituiscono una dichiarazione di conformità tecnica, legale o normativa.
