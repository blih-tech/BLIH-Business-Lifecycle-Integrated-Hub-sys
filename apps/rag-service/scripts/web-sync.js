const puppeteer = require('puppeteer');
const axios = require('axios');

async function syncBetterDocs() {
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', {
      get: () => false,
    });
  });

  page.on('dialog', async (dialog) => await dialog.dismiss());

  try {
    console.log('Opening login page...');

    await page.goto('https://brain.blihmarketing.com/wp-login.php', {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });

    console.log('Entering credentials...');

    await page.waitForSelector('#user_login', { timeout: 30000 });

    await page.type('#user_login', 'Blih kb', { delay: 80 });
    await page.type('#user_pass', 'tu%BTl&T2NGjkDG%R', { delay: 80 });

    console.log('Clicking login...');

    await page.click('#wp-submit');

    await Promise.race([
      page.waitForSelector('#adminmenu', { timeout: 30000 }),
      page.waitForSelector('#login_error', { timeout: 30000 }),
    ]);

    console.log('Current URL:', page.url());

    // Check login error
    const loginError = await page.$('#login_error');
    if (loginError) {
      const errorText = await page.evaluate((el) => el.innerText, loginError);
      throw new Error('Login failed: ' + errorText);
    }

    if (!page.url().includes('/wp-admin')) {
      throw new Error('Login did not redirect to wp-admin.');
    }

    console.log('Login successful!');

    console.log('Navigating to Docs list...');

    await page.goto(
      'https://brain.blihmarketing.com/wp-admin/edit.php?post_type=docs',
      { waitUntil: 'domcontentloaded', timeout: 60000 },
    );

    await page.waitForSelector('.wp-list-table', { timeout: 30000 });

    console.log('Scraping document links...');

    const links = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a.row-title'))
        .map((a) => a.href)
        .filter(
          (href) =>
            href.includes('action=edit') && !href.includes('action=trash'),
        );
    });

    console.log(`Found ${links.length} documents! Ingesting...`);

    for (const link of links) {
      console.log(`Opening: ${link}`);

      await page.goto(link, { waitUntil: 'domcontentloaded', timeout: 60000 });

      await new Promise((r) => setTimeout(r, 3000));

      const articleData = await page.evaluate(() => {
        const title =
          document.querySelector('.editor-post-title__block textarea')?.value ||
          document.querySelector('#title')?.value ||
          document.querySelector('h1.editor-post-title')?.innerText ||
          'Untitled Doc';

        const content =
          document.querySelector('.editor-styles-wrapper')?.innerText ||
          document.querySelector('.block-editor-writing-flow')?.innerText ||
          document.querySelector('#content')?.value ||
          document.querySelector('.wp-block-post-content')?.innerText ||
          '';

        return { title, content };
      });

      if (articleData.content.trim().length > 50) {
        try {
          await axios.post('http://localhost:3005/rag/ingest-text', {
            text: `TITLE: ${articleData.title}\n\nCONTENT:\n${articleData.content}`,
            source: `BetterDocs: ${articleData.title}`,
          });

          console.log(`Ingested: ${articleData.title}`);
        } catch (postError) {
          console.error(
            `NestJS Error for "${articleData.title}":`,
            postError.message,
          );
        }
      } else {
        console.log(
          `Skipping ${articleData.title}: Content too short or failed to load.`,
        );
      }
    }

    console.log('Full Sync Complete!');
  } catch (error) {
    console.error('Robot error:', error.message);
  } finally {
    console.log('Process finished.');
    // browser.close();
  }
}

syncBetterDocs();
