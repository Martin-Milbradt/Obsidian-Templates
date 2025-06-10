const GOOGLE_API_KEY = "YOUR_KEY_HERE";

function getUrlFinalSegment(url) {
    try {
        return new URL(url).pathname.split("/").pop();
    } catch (_) {
        return "file";
    }
}

async function tryGetFileType(url, result) {
    try {
        const response = await fetch(url, { method: "HEAD" });

        // Ensure site returns an ok status code before scraping
        if (!response.ok) {
            result.message = response.statusText ?? response.status;
            return;
        }

        // Ensure site is an actual HTML page and not a pdf or 3 gigabyte video file.
        let contentType = response.headers.get("content-type");
        if (contentType.includes("text/html")) {
            return;
        }
        const fileType = getUrlFinalSegment(url);
        if (fileType) {
            result.title = fileType;
            result.type = "file";
            result.success = true;
        }
    } catch (ex) {
        result.message = ex;
    }
}

async function getMetaDataText(doc, result) {
    result.type = "text";
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
        const arr = title.innerText.split(/[|—–]|(?: [-·:]+ )/);
        if (arr.length > 1 && (arr[0] == "Reddit" || arr[0] == "GitHub")) {
            result.title = arr[1].trim();
        } else {
            result.title = arr[0].trim();
        }
    } else {
        const noTitle = title?.getAttribute("no-title");
        if (noTitle) {
            result.title = noTitle;
        }
    }
    result.published = published;
    result.creator = creator;
    result.success = true;
}

function getYoutubeId(url) {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu.be\/)([a-zA-Z0-9_-]{11})/,
        /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
        /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
}

function formatDuration(str) {
    const [_, h, m, s] = str.match(/PT(?:(\d+)H)?(?:(\d+)M)?(\d+)S/) || [];
    let parts = [];
    if (h) {
        parts.push(h);
        parts.push((m || "0").padStart(2, "0"));
    } else if (m) {
        parts.push(m);
    }
    parts.push((s || "0").padStart(2, "0"));
    return parts.join(":");
}

async function getMetaDataYouTube(url, result) {
    try {
        const id = getYoutubeId(url);
        result.type = "video";
        result.url = `https://youtu.be/${id}`;
        const baseUrl = "https://www.googleapis.com/youtube/v3/videos";
        const params = new URLSearchParams({
            id: id,
            fields: "items(snippet(title,channelTitle,publishedAt),contentDetails(duration))",
            part: "snippet,contentDetails",
            key: GOOGLE_API_KEY,
        });
        const api_url = `${baseUrl}?${params}`;
        const response = await fetch(api_url);
        const data = await response.json();
        const item = data.items[0];

        result.title = item.snippet.title;
        result.creator = item.snippet.channelTitle;
        result.published = new Date(item.snippet.publishedAt).toISOString();
        result.length = formatDuration(item.contentDetails.duration);
        result.success = true;
    } catch (ex) {
        console.error(ex);
        result.message = ex;
    }
}

async function getMetaData(url) {
    const result = {
        title: null,
        published: null,
        success: false,
        creator: null,
        length: null,
        url: url,
        type: null,
        message: null,
    };
    if (!url) {
        throw new Error("No URL provided");
    }
    if (!(url.startsWith("http") || url.startsWith("https"))) {
        url = "https://" + url;
    }

    try {
        if (url.startsWith("https://www.youtube.com/watch?v=") || url.startsWith("https://youtu.be/")) {
            await getMetaDataYouTube(url, result);
        } else {
            const html = await request({ url }, { mode: "no-cors" });
            const doc = new DOMParser().parseFromString(html, "text/html");
            getMetaDataText(doc, result);
        }
    } catch (ex) {
        console.error(ex);
        result.message = ex;
        await tryGetFileType(url, result);
    }
    return result;
}

module.exports = getMetaData;
