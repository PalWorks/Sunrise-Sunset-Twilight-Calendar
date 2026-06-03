const { JSDOM } = require("jsdom");
const dom = new JSDOM(`<a id="btn" href="#">link</a>`);
const a = dom.window.document.getElementById('btn');
a.href = "https://example.com";
console.log("getAttribute:", a.getAttribute('href'));
