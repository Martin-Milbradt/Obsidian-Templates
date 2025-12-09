function getUrlFinalSegment(url) {
    try {
        return url.split("/").pop();
    } catch (_) {
        return "file";
    }
}

async function tryGetFileType(tp, data) {
    try {
        const response = await tp.obsidian.request({ url: data.url, method: "HEAD" });

        // Ensure site returns an ok status code before scraping
        if (!response.ok) {
            console.error(response.statusText ?? response.status);
            return;
        }

        // Ensure site is an actual HTML page and not a pdf or 3 gigabyte video file.
        let contentType = response.headers.get("content-type");
        if (contentType.includes("text/html")) {
            return;
        }
        const fileType = getUrlFinalSegment(data.url);
        if (fileType) {
            data.title = fileType;
            data.type = "file";
            data.success = true;
        }
    } catch (ex) {
        console.error(ex);
    }
}

async function getMetadataText(tp, data) {
    const html = await tp.obsidian.request(data.url);
    const doc = new DOMParser().parseFromString(html, "text/html");
    data.type = "text";
    if (!data.creator) {
        let creator = doc.querySelector('meta[name="citation_author"]')?.content;
        if (!creator) {
            creator = doc.querySelector(".author-link")?.textContent;
        }
        if (!creator) {
            creator = doc.querySelector(".dev_row a")?.textContent;
        }
        if (creator) {
            data.creator = creator;
        }
    }

    if (!data.published) {
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
        data.published = published;
    }
    if (!data.title) {
        const title = doc.querySelector("title");
        const titleText = title?.textContent;
        if (titleText) {
            const arr = titleText.split(/[|—–]|(?: [-·:]+ )/);
            if (arr.length > 1 && (arr[0] == "Reddit" || arr[0] == "GitHub")) {
                data.title = arr[1].trim();
            } else {
                data.title = arr[0].trim();
            }
            console.log(data.title);
        } else {
            const noTitle = title?.getAttribute("no-title");
            if (noTitle) {
                data.title = noTitle;
            }
        }
    }
    data.success = true;
}

function getYoutubeId(url) {
    let urlObj;
    try {
        urlObj = new URL(url);
    } catch (_) {
        urlObj = new URL("https://" + url);
    }
    if (urlObj.hostname === "youtu.be") {
        // Shortlink: https://youtu.be/<id>
        return urlObj.pathname.slice(1, 12);
    }
    if (urlObj.hostname.endsWith("youtube.com")) {
        // https://www.youtube.com/watch?v=<id>
        if (urlObj.pathname === "/watch" && urlObj.searchParams) {
            return urlObj.searchParams.get("v");
        }
        // https://www.youtube.com/embed/<id>
        if (urlObj.pathname.startsWith("/embed/")) {
            return urlObj.pathname.split("/embed/")[1];
        }
        // https://www.youtube.com/v/<id>
        if (urlObj.pathname.startsWith("/v/")) {
            return urlObj.pathname.split("/v/")[1];
        }
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

async function getMetadataYouTube(tp, data) {
    try {
        const id = getYoutubeId(data.url);
        data.type = "video";
        data.url = `https://youtu.be/${id}`;
        const baseUrl = "https://www.googleapis.com/youtube/v3/videos";
        const params = new URLSearchParams({
            id: id,
            fields: "items(snippet(title,channelTitle,publishedAt),contentDetails(duration))",
            part: "snippet,contentDetails",
            key: tp.user.secrets("GOOGLE_API_KEY"),
        });
        const api_url = `${baseUrl}?${params}`;
        const response = await tp.obsidian.request(api_url);
        const responseData = await response.json();
        const item = responseData.items[0];

        if (!data.title) {
            data.title = item.snippet.title;
        }
        if (!data.creator) {
            data.creator = item.snippet.channelTitle;
        }
        if (!data.published) {
            data.published = new Date(item.snippet.publishedAt).toISOString();
        }
        if (!data.length) {
            data.length = formatDuration(item.contentDetails.duration);
        }
        data.success = true;
    } catch (ex) {
        console.error(ex);
    }
}

async function getMetadataGraphQL(tp, data) {
    let responseText = false;
    try {
        let urlObj;
        try {
            urlObj = new URL(data.url);
        } catch (_) {
            urlObj = new URL("https://" + data.url);
        }
        // Example URL: "https://www.lesswrong.com/posts/LJiGhpq8w4Badr5KJ/graphql-tutorial-for-lesswrong-and-effective-altruism-forum"
        // The slug is always the segment after '/posts/' in the pathname
        const slug = urlObj.pathname.split("/posts/")[1].split("/")[0];

        const query = `{
            post(
                input: {selector: {_id: "${slug}"}}
            ) {
                result {
                    title
                    postedAt
                    wordCount
                    user {
                        displayName
                    }
                }
            }
        }`;
        responseText = await tp.obsidian.request({
            url: `${urlObj.origin}/graphql`,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "User-Agent": `${tp.user.secrets("LW_USER_AGENT")}`,
            },
            body: JSON.stringify({ query }),
        });

        const responseData = JSON.parse(responseText);
        // The response is in data.post.result
        const post = responseData?.data?.post?.result;
        if (!post) throw new Error("Could not retrieve post metadata from GraphQL response");

        if (!data.title) {
            data.title = post.title;
        }
        if (!data.creator) {
            data.creator = post.user?.displayName;
        }
        if (!data.published) {
            data.published = post.postedAt ? new Date(post.postedAt).toISOString() : null;
        }
        data.success = true;
        if (!data.length) {
            data.length = post?.wordCount;
        }
    } catch (ex) {
        if (responseText) {
            console.log(responseText);
        }
        console.error(ex);
    }
}

async function getMetadata(tp, data) {
    if (!data.url) {
        throw new Error("No URL provided");
    }

    let urlObj;
    try {
        urlObj = new URL(data.url);
    } catch (_) {
        urlObj = new URL("https://" + data.url);
    }

    try {
        const hostname = urlObj.hostname;
        if (hostname === "www.youtube.com" || hostname === "youtu.be") {
            await getMetadataYouTube(tp, data);
        } else if (
            (hostname === "www.lesswrong.com" || hostname === "forum.effectivealtruism.org") &&
            urlObj.pathname.startsWith("/posts/")
        ) {
            await getMetadataGraphQL(tp, data);
        } else {
            await getMetadataText(tp, data);
        }
    } catch (ex) {
        console.error(ex);
        await tryGetFileType(tp, data);
    }
}

module.exports = getMetadata;
