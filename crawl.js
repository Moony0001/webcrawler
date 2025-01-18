const { JSDOM } = require('jsdom');

async function crawlPage(baseURL, currentURL, pages){
    const baseURLObj = new URL(baseURL);
    const currentURLObj = new URL(currentURL);
    if(baseURLObj.hostname !== currentURLObj.hostname){
        return pages;
    }

    const normalizedCurrentURL = normalizeURL(currentURL);
    if(pages[normalizedCurrentURL]>0){
        pages[normalizedCurrentURL]++;      //If we have already seen this URL, we increment the count. This is useful when we want to generate a report on how many times a page was linked to a URL.
        return pages;
    }

    pages[normalizedCurrentURL] = 1;    //If we haven't seen this URL before, we add it to the pages object and set the count to 1.

    console.log(`actively crawling: ${currentURL}`);    //We log the URL we are actively crawling. We don't log the URLs we have already seen because we don't want to log the same URL multiple times.
    try {
        const resp = await fetch(currentURL);
        if(resp.status > 399){
            console.log(`Error in fetching ${currentURL} with status code: ${resp.status}`);
            return pages;
        }

        const contentType = resp.headers.get("content-type");
        if(!contentType.includes("text/html")){
            console.log(`non html response, content type: ${contentType} on page: ${currentURL}`);
            return pages;
        }

        const htmlBody = await resp.text();

        const nextURLs = getURLsFromHTML(htmlBody, baseURL);

        for(const nextURL of nextURLs){
            pages = await crawlPage(baseURL, nextURL, pages);
        }

    } catch (error) {
        console.log(`error fetching ${currentURL}: ${error.message}`); 
    }

    return pages;
}

function getURLsFromHTML(htmlBody, baseURL){
    const urls = [];
    const dom = new JSDOM(htmlBody);
    const linkElements = dom.window.document.querySelectorAll('a');     //this will return us link elements. This syntax is what we would use in the browser to work with the DOM.
    for(const linkElement of linkElements){
        if(linkElement.href.slice(0, 1)==='/'){
            //relative URL
            try {
                const urlObj = new URL(`${baseURL}${linkElement.href}`);
                urls.push(urlObj.href);
            } catch (error) {
                console.log(`error with relative URL: ${error.message}`);
            }
        } else {
            //absolute URL
            try {
                const urlObj = new URL(linkElement.href);
                urls.push(urlObj.href);
            } catch (error) {
                console.log(`error with absolute URL: ${error.message}`);
                
            }
        }         
    }
    return urls; 
}

function normalizeURL(urlString){
    const urlObj = new URL(urlString);
    const hostPath = `${urlObj.hostname}${urlObj.pathname}`; 
    if(hostPath.length > 0 && hostPath.slice(-1) === '/'){
        return hostPath.slice(0, -1);   //The -1 tells slice to go up to the last character, but not include it.
    }
    return hostPath;
}

module.exports = {
    normalizeURL,
    getURLsFromHTML,
    crawlPage
};