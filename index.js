const { Builder } = require('selenium-webdriver')
const chrome = require('selenium-webdriver/chrome')
const fs = require('fs')

let result = []

;(async () => {
    const alphabet = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','p','q','r','s','t','u','v','w','x','y','z']
	// timeout ensures that everything loads properly
	const TIMEOUT = 30000000
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
		const cards = await driver.findElements({className: 'col-6 col-md-3 col-lg-3 mobile-rendering-contents-padding'})
		for (let i = 0; i < cards.length; i++) {
			// relocate the cards
			const cards = await driver.findElements({className: 'col-6 col-md-3 col-lg-3 mobile-rendering-contents-padding'})
			let titleElement = await cards[i].findElement({className: 'text-center default-text paddingtop-5'})
			let title = await titleElement.getText()
			await cards[i].click()
			// Re-locate the element before interacting with it
			let descriptionElement = await driver.findElement({xpath: '/html/body/main/div[2]/div[2]/div/div[1]/div/div[2]/div[4]/div[2]/p[11]'})
			let description = await descriptionElement.getText()
		  
			let episodesDiv = await driver.findElement({xpath: '/html/body/main/div[2]/div[2]/div/div[1]/div/div[2]/div[3]/div[2]'})
			let episodes = await episodesDiv.findElements({tagName: 'a'})
			let episodeLinks = []
			for (const episode of episodes) {
			  let link = await episode.getAttribute('href')
			  episodeLinks.push(link)
			}
		  
			let animeObject = {
			  title,
			  description,
			  episodes: episodeLinks
			}
		  
			result.push(animeObject)
			console.log(animeObject)
			await driver.executeScript("window.history.go(-1)");
		}
    }

	fs.writeFileSync('anime.json', JSON.stringify(result, null, 2))
})()