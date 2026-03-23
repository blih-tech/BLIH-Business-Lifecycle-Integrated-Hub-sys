const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

const folderPath = '';

async function uploadFiles() {
    if (!fs.existsSync(folderPath)) {
        console.error('Folder path does not exist. Please check the path');
        console.log('looking for folder Path:', folderPath)
        return;
    }

    const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.pdf'));

    if(files.length == 0){
        console.log("no pdf file found in this folder");
        return;
    }
   console.log("found ${file.length} files. starting ingestion.. ");

   for(const file of files) {
       const filePath = path.join(folderPath, file);
       const form = new FormData();
       form.append('file', fs.createReadStream(filePath));

       try{
        console.log(`uploading: ${file}...`);
        const response = await axios.post('http://localhost:3005/rag/ingest', form, {
            headers: form.getHeaders(),
        });
        console.log(`success: ${file} -> ${response.data.message}`);
       } catch (error) {
        console.error(`failed to upload ${file}: ${error.message}`);
       }
   }
   console.log("Ingestion process finished")
}

uploadFiles();
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
