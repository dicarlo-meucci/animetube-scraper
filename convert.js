const fs = require('fs')
if (!fs.existsSync('anime.json'))
{
    console.log('You first need to run the scrape script')
    return
}

let animeObj = JSON.parse(fs.readFileSync('anime.json'))
let sql = ''

for (anime of animeObj)
{
    sql += `INSERT INTO Anime (id, nome, studio, data, descrizione, copertina)\nVALUES (default, '${anime.title.replaceAll("'", "\\'")}', '${anime.studio}', '2023-04-26', '${anime.description.replaceAll("'", "\\'")}', '${anime.cover}');\n`
    for (link of anime.episodes)
    sql += `INSERT INTO Episodio (id, link, AnimeID) VALUES (default, '${link.replaceAll("'", "\\'")}', (SELECT id FROM Anime WHERE nome = '${anime.title.replaceAll("'", "\\'")}'));\n`
}

fs.writeFileSync('dump.sql', sql)