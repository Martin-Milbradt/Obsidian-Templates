function getUrlFinalSegment(url) {
  try {
    return new URL(url).pathname.split('/').pop();
  } catch (_) {
    return "File";
  }
}

async function tryGetFileType(url) {
  try {
    const response = await fetch(url, { method: "HEAD" });

    // Ensure site returns an ok status code before scraping
    if (!response.ok) {
      return "Site Unreachable";
    }

    // Ensure site is an actual HTML page and not a pdf or 3 gigabyte video file.
    let contentType = response.headers.get("content-type");
    if (!contentType.includes("text/html")) {
      return getUrlFinalSegment(url);
    }
    return null;
  } catch (err) {
    return null;
  }
}

async function getPageTitle(url) {
  const result = { Title: url, Published: null, Success: false };
  if (!(url.startsWith("http") || url.startsWith("https"))) {
    url = "https://" + url;
  }

  try {
    const html = await request({ url });
    const doc = new DOMParser().parseFromString(html, "text/html");
        // Select the script element with type application/ld+json

    const title = doc.querySelectorAll("title")[0];
    const published = doc.querySelector('meta[property="article:published_time"]');
    if (published?.content) {
      result.Published = published.content;
    } else {
      const scriptElement = doc.querySelector('script[type="application/ld+json"]');
      if (scriptElement?.innerText) {
        const jsonData = JSON.parse(scriptElement?.innerText);
        if (jsonData?.datePublished) {
          result.Published = jsonData.datePublished;
        }
      }
    }
    if (title?.innerText) {
      result.Title = title.innerText.split(/[|—–]|( - )|( · )/)[0].trim();
    } else {
          const noTitle = title?.getAttribute("no-title");
      if (noTitle) {
        result.Title = noTitle;
      }
    }
    result.Success = true;
    return result;
  } catch (ex) {
    console.error(ex);
    // Try to figure out the file type
    const fileType = await tryGetFileType(url);
    if (fileType) {
      result.Title = fileType;
    }
    return result;
  }
}


module.exports = getPageTitle;
