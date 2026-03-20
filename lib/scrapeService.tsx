import puppeteer from "puppeteer";

export async function scrapeProfile(url: string): Promise<string> {
  // Launch the browser
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
    ],
  });

  const page = await browser.newPage();

  try {
    // Fake a real user agent to avoid immediate blocking
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    // Block images, fonts and stylesheets — we only need text content
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const type = req.resourceType();
      if (type === "image" || type === "stylesheet" || type === "font" || type === "media") {
        req.abort();
      } else {
        req.continue();
      }
    });

    // domcontentloaded fires as soon as the HTML is parsed — much faster than
    // networkidle0 which waits for ALL network activity to stop (can be 30s+).
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });

    // Give JS a brief moment to render above-the-fold text (1s is plenty for text)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Extract visible text
    const rawText = await page.evaluate(() => {
      const body = document.querySelector("body");
      // Get first 100k chars to stay within token limits
      return body ? body.innerText.substring(0, 100000) : "";
    });

    // Basic check if we got blocked
    if (rawText.length < 200) {
      return `ERROR: Content blocked or empty. URL: ${url}`;
    }

    return rawText;
  } catch (error) {
    console.error("Scraping failed:", error);
    return `ERROR: Scraping failed. ${error}`;
  } finally {
    // Ensure browser is always closed, even if close() throws
    try {
      await browser.close();
    } catch (closeError) {
      console.error("Error closing browser:", closeError);
    }
  }
}
