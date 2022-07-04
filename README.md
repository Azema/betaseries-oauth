# betaseries-oauth
Site Web: https://azema.github.io/betaseries-oauth/

Repository servant pour l'authentification OAuth avec l'API de BetaSeries, ainsi que pour servir les ressources statiques pour le fonctionnement du [userscript](https://github.com/Azema/betaseries) du site Web de betaseries.

## Les SRI des ressources statiques minifiées

### CSS
* popover.min.css:  `sha384-yebLb3hn+3mwaxg0KwLhE2YYLEKsMRsxRvUPyBOF6gzkzLEOWEeD9ELZeDACSwO7`
* style.min.css:    `sha384-n3+hUwlGfuVvn6TI4Q7/qghbBjAajKmRn99x8jjHHUyYDNw463QGJWDanp6S9WlN`
* table.min.css:    `sha384-tRMvWzqbXtOp2OM+OPoYpWVxHw8eXcFKgzi4q9m6i0rvWTU33pdb8Bx33wBWjlo9`
* comments.min.css: `sha384-37/ghsJZTBvNPxUAy6GMPGxa3BKjrZ2ykMb7gUpkkVvoZwAsm4WhigKhMyYCN+Ft`

### JS
* renderjson.min.js: `sha384-/mHGJ/3gaDqVJCEeed/Uh1fJVO01E+CLBZrFqjv1REaFAZxEBvGMHQyBmwln/uhx`
* jquery.textcomplete.min.js: `sha384-kf6mqav/ZhBkPgNGorOiE7+/0GmfN9NDz0ov5G3fy6PuV/wqAggrTaWkTVfPM79L`
* app-bundle.js: `sha384-lKue41uy6RuzUjoj54RPBp6M0YV8Yxoz+6Vg+R2glRxjZOZhlDd1ezlPw2Z4iEEK`
* lazyload.min.js: `sha384-ZjtdUVt9uqIO0cVuZ4zQ5r/1QqXlGIct+PFRAMtAlSz3F4apy925Pn5Tm3hnczMg`

## Dossier Ext

Le dossier `Ext` contient les scripts pour d'autres sites en rapport avec [BetaSeries](https://www.betaseries.com/).
* `client_bs.js`: Est un script utilisé pour le site [Viki](https://www.viki.com/).

## Dossier userscripts

Le dossier `userscripts`, comme son nom l'indique, contient des userscripts, en rapport avec [BetaSeries](https://www.betaseries.com/).
* `viki.userscript.js`: Est un userscript, pour le site Viki, pour synchroniser les séries et épisodes vus, via l'API [BetaSeries](https://www.betaseries.com/api/).
Pour l'utiliser, vous devez enregistrer le fichier de config `config/ext/client_bs.json` avec votre clé d'API BetaSeries. Il vous faut aussi configurer le chemin d'accès au serveur contenant les fichiers `ext/client_bs.js` et le fichier de config, dans le userscript, sous le nom de variable `serverBaseUrl`.
