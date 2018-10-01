var pageURL;

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
    if(pageURL.indexOf(".pdf") >= (pageURL.length-4)) {
		res.send("URL is to a PDF: " + pageURL);
    } else {
        //res.send("URL is not to a PDF: " + pageURL);
    
    	var request = require('request');
        request(pageURL, function (error, response, body) {
            console.log('error:', error); // Print the error if one occurred
            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
            console.log('body:', body.length); // Print the HTML for the Google homepage.
            let linksAsString = getPDFLinks(body);
            //var obj = { name: "John", age: 30, city: "New York", source: webPageHTML };
            res.send(JSON.stringify(linksAsString));
        });
	
    }
    
};

function getPDFLinks(input) {


    var linksToPDFs = [];

    //var pdfLink = /href\s*=\s*(['"]*)(https?:\/\/.+\.pdf)\1/g;
    var pdfLink = /href\s*=\s*(['"]?)((\/|http)[^>]+?\.pdf)\1/ig;
    var siteURL = pageURL.slice(0,pageURL.indexOf("/",8));
    
    var match;
    var linkToPDF;
    while (match = pdfLink.exec(input)) {
      if (match[2].indexOf("/") > 0) {
       linkToPDF = match[2];
      } else {
        linkToPDF= siteURL + match[2];
      }
      linksToPDFs.push(linkToPDF);
    } 
    return linksToPDFs.join("; ");
  }

