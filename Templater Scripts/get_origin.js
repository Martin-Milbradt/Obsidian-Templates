function getOrigin(url) {
    const result = { source: "", creator: "", tags: [] };

    if (!url) {
        throw new Error("No URL provided");
    }

    if (url.startsWith("https://slatestarcodex.com/")) {
        result.source = "SSC";
        result.creator = "Scott Alexander";
        result.tags.push("rationality");
    } else if (url.startsWith("https://www.astralcodexten.com/")) {
        result.source = "ACX";
        result.creator = "Scott Alexander";
        result.tags.push("rationality");
    }
    // get_metadata handles author
    else if (url.startsWith("https://www.lesswrong.com/")) {
        result.source = "LessWrong";
        result.tags.push("rationality");
    }
    // get_metadata handles author
    else if (url.startsWith("https://forum.effectivealtruism.org/posts/")) {
        result.source = "EA Forum";
        result.tags.push("ea");
    } else if (url.startsWith("https://thezvi.substack.com/p/")) {
        result.source = "Don't Worry About the Vase";
        result.creator = "Zvi Mowshowitz";
        result.tags.push("rationality");
    } else if (url.startsWith("https://www.readthesequences.com/")) {
        result.source = "The Sequences - Rationality From AI to Zombies|Sequences";
        result.creator = "Eliezer Yudkowsky";
        result.tags.push("rationality");
    } else if (url.includes("worksinprogress.")) {
        result.source = "Works in Progress";
    } else if (url.startsWith("https://asteriskmag.com/")) {
        result.source = "Asterisk";
    }

    return result;
}

module.exports = getOrigin;
