let pageURL;

/**
 * HTTP Cloud Function.
 *
 * @param {Object} req Cloud Function request context.
 *                     More info: https://expressjs.com/en/api.html#req
 * @param {Object} res Cloud Function response context.
 *                     More info: https://expressjs.com/en/api.html#res
 */
exports.getAttachmentLinks = (req, res) => {

	pageURL = req.query.url;
	
    //TODO - Check if URL is in correct format (eg starts with "http://", if not try to fix)
    
	//If input URL is already to a PDF, just return it. Otherwise process it.
    if(isLinkToPDF(pageURL)) {
		res.send(pageURL);
    } else {    
        const request = require('request');
        request(pageURL, function (error, response, body) {
            console.log('error:', error); // Print the error if one occurred
            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
            console.log('body:', body.length); // Print the HTML for the Google homepage.
            const linksAsString = getPDFLinks(body);
            res.send(linksAsString);
        });
	
    }
    
};

function getPDFLinks(input) {

    const linksToPDFs = [];

    const pdfLink = /href\s*=\s*(['"]?)((\/|http)[^>]+?\.pdf)\1/ig;
    const siteURL = pageURL.slice(0,pageURL.indexOf("/",8));
    
    let match;
    let linkToPDF;
    while (match = pdfLink.exec(input)) {
      if (match[2].indexOf("/") > 0) {
       linkToPDF = match[2];
      } else {
        linkToPDF= siteURL + match[2];
      }
      linksToPDFs.push(linkToPDF);
    } 
    return linksToPDFs.join(";");
  }

  function isLinkToPDF(url) {
    if (url.indexOf(".pdf") >= (url.length-4)){
        return true;
    } else {
      return false;
    }
  }

