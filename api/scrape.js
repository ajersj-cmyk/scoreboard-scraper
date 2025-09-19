function fetchDGPTSchedule() {
    const container = document.getElementById('dgpt-schedule');
    if (!container) {
        console.error('Container not found for dgpt-schedule');
        return;
    }
    container.innerHTML = '<p class="no-games">Loading DGPT World Rankings...</p>';

    // IMPORTANT: Replace this URL with the live URL Vercel gives you for your scraper.
    const scraperUrl = 'https://your-project-name.vercel.app/api/scrape'; 

    fetch(scraperUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const { mpo, fpo } = data;

            if (!mpo || !fpo || mpo.length === 0 || fpo.length === 0) {
                throw new Error('Scraped data is empty or invalid.');
            }

            container.innerHTML = `
                <div class="standings-container">
                    <div class="standings-division">
                        <h3>MPO World Rankings</h3>
                        <table class="standings-table">
                            <thead><tr><th>Rank</th><th>Name</th><th>Points</th></tr></thead>
                            <tbody>
                                ${mpo.map(player => `
                                    <tr>
                                        <td>${player.rank}</td>
                                        <td>${player.name}</td>
                                        <td>${player.points}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    <div class="standings-division">
                        <h3>FPO World Rankings</h3>
                        <table class="standings-table">
                            <thead><tr><th>Rank</th><th>Name</th><th>Points</th></tr></thead>
                            <tbody>
                                ${fpo.map(player => `
                                    <tr>
                                        <td>${player.rank}</td>
                                        <td>${player.name}</td>
                                        <td>${player.points}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        })
        .catch(error => {
            console.error('Error fetching DGPT rankings:', error);
            container.innerHTML = '<p class="no-games">Could not load DGPT rankings.</p>';
        });
}

