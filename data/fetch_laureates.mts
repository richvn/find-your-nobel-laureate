import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Laureate {
    id: string;
    fullName: string;
    category: string;
    year: number;
    birthCity: string | null;
    affiliationCities: string[];
    motivation: string;
}

const SCIENCE_CATEGORIES = ['phy', 'che', 'med']; // Physics, Chemistry, Physiology or Medicine

// Simple normalization for city matching
const cityMap: { [key: string]: string } = {
    'new york city': 'new york',
    'nyc': 'new york',
    'st. louis': 'saint louis',
    // Add more as needed, but for now we'll prioritize exact match + NYC
};

function normalizeCity(city: string | undefined): string | null {
    if (!city) return null;
    const lower = city.toLowerCase().trim();
    return cityMap[lower] || lower;
}

async function fetchLaureates() {
    console.log('Fetching laureates from Nobel API...');
    let allLaureates: Laureate[] = [];
    let offset = 0;
    const limit = 100;

    try {
        while (true) {
            const url = `https://api.nobelprize.org/2.1/laureates?offset=${offset}&limit=${limit}`;
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'application/json',
                    'Accept-Language': 'en-US,en;q=0.9',
                }
            });
            const data = response.data;

            if (!data.laureates || data.laureates.length === 0) break;

            for (const l of data.laureates) {
                // Check if they have at least one science prize
                if (!l.nobelPrizes) continue;

                for (const prize of l.nobelPrizes) {
                    if (SCIENCE_CATEGORIES.includes(prize.category.en.toLowerCase().substring(0, 3))) {
                        const affiliations = prize.affiliations?.map((a: any) => normalizeCity(a.city?.en)).filter((c: string | null) => c !== null) || [];
                        
                        allLaureates.push({
                            id: l.id,
                            fullName: l.knownName?.en || l.givenName?.en + ' ' + l.familyName?.en,
                            category: prize.category.en,
                            year: prize.awardYear,
                            birthCity: normalizeCity(l.birth?.place?.city?.en),
                            affiliationCities: affiliations as string[],
                            motivation: prize.motivation?.en || ''
                        });
                    }
                }
            }

            offset += limit;
            console.log(`Fetched ${offset} records...`);
            if (offset >= data.meta.count) break;
        }

        const outputPath = path.join(__dirname, 'laureates.json');
        fs.writeFileSync(outputPath, JSON.stringify(allLaureates, null, 2));
        console.log(`Successfully saved ${allLaureates.length} science laureates to ${outputPath}`);

    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

fetchLaureates();
