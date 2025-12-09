function getOrigin(url) {
    if (!url) {
        throw new Error("No URL provided");
    }

    const urlObj = new URL(url);
    const result = { source: "", creator: "", tags: [] };
    if (urlObj.hostname === "slatestarcodex.com") {
        result.source = "SSC";
        result.creator = "Scott Alexander";
        result.tags.push("rationality");
    } else if (urlObj.hostname === "www.astralcodexten.com") {
        result.source = "ACX";
        result.creator = "Scott Alexander";
        result.tags.push("rationality");
    }
    // getMetadata handles author
    else if (urlObj.hostname === "www.lesswrong.com" && urlObj.pathname.startsWith("/posts/")) {
        result.source = "LessWrong";
        result.tags.push("rationality");
    } else if (urlObj.hostname === "desmolysium.com") {
        result.creator = "Desmolysium";
        result.tags.push("health");
    }
    // getMetadata handles author
    else if (urlObj.hostname === "forum.effectivealtruism.org" && urlObj.pathname.startsWith("/posts/")) {
        result.source = "EA Forum";
        result.tags.push("ea");
    } else if (urlObj.hostname === "thezvi.substack.com" && urlObj.pathname.startsWith("/p/")) {
        result.source = "Don't Worry About the Vase";
        result.creator = "Zvi Mowshowitz";
        result.tags.push("rationality");
    } else if (urlObj.hostname === "www.readthesequences.com") {
        result.source = "The Sequences - Rationality From AI to Zombies|Sequences";
        result.creator = "Eliezer Yudkowsky";
        result.tags.push("rationality");
    } else if (urlObj.hostname.includes("worksinprogress.")) {
        result.source = "Works in Progress";
    } else if (urlObj.hostname === "asteriskmag.com") {
        result.source = "Asterisk";
    }

    return result;
}

module.exports = getOrigin;
