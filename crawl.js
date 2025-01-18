const { JSDOM } = require('jsdom');

async function crawlPage(currentURL){
    console.log(`actively crawling: ${currentURL}`);

    try {
        const resp = await fetch(currentURL);
        if(resp.status > 399){
            console.log(`Error in fetching ${currentURL} with status code: ${resp.status}`);
            return;
        }

        const contentType = resp.headers.get("content-type");
        if(!contentType.includes("text/html")){
            console.log(`non html response, content type: ${contentType} on page: ${currentURL}`);
            return;
        }

        console.log(await resp.text());     //await-ing it because we want to wait for the response to come back before we try to read the text from it.
    } catch (error) {
        console.log(`error fetching ${currentURL}: ${error.message}`); 
    }
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