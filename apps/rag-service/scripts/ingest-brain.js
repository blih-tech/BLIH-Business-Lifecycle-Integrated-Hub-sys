const fs = require('fs');
const path = require('path');
const axios = require('axios');


async function ingestLocalFiles() {
    const dataDir = path.join(__dirname, '../data');

    if (!fs.existsSync(dataDir)) {
        console.log("Creating 'data' folder... Place your .txt files there!");
        fs.mkdirSync(dataDir);
        return;
    }

    const files = fs.readdirSync(dataDir).filter(file => file.endsWith('.txt'));

    if (files.length === 0) {
        console.log("Assertion: No .txt files found in apps/rag-service/data/");
        return;
    }

    console.log(`Found ${files.length} files. Starting ingestion...`);

    for (const file of files) {
        const filePath = path.join(dataDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');

        console.log(`Reading: ${file}...`);

        try {
            const response = await axios.post('http://localhost:3005/rag/ingest-text', {
                text: content,
                source: `Manual Upload: ${file}`
            });

            if (response.status === 201 || response.status === 200) {
                console.log(`Successfully ingested: ${file}`);
            }
        } catch (error) {
            console.error(`Failed to ingest ${file}:`, error.response?.data || error.message);
        }
    }

    console.log("Ingestion process finished.");
}

ingestLocalFiles();
