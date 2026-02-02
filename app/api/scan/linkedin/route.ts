import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

// Add stealth plugin to avoid detection
puppeteer.use(StealthPlugin());

export async function POST(request: NextRequest) {
  try {
    const { profileUrl } = await request.json();

    if (!profileUrl || !profileUrl.includes("linkedin.com")) {
      return NextResponse.json(
        { error: "Invalid LinkedIn URL" },
        { status: 400 },
      );
    }

    // Launch visible browser for user login
    const browser = await puppeteer.launch({
      headless: false, // Visible browser!
      defaultViewport: null,
      args: [
        "--start-maximized",
        "--disable-blink-features=AutomationControlled",
      ],
    });

    try {
      const page = await browser.newPage();

      // Set a realistic user agent
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      );

      // Navigate to LinkedIn login
      await page.goto("https://www.linkedin.com/login", {
        waitUntil: "networkidle2",
      });

      // Wait for user to login (check for feed or profile presence)
      console.log("Waiting for user to login...");
      try {
        await page.waitForFunction(
          () => {
            return (
              window.location.href.includes("/feed") ||
              window.location.href.includes("/in/") ||
              document.querySelector(
                '[data-control-name="identity_welcome_message"]',
              )
            );
          },
          { timeout: 120000 }, // 2 minutes to login
        );
      } catch {
        return NextResponse.json(
          { error: "Login timeout. Please try again." },
          { status: 408 },
        );
      }

      // Navigate to target profile
      console.log("Navigating to profile:", profileUrl);
      await page.goto(profileUrl, { waitUntil: "networkidle2" });
      await page.waitForSelector(".pv-text-details__left-panel", {
        timeout: 15000,
      });

      // Extract profile data
      const profileData = await page.evaluate(() => {
        const getText = (selector: string) => {
          const el = document.querySelector(selector);
          return el?.textContent?.trim() || "";
        };

        const getFollowers = () => {
          const followerSpan = Array.from(document.querySelectorAll("span")).find(
            (el) => el.textContent?.includes("followers"),
          );
          return followerSpan?.textContent?.replace(/[^0-9]/g, "") || "0";
        };

        return {
          name: getText(".text-heading-xlarge"),
          headline: getText(".text-body-medium.break-words"),
          location: getText(".text-body-small.inline.t-black--light.break-words"),
          followers: getFollowers(),
          about: getText("#about ~ div .inline-show-more-text"),
          experience: Array.from(
            document.querySelectorAll("#experience ~ div .pvs-entity"),
          )
            .slice(0, 3)
            .map((el) => ({
              title: el.querySelector(".t-bold span")?.textContent?.trim() || "",
              company:
                el.querySelector(".t-normal span")?.textContent?.trim() || "",
            })),
        };
      });

      return NextResponse.json({
        success: true,
        platform: "linkedin",
        data: profileData,
      });
    } catch (error) {
      console.error("Scanner error:", error);
      return NextResponse.json(
        { error: "Failed to scan profile. Please try again." },
        { status: 500 },
      );
    } finally {
      // Ensure browser is always closed
      try {
        await browser.close();
      } catch (closeError) {
        console.error("Error closing browser:", closeError);
      }
    }
}
