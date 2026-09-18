export function parseSimpleRss(xml: string, sourceName: string) {
    const items: any[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    const titleRegex = /<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/;
    const linkRegex = /<link>(.*?)<\/link>/;
    const pubDateRegex = /<pubDate>(.*?)<\/pubDate>/;

    let match;
    while ((match = itemRegex.exec(xml)) !== null) {
        const itemXml = match[1] || "";
        const titleMatch = titleRegex.exec(itemXml);
        const linkMatch = linkRegex.exec(itemXml);
        const pubDateMatch = pubDateRegex.exec(itemXml);

        if (titleMatch || linkMatch) {
            items.push({
                title: titleMatch ? titleMatch[1] : "No Title",
                url: linkMatch ? linkMatch[1] : "",
                publishedAt: pubDateMatch && pubDateMatch[1] ? new Date(pubDateMatch[1]).toISOString() : new Date().toISOString(),
                source: sourceName
            });
        }
    }
    return {
        totalResults: items.length,
        articles: items
    };
}