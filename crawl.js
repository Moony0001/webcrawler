function normalizeURL(urlString){
    const urlObj = new URL(urlString);
    const hostPath = `${urlObj.hostname}${urlObj.pathname}`; 
    if(hostPath.length > 0 && hostPath.slice(-1) === '/'){
        return hostPath.slice(0, -1);   //The -1 tells slice to go up to the last character, but not include it.
    }
    return hostPath;
}

module.exports = {normalizeURL};