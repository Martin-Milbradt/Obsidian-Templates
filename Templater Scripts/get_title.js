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
  if (!(url.startsWith("http") || url.startsWith("https"))) {
    url = "https://" + url;
  }

  try {
    const html = await request({ url });

    const doc = new DOMParser().parseFromString(html, "text/html");
    const title = doc.querySelectorAll("title")[0];

    if (title?.innerText) {
      return title.innerText;
    }

    // If site is javascript based and has a no-title attribute when unloaded, use it.
    const noTitle = title?.getAttribute("no-title");
    if (noTitle) {
      return noTitle;
    }

    // Otherwise if the site has no title/requires javascript simply return Title Unknown
    return url;

  } catch (ex) {
    console.error(ex);
    // Try to figure out the file type
    const fileType = await tryGetFileType(url);
    if (fileType) {
      return fileType;
    }
    return "Site Unreachable";
  }
}


module.exports = getPageTitle;
