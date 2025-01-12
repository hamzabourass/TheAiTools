import puppeteer from 'puppeteer';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  let browser = null;

  try {
    const { url } = await req.json();
    console.log(`Processing URL: ${url}`);

    // Launch browser with specific options
    browser = await puppeteer.launch({
      headless: false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();
    
    // Set viewport and timeout
    await page.setViewport({ width: 1280, height: 800 });
    await page.setDefaultTimeout(30000);

    // Navigate to page
    await page.goto(url, {
      waitUntil: ['networkidle0', 'domcontentloaded']
    });

    const title = await page.title();

    const selectors = [
      'div.message-content',
      'div.markdown',
      'div.prose'
    ];

    const messages = [];
    
    for (const selector of selectors) {
      try {
        const elements = await page.$$(selector);
        console.log(`Found ${elements.length} elements with selector ${selector}`);

        for (const element of elements) {
          const text = await element.evaluate(el => el.innerText);
          if (text && 
              text.trim().length > 0 && 
              !text.includes('En envoyant des messages')) {
            messages.push({
              content: text.trim(),
              selector: selector,
              timestamp: new Date().toISOString()
            });
          }
        }
      } catch (selectorError) {
        console.warn(`Error processing selector ${selector}:`, selectorError.message);
        continue;
      }
    }

    return NextResponse.json({
      success: true,
      messages,
      metadata: {
        title,
        url,
        messageCount: messages.length,
        extractedAt: new Date().toISOString(),
        selectors: selectors
      }
    });

  } catch (error) {
    console.error('Extraction error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      metadata: {
        url,
        attemptedAt: new Date().toISOString()
      }
    }, { 
      status: error.name === 'TimeoutError' ? 504 : 500 
    });

  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('Error closing browser:', closeError);
      }
    }
  }
}