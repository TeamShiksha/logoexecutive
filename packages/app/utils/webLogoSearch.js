/**
 * Utility function for discovering company logo images.
 * 1. Find the company's official domain using Clearbit.
 * 2. Extract image URLs from header/nav sections
 * 3. Detect discovered images its format & size,
 */
const puppeteer = require("puppeteer-core");
const https = require("https");
const axios = require("axios");
const { imageSize } = require("image-size");
const { URL } = require("url");
const chromium = require("@sparticuz/chromium");

async function grabCompanyLogos(companyName, limit = 5) {
  if (!companyName || typeof companyName !== "string") {
    return { success: false, count: 0, logos: [] };
  }
  try {
    const companyDomain = await getCompanyDomain(companyName);
    if (!companyDomain) {
      return { success: false, count: 0, logos: [] };
    }
    const imageUrls = await scrapeHeaderImageUrls(companyDomain);
    if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
      return { success: false, count: 0, logos: [] };
    }
    const logos = [];
    for (const imageSrc of imageUrls.slice(0, limit)) {
      const absoluteImageUrl = resolveUrl(companyDomain, imageSrc);
      if (!absoluteImageUrl) continue;

      const imageMeta = await fetchImageMeta(absoluteImageUrl);
      if (!imageMeta) continue;
      logos.push({
        companyName,
        url: imageMeta.url,
        companyUri: companyDomain,
        extension: imageMeta.extension,
        size: imageMeta.size,
        bufferBase64: imageMeta.bufferBase64,
        mimeType: imageMeta.mimeType,
      });
    }
    return {
      success: logos.length > 0,
      count: logos.length,
      logos,
    };
  } catch (error) {
    console.warn("Failed to grab company logos:", error.message);
    return { success: false, count: 0, logos: [], error: error.message };
  }
}

function getCompanyDomain(companyName) {
  if (!companyName) return null;

  const encodedCompanyName = encodeURIComponent(companyName.trim());
  const requestUrl = `https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodedCompanyName}`;

  return new Promise((resolve, reject) => {
    https
      .get(requestUrl, (response) => {
        let responseBody = "";

        response.on("data", (chunk) => {
          responseBody += chunk;
        });

        response.on("end", () => {
          try {
            const companies = JSON.parse(responseBody);
            const domain = companies?.[0]?.domain;
            resolve(domain ? `https://${domain}/` : null);
          } catch (error) {
            reject(
              new Error(
                `Company lookup response parse failed: ${error.message}`
              )
            );
          }
        });
        response.on("error", reject);
      })
      .on("error", (error) =>
        reject(new Error(`Company lookup request failed: ${error.message}`))
      );
  });
}
function resolveUrl(baseDomain, imageSrc) {
  try {
    return new URL(imageSrc, baseDomain).toString();
  } catch {
    return null;
  }
}
async function scrapeHeaderImageUrls(siteUrl) {
  let browser;
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(45000);
    try {
      await page.goto(siteUrl, { waitUntil: "domcontentloaded" });
    } catch {
      await page.goto(siteUrl, { waitUntil: "load" });
    }

    const imageUrls = await page.evaluate(() => {
      const urls = new Set();
      document.querySelectorAll("header img, nav img").forEach((imgElement) => {
        if (imgElement.src) {
          urls.add(imgElement.src);
        }
      });
      document
        .querySelectorAll("header, nav, header *, nav *")
        .forEach((element) => {
          try {
            const backgroundImage =
              window.getComputedStyle(element).backgroundImage;
            if (!backgroundImage || !backgroundImage.includes("url(")) return;

            const match = backgroundImage.match(/url\(["']?(.*?)["']?\)/);
            if (match && match[1]) {
              urls.add(match[1]);
            }
          } catch {
            // Some elements may throw on computed styles  safe to ignore
          }
        });

      return Array.from(urls);
    });

    return imageUrls;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
async function fetchImageMeta(imageUrl) {
  try {
    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer",
      timeout: 7000,
      maxContentLength: 6 * 1024 * 1024,
    });

    const imageBuffer = Buffer.from(response.data);

    let imageInfo;
    try {
      imageInfo = imageSize(imageBuffer);
    } catch {
      // image-size may fail for SVGs or malformed images
    }

    let extension = "unknown";

    if (imageInfo && imageInfo.type) {
      extension = imageInfo.type;
    } else {
      try {
        extension = new URL(imageUrl).pathname.split(".").pop().toLowerCase();
      } catch {
        extension = "unknown";
      }
    }
    return {
      url: imageUrl,
      extension,
      size: imageBuffer.length,
      bufferBase64: imageBuffer.toString("base64"),
      mimeType: response.headers["content-type"],
    };
  } catch {
    return null;
  }
}
module.exports = { grabCompanyLogos };
