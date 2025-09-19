const axios = require('axios');
const cheerio = require('cheerio');

// This is a Vercel Serverless Function. It must be exported this way to work.
module.exports = async (req, res) => {
    try {
        const url = 'https://www.pdga.com/players/world-rankings';
        // Fetch the HTML from the PDGA website, pretending to be a browser
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        const $ = cheerio.load(data);

        // A helper function to scrape a specific rankings table by its ID
        const scrapeRankings = (tableId) => {
            const players = [];
            // Find the table and loop through each row in its body
            $(`${tableId} tbody tr`).each((i, el) => {
                if (i < 15) { // Stop after the top 15
                    const rank = $(el).find('td:nth-child(1)').text().trim();
                    const name = $(el).find('td:nth-child(3)').text().trim();
                    const points = $(el).find('td:nth-child(7)').text().trim();
                    if (rank && name && points) {
                        players.push({ rank, name, points });
                    }
                }
            });
            return players;
        };

        // Scrape both the MPO and FPO tables
        const mpoData = scrapeRankings('#world-rankings-mpo');
        const fpoData = scrapeRankings('#world-rankings-fpo');

        // Allow your scoreboard (on a different domain) to fetch data from this script
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate'); // Cache the results for 1 day

        // Send the clean data back as JSON
        res.status(200).json({ mpo: mpoData, fpo: fpoData });

    } catch (error) {
        console.error('Scraping failed:', error);
        res.status(500).json({ error: 'Failed to scrape PDGA rankings.' });
    }
};

