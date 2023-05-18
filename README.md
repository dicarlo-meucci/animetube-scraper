# AnimeTube Scraper

This script was made to scrape an anime website in order to populate the [AnimeTube DB](https://github.com/dicarlo-meucci/animetube-server)

## Setup

```bash
git clone https://github.com/dicarlo-meucci/animetube-scraper.git
cd animetube-scraper
npm install
node .
```

The output will be saved to the `dump.sql` file which contains the scraped content formatted as SQL statements.

The statements need to be executed on the MariaDB database engine
