const {normalizeURL, getURLsFromHTML} = require('./crawl.js');
const { test, expect } = require("@jest/globals");

//Tests for normalizeURL
test("normalizeURL strip protocol", () => {
    const input = 'https://example.com/path';
    const actual = normalizeURL(input);
    const expected = 'example.com/path';
    expect(actual).toEqual(expected);
})

test("normalizeURL strip http", () => {
    const input = 'http://example.com/path';
    const actual = normalizeURL(input);
    const expected = 'example.com/path';
    expect(actual).toEqual(expected);
})

test("normalizeURL strip trailing slashes", () => {
    const input = 'https://example.com/path/';
    const actual = normalizeURL(input);
    const expected = 'example.com/path';
    expect(actual).toEqual(expected);
})

test("normalizeURL capitals", () => {
    const input = 'https://EXAMPLE.com/path/';
    const actual = normalizeURL(input);
    const expected = 'example.com/path';
    expect(actual).toEqual(expected);
})

//Tests for getURLsFromHTML
test("getURLsFromHTML absolute", () => {
    const inputHTMLBody = `
        <html>
            <body>
                <a href="https://example.com/path/">Link</a>
            </body>
        </html>
    `;
    const inputBaseURL = 'https://example.com';
    const actual = getURLsFromHTML(inputHTMLBody, inputBaseURL);
    const expected = ["https://example.com/path/"];
    expect(actual).toEqual(expected);
})
test("getURLsFromHTML relative", () => {
    const inputHTMLBody = `
        <html>
            <body>
                <a href="/path/">Link</a>
            </body>
        </html>
    `;
    const inputBaseURL = 'https://example.com';
    const actual = getURLsFromHTML(inputHTMLBody, inputBaseURL);
    const expected = ["https://example.com/path/"];
    expect(actual).toEqual(expected);
})
test("getURLsFromHTML multiple links of both type", () => {
    const inputHTMLBody = `
        <html>
            <body>
                <a href="https://example.com/path1/">Link</a>
                <a href="/path2/">Link</a>
            </body>
        </html>
    `;
    const inputBaseURL = 'https://example.com';
    const actual = getURLsFromHTML(inputHTMLBody, inputBaseURL);
    const expected = ["https://example.com/path1/", "https://example.com/path2/"];
    expect(actual).toEqual(expected);
})
test("getURLsFromHTML invalid links of both type", () => {
    const inputHTMLBody = `
        <html>
            <body>
                <a href="https://example.com/path1/">Link</a>
                <a href="/path2/">Link</a>
                <a href="invalid">Link</a>
            </body>
        </html>
    `;
    const inputBaseURL = 'https://example.com';
    const actual = getURLsFromHTML(inputHTMLBody, inputBaseURL);
    const expected = ["https://example.com/path1/", "https://example.com/path2/"];
    expect(actual).toEqual(expected);
})
