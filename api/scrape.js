const axios = require('axios');
const cheerio = require('cheerio');

// This is a Vercel Serverless Function.
module.exports = async (req, res) => {
    try {
        const mpoUrl = 'https://statmando.com/rankings/dgpt/mpo';
        const fpoUrl = 'https://statmando.com/rankings/dgpt/fpo';

        // Fetch both the MPO and FPO pages at the same time
        const [mpoResponse, fpoResponse] = await Promise.all([
            axios.get(mpoUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
            }),
            axios.get(fpoUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
            })
        ]);

        // Helper function to parse the HTML from a Statmando rankings page
        const parseStatmandoRankings = (html) => {
            const players = [];
            const $ = cheerio.load(html);
            
            // Find the main table body and iterate through each row
            $('table.w-full tbody tr').each((i, el) => {
                if (i < 15) { // Stop after the top 15
                    const rank = $(el).find('td').eq(0).text().trim().replace('.', ''); // Column 1: Rank
                    const name = $(el).find('td').eq(2).find('a').text().trim();   // Column 3 is Player
                    const points = $(el).find('td').eq(3).text().trim(); // CORRECTED: Column 4 is Points
                    
                    if (rank && name && points) {
                        players.push({ rank, name, points });
                    }
                }
            });
            return players;
        };

        // Scrape both the MPO and FPO data
        const mpoData = parseStatmandoRankings(mpoResponse.data);
        const fpoData = parseStatmandoRankings(fpoResponse.data);

        // If we didn't find any players, something is wrong with the Statmando page structure.
        if (mpoData.length === 0 || fpoData.length === 0) {
            throw new Error('Failed to find player data in the scraped HTML. The Statmando page structure may have changed again.');
        }

        // Allow your scoreboard to fetch this data
        res.setHeader('Access-Control-Allow-Origin', '*');
        // CORRECTED: Cache the results for 24 hours (86400 seconds)
        res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate'); 

        // Send the clean data back as JSON
        res.status(200).json({ mpo: mpoData, fpo: fpoData });

    } catch (error) {
        console.error('Scraping failed:', error);
        res.status(500).json({ error: 'Failed to scrape DGPT rankings.', message: error.message });
    }
};

