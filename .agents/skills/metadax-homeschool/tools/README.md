# tools/

The canonical source of truth for `package-check.js` and `check-lists.json` is the player copy served at **https://daxfoundation.org/metadax/play/package-check.js** (repository path `views/daxfoundation/public/metadax/play/` in the Skippy repo). The copies here must be kept byte-identical to that file. To re-sync: download the live file, verify its SHA-1 matches the blob recorded in the last sync commit, then overwrite this copy, update `check-lists.json` the same way, and open a pull request on this repository.
