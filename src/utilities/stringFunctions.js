function htmlToMarkdown(html) {
    // Convert headings
    html = html.replace(/<h([1-6])>(.*?)<\/h\1>/gi, (match, level, content) => {
        return `${'#'.repeat(level)} ${content}`;
    });

    // Convert bold and strong
    html = html.replace(/<(b|strong)>(.*?)<\/\1>/gi, '**$2**');

    // Convert italics and emphasis
    html = html.replace(/<(i|em)>(.*?)<\/\1>/gi, '*$2*');

    // Convert links and use replace https:// in the name of link (inside []) 
    html = html.replace(/<a href="(.*?)".*?>(.*?)<\/a>/gi, '[$2]($1)').replace(/\[https:\/\//gi, '[');

    // Convert images
    html = html.replace(/<img src="(.*?)" alt="(.*?)".*?>/gi, '![$2]($1)');

    // Convert unordered lists
    html = html.replace(/<ul>(.*?)<\/ul>/gis, (match, content) => {
        return content.replace(/<li>(.*?)<\/li>/g, '* $1');
    });

    // Convert ordered lists
    html = html.replace(/<ol>(.*?)<\/ol>/gis, (match, content) => {
        let index = 1;
        return content.replace(/<li>(.*?)<\/li>/g, () => `${index++}. $1`);
    });

    // Convert paragraphs
    html = html.replace(/<p>(.*?)<\/p>/gi, '$1\n');

    // Convert line breaks
    html = html.replace(/<br\s*\/?>/gi, '\n');

    // Remove any remaining HTML tags
    html = html.replace(/<\/?[^>]+(>|$)/g, '');

    // Trim excess whitespace
    return html.trim();
}
module.exports = { htmlToMarkdown };