const { Builder } = require('selenium-webdriver')
const chrome = require('selenium-webdriver/chrome')
const fs = require('fs')
let result = []

	; (async () =>
	{
		const alphabet = ['a', 'b', 'c', 'd', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']
		// timeout ensures that everything loads properly
		const TIMEOUT = 5000
		let options = new chrome.Options()
		options.addArguments(`user-data-dir=${__dirname}/browser-data`)
		let driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build()

		await driver.manage().setTimeouts({
			implicit: TIMEOUT,
			pageLoad: TIMEOUT,
			script: TIMEOUT
		})

		for (const letter of alphabet)
		{
			driver.get(`https://www.animelove.tv/lista-anime?alphabet=${letter}`)
			const cards = await driver.findElements({ className: 'col-6 col-md-3 col-lg-3 mobile-rendering-contents-padding' })
			for (let i = 0; i < cards.length; i++)
			{
				// to make the cards visible
				if (i > 5)
					await driver.executeScript('scroll(0, 250);')
				// relocate the cards
				const cards = await driver.findElements({ className: 'col-6 col-md-3 col-lg-3 mobile-rendering-contents-padding' })
				let titleElement = await cards[i].findElement({ className: 'text-center default-text paddingtop-5' })
				let title = await titleElement.getText()
				await cards[i].click()
				// Re-locate the element before interacting with it
				let description
				let cover = await (await driver.findElement({ xpath: '/html/body/main/div[2]/div[2]/div/div[1]/div/div[2]/div[4]/div[2]/div/img' })).getAttribute('src')
				let date = (await (await driver.findElement({ xpath: '/html/body/main/div[2]/div[2]/div/div[1]/div/div[2]/div[4]/div[2]/p[4]' })).getText()).replace('ANNO DI USCITA: ', '')
				let studio = (await (await driver.findElement({ xpath: '/html/body/main/div[2]/div[2]/div/div[1]/div/div[2]/div[4]/div[2]/p[5]' })).getText()).replaceAll('STUDIO: ', '').replaceAll('AUTORE: ', '')
				let tagsText = (await (await driver.findElement({ xpath: '/html/body/main/div[2]/div[2]/div/div[1]/div/div[2]/div[4]/div[2]/p[6]' })).getText()).replace('GENERI: ', '')
				let tags = tagsText.split(',')
				try
				{
					description = await (await driver.findElement({ xpath: '/html/body/main/div[2]/div[2]/div/div[1]/div/div[2]/div[4]/div[2]/p[11]' })).getText()
				} catch (e)
				{
					description = await (await driver.findElement({ xpath: '/html/body/main/div[2]/div[2]/div/div[1]/div/div[2]/div[4]/div[2]/div[2]' })).getText()
				}
				let episodesDiv = await driver.findElement({ xpath: '/html/body/main/div[2]/div[2]/div/div[1]/div/div[2]/div[3]/div[2]' })
				let episodes = await episodesDiv.findElements({ tagName: 'a' })
				let episodeLinks = []
				for (const episode of episodes)
				{
					let link = await episode.getAttribute('href')
					episodeLinks.push(link)
				}

				let animeObject = {
					title,
					date,
					studio,
					tags,
					description,
					cover,
					episodes: episodeLinks
				}

				result.push(animeObject)
				console.log(animeObject)
				let sql = ''
				for (anime of result)
				{
					sql += `INSERT INTO Anime (id, name, studio, date, description, cover)\nVALUES (default, '${anime.title.replaceAll("'", "\\'")}', '${anime.studio.replaceAll("'", "\\'")}', '${anime.date}-0-1', '${anime.description.replaceAll("'", "\\'")}', '${anime.cover}');\n`
					for (link of anime.episodes)
						sql += `INSERT INTO Episode (id, link, anime) VALUES (default, '${link.replaceAll("'", "\\'")}', (SELECT id FROM Anime WHERE name = '${anime.title.replaceAll("'", "\\'")}'));\n`

					for (tag of anime.tags)
					{
						sql += `INSERT INTO Tag (id, name, anime) VALUES (default, '${tag.replaceAll("'", "\\'")}', (SELECT id FROM Anime WHERE name = '${anime.title.replaceAll("'", "\\'")}'));\n`
					}
				}

				fs.writeFileSync('dump11.sql', sql)
				await driver.executeScript("window.history.go(-1)");
			}
		}
	})()