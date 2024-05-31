function getUrlFinalSegment(url) {
    try {
        return new URL(url).pathname.split("/").pop();
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
    const result = {
        Title: url,
        Published: null,
        Success: false,
        Creator: null,
    };
    if (!(url.startsWith("http") || url.startsWith("https"))) {
        url = "https://" + url;
    }

    try {
        const html = await request({ url }, { mode: "no-cors" });
        const doc = new DOMParser().parseFromString(html, "text/html");
        // Select the script element with type application/ld+json

        const title = doc.querySelectorAll("title")[0];
        let creator = doc.querySelector('meta[name="citation_author"]')?.content;

        if (!creator) {
            creator = doc.querySelector(".author-link")?.textContent;
        }
        if (!creator) {
            creator = doc.querySelector(".dev_row a")?.textContent;
        }

        let published = doc.querySelector('meta[property="article:published_time"]')?.content;
        if (!published) {
            let date = doc.querySelector(".date")?.textContent;
            if (date) {
                if (!date.includes("Z")) {
                    date += "Z";
                }
                published = new Date(date).toISOString().split("T")[0];
            }
        }
        if (!published) {
            const scriptElement = doc.querySelector('script[type="application/ld+json"]');
            if (scriptElement?.innerText) {
                const jsonData = JSON.parse(scriptElement?.innerText);
                if (jsonData?.datePublished) {
                    published = jsonData.datePublished;
                }
            }
        }

        if (title?.innerText) {
            result.Title = title.innerText.split(/[|—–]|( - )|( · )|( :+ )/)[0].trim();
        } else {
            const noTitle = title?.getAttribute("no-title");
            if (noTitle) {
                result.Title = noTitle;
            }
        }
        result.Published = published;
        result.Creator = creator;
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
