// app/api/extract/route.js
import puppeteer from 'puppeteer';
import { writeFile } from 'fs/promises';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  let browser = null;
  
  try {
    const { url } = await req.json();
    console.log(`Accessing URL: ${url}`);

    // Launch browser
    browser = await puppeteer.launch({
      headless: undefined
    });
    
    const page = await browser.newPage();

    // Navigate to page
    await page.goto(url);
    await page.waitForNetworkIdle();
    
    const title = await page.title();
    console.log(`Page title: ${title}`);

    // // Save page source
    const pageContent = await page.content();
    await writeFile('page_source.html', pageContent, 'utf-8');
    console.log('Saved page source');

    // // Take screenshot
    // await page.screenshot({ path: 'page.png' });
    // console.log('Saved screenshot');

    // Extract content
    const selectors = [
      'div.message-content',
      'div.markdown',
      'div.prose'
    ];

    const messages = [];
    
    for (const selector of selectors) {
      const elements = await page.$$(selector);
      console.log(`Found ${elements.length} elements with selector ${selector}`);

      for (const element of elements) {
        const text = await element.evaluate(el => el.innerText);
        if (text && !text.includes('En envoyant des messages')) {
          messages.push({
            content: text
          });
        }
      }
    }

    // Save messages to JSON file
    if (messages.length > 0) {
      console.log('\nExtracted messages:');
      messages.forEach((msg, idx) => {
        console.log(`\nMessage ${idx + 1}: ${msg.content.slice(0, 100)}...`);
      });

      await writeFile(
        'messages.json', 
        JSON.stringify(messages, null, 2), 
        'utf-8'
      );
      console.log('\nSaved messages to messages.json');
    } else {
      console.log('No messages extracted');
    }

    return NextResponse.json({
      success: true,
      messages,
      metadata: {
        title,
        url,
        extractedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}