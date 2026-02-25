const puppeteer = require('puppeteer');
const axios = require('axios');

async function syncBetterDocs() {
    const browser = await puppeteer.launch({ 
        headless: false, 
        args: [
            '--ignore-certificate-errors',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-web-security'
        ]
    }); 
    
    const page = await browser.newPage();

    await page.setExtraHTTPHeaders({ 'Upgrade-Insecure-Requests': '0' });
 
    page.on('dialog', async dialog => await dialog.dismiss());

    try {
        console.log("Clearing old data...");
        await axios.post('http://localhost:3005/rag/clear').catch(() => {});

        console.log("Accessing BLIH Marketing (Bypassing Security)...");
 
        await page.goto('https://brain.blihmarketing.com/wp-login.php', { 
            waitUntil: 'domcontentloaded', 
            timeout: 60000 
        });

        console.log("Entering Credentials...");
        await page.waitForSelector('#user_login', { timeout: 30000 });
        await page.type('#user_login', 'Blih kb'); 
        await page.type('#user_pass', 'tu%BTl&T2NGjkDG%R'); 
        await page.click('#wp-submit');

        await page.waitForSelector('#adminmenu', { timeout: 60000 });
        console.log("Login successful!");

        console.log("Navigating to All Docs list...");
        await page.goto('https://brain.blihmarketing.com/wp-admin/edit.php?post_type=docs', {
            waitUntil: 'domcontentloaded'
        });

        console.log("Checking view mode...");
        let tableExists = await page.$('.wp-list-table');

        if (!tableExists) {
            console.log("Grid view detected. Switching to Classic UI...");
            await page.evaluate(() => {
                const buttons = Array.from(document.querySelectorAll('button'));
                const classicBtn = buttons.find(b => b.innerText.includes('Classic UI'));
                if (classicBtn) {
                    classicBtn.click();
                } else {
                    window.location.href = 'edit.php?post_type=docs';
                }
            });
            await new Promise(r => setTimeout(r, 5000));
        }

        console.log("Scraping document links...");
        await page.waitForSelector('a.row-title', { timeout: 20000 });
        
        const links = await page.evaluate(() => {
            const anchors = Array.from(document.querySelectorAll('a.row-title'));
            return anchors
                .map(a => a.href)
                .filter(href => href.includes('action=edit') && !href.includes('action=trash'));
        });

        console.log(`Found ${links.length} valid documents! Ingesting...`);

        for (const link of links) {
            console.log(`Opening: ${link}`);
            await page.goto(link, { waitUntil: 'domcontentloaded', timeout: 60000 });
            
            await new Promise(r => setTimeout(r, 3000));

            const articleData = await page.evaluate(() => {
                const title = document.querySelector('.editor-post-title__block textarea')?.value || 
                              document.querySelector('#title')?.value || 
                              document.querySelector('h1.editor-post-title')?.innerText ||
                              'Untitled Doc';
                
                const content = document.querySelector('.editor-styles-wrapper')?.innerText || 
                                document.querySelector('.block-editor-writing-flow')?.innerText ||
                                document.querySelector('#content')?.value || 
                                document.querySelector('.wp-block-post-content')?.innerText ||
                                '';
                
                return { title, content };
            });

            if (articleData.content.trim().length > 10) {
                try {
                    await axios.post('http://localhost:3005/rag/ingest-text', {
                        text: `TITLE: ${articleData.title}\n\nCONTENT:\n${articleData.content}`,
                        source: `BetterDocs: ${articleData.title}`
                    });
                    console.log(`Ingested: ${articleData.title}`);
                } catch (postError) {
                    console.error(`NestJS Error for "${articleData.title}":`, postError.message);
                }
            }
        }

        console.log("Full Sync Complete!");

    } catch (error) {
        console.error("Robot error:", error.message);
    } finally {
        console.log("Process finished.");
    }
}

syncBetterDocs();
const puppeteer = require('puppeteer');
const axios = require('axios');

async function syncBetterDocs() {
  const browser = await puppeteer.launch({ 
    headless: false, 
    args: [
        '--ignore-certificate-errors',
        '--ignore-certificate-errors-spki-list',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--disable-blink-features=AutomationControlled' 
    ]
  }); 
  
  const page = await browser.newPage();

  await page.setExtraHTTPHeaders({ 'Upgrade-Insecure-Requests': '0' });
  
  page.on('dialog', async dialog => await dialog.dismiss());

  try {
    console.log("Accessing BLIH Marketing (Bypassing Security)...");
    
    await page.goto('https://brain.blihmarketing.com/wp-admin/', { 
        waitUntil: 'networkidle2',
        timeout: 60000 
    });

    console.log("Entering Credentials...");
    await page.waitForSelector('#user_login', { timeout: 30000 });
    await page.type('#user_login', 'Blih kb'); 
    await page.type('#user_pass', 'tu%BTl&T2NGjkDG%R'); 
    await page.click('#wp-submit');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    console.log("Navigating to All Docs list...");
    await page.waitForSelector('#adminmenu', { timeout: 30000 });
    
    await Promise.all([
        page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 60000 }),
        page.evaluate(() => {
            const subMenuItems = Array.from(document.querySelectorAll('.wp-submenu li a'));
            const allDocsLink = subMenuItems.find(el => el.innerText.includes('All Docs'));
            if (allDocsLink) {
                allDocsLink.click();
            } else {
                window.location.href = 'admin.php?page=betterdocs-docs-ui';
            }
        })
    ]);

    console.log("Checking view mode...");
    let tableExists = await page.$('.wp-list-table');

    if (!tableExists) {
        console.log("Grid view detected. Switching to Classic UI...");
        
        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 }).catch(() => {}),
            page.evaluate(() => {
                const buttons = Array.from(document.querySelectorAll('button'));
                const classicBtn = buttons.find(b => b.innerText.includes('Classic UI'));
                if (classicBtn) {
                    classicBtn.click();
                } else {
                    window.location.href = 'edit.php?post_type=docs';
                }
            })
        ]);
    }

    console.log("Scraping document links...");
    await page.waitForSelector('a.row-title', { timeout: 20000 });
    
    const links = await page.evaluate(() => {
        const anchors = Array.from(document.querySelectorAll('a.row-title'));
        return anchors
            .map(a => a.href)
            .filter(href => href.includes('action=edit') && !href.includes('action=trash'));
    });

    console.log(`Found ${links.length} valid documents! Ingesting...`);

    for (const link of links) {
        console.log(`Opening: ${link}`);
        await page.goto(link, { waitUntil: 'networkidle2' });
        
        await page.waitForSelector('.editor-styles-wrapper, #content, .wp-block-post-content', { timeout: 10000 }).catch(() => {});

        const articleData = await page.evaluate(() => {
            const title = document.querySelector('.editor-post-title__block textarea')?.value || 
                          document.querySelector('#title')?.value || 
                          document.querySelector('h1.editor-post-title')?.innerText ||
                          'Untitled Doc';
            
            const content = document.querySelector('.editor-styles-wrapper')?.innerText || 
                            document.querySelector('.block-editor-writing-flow')?.innerText ||
                            document.querySelector('#content')?.value || 
                            document.querySelector('.wp-block-post-content')?.innerText ||
                            '';
            
            return { title, content };
        });

        if (articleData.content.trim().length > 10) {
            try {
                await axios.post('http://localhost:3005/rag/ingest-text', {
                    text: `TITLE: ${articleData.title}\n\nCONTENT:\n${articleData.content}`,
                    source: `BetterDocs: ${articleData.title}`
                });
                console.log(`Ingested: ${articleData.title}`);
            } catch (postError) {
                console.error(`NestJS Error for "${articleData.title}":`, postError.message);
            }
        }
    }

    console.log("Full Sync Complete!");

  } catch (error) {
    console.error("Robot error:", error.message);
  } finally {
    console.log("Process finished.");
    // browser.close(); 
  }
}

syncBetterDocs();