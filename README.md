# Trénink dvojice (CZ) – GitHub Pages PWA

Jednoduchá webová appka v češtině pro dva uživatele (váš pár), funguje **offline**, počítá **kalorie** (MET), umožňuje **odškrtávání** tréninku, **export/import** dat. Běží čistě na **GitHub Pages** – není potřeba server.

## Nasazení
1. Vytvoř si repo `fit-app`.
2. Nahraj všechny soubory do kořene (viz tento ZIP).
3. Zapni **Settings → Pages → Deploy from branch** (větev `main`, `/root`).
4. Otevři `https://<tvoje-uzivatelske-jmeno>.github.io/fit-app/`.
5. V prohlížeči klikni „Přidat na plochu“ – appka se bude chovat jako nativní.

## Funkce
- Dva **profily** s výškou/váhou (default: 165/116 a 186/146).
- **Knihovna cviků**, tři **šablony tréninku** (A/B/C).
- **Trénink – živý režim** (odškrtávání A i B).
- **Odhad kalorií** (MET): síla ~4.2 MET, rotoped 5.0–8.8, mobilita 2.3.
- **Export/Import** JSON (záloha, přenos mezi zařízeními).
- **PWA**: offline, manifest, service worker.

## Poznámky
- Data se ukládají **lokálně** v prohlížeči. Sdílení mezi zařízeními řeší **Export/Import** (nebo později Firebase).
- Výpočet kalorií je **orientační** – zpřesní se zadanou **dobou**/tepem/výkonem na rotopedu.
