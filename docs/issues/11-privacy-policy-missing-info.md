# Info mancanti — Privacy policy

La issue #11b e implementabile con le informazioni gia presenti nel repo, ma
prima della pubblicazione definitiva conviene confermare questi dati esterni.

## Da confermare

- [ ] Contatto privacy ufficiale: email o altro canale stabile da usare al
      posto, o in aggiunta, al profilo GitHub `SpatariuRares`.
- [ ] Identita del titolare del progetto da mostrare nella policy, se deve
      essere piu specifica del maintainer GitHub.
- [ ] Eventuale testo legale preferito per Buttondown, se il provider o il
      titolare richiedono una dicitura diversa da quella minimale gia presente.

## Stato attuale

- La pagina `/privacy` esiste.
- Il footer del planner linka `/privacy`.
- Il testo di consenso newsletter riusabile linka `/privacy`.
- La policy nomina email, finalita, consenso esplicito, Buttondown,
  disiscrizione e richieste privacy.

Queste informazioni non bloccano il completamento tecnico della issue #11b, ma
sono utili prima del deploy pubblico.

## Regola operativa per le prossime issue

Quando durante l'implementazione di una issue emerge un'informazione mancante,
un passaggio esterno o una decisione che non puo essere completata direttamente
nel codice, bisogna fare lo stesso lavoro:

- creare un documento dedicato in `docs/issues/`;
- elencare chiaramente cosa manca e chi deve confermarlo;
- distinguere se l'informazione blocca la issue o se e solo utile prima della
  pubblicazione;
- aggiungere il riferimento al documento dentro `docs/issues.json`, nella issue
  interessata.
