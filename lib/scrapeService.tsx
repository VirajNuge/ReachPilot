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

    // Navigate to URL and wait for network to be idle (indicates loading finished)
    await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });

    // Extract visible text
    const rawText = await page.evaluate(() => {
      const body = document.querySelector("body");
      // Get first 100k chars to stay within token limits
      return body ? body.innerText.substring(0, 100000) : "";
    });

    await browser.close();

    // Basic check if we got blocked
    if (rawText.length < 200) {
      return `ERROR: Content blocked or empty. URL: ${url}`;
    }

    return rawText;
  } catch (error) {
    await browser.close();
    console.error("Scraping failed:", error);
    return `ERROR: Scraping failed. ${error}`;
  }
}
