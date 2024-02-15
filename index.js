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
            //console.log('error:', error); // Print the error if one occurred
            //console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
            //console.log('body:', body); // Print the HTML for the Google homepage.
            const links = getLinks(body);
            res.send(links);
        });
	
    }
    
};

/**
 * HTTP Cloud Function.
 *
 * @param {Object} req Cloud Function request context.
 *                     More info: https://expressjs.com/en/api.html#req
 * @param {Object} res Cloud Function response context.
 *                     More info: https://expressjs.com/en/api.html#res
 */
exports.getPDFText = (req, res) => {

  //TODO how to handle if URL isn't in correct form or missing or not to a PDF
  //TODO how to handle if APIKEY is missing or null or not correct length
  
  const pdfURL = req.query.url;
  const apikey = req.query.apikey;
  
  // TODO error handling
  let cloudconvert = new (require('cloudconvert'))(apikey);
  cloudconvert.convert({
    inputformat: "pdf",
    outputformat: "txt",
    input: "download",
    download: false,
    wait: true,
    file: pdfURL
  }).pipe(res);
};


/** 
* HTTP Cloud Function.
 *
 * @param {Object} req Cloud Function request context.
 *                     More info: https://expressjs.com/en/api.html#req
 * @param {Object} res Cloud Function response context.
 *                     More info: https://expressjs.com/en/api.html#res
 */
exports.getConcepts = (req, res) => {

  const conceptsJSON = req.body.text;

  const concepts = [];
  
  const stringRegexp = /"string":"(.+?)"/ig;

  let match;

  while (match = stringRegexp.exec(conceptsJSON)) {
    concepts.push(match[1]);
  } 
  
	//console.log(concepts.join(";"));
  res.send(concepts.join(";"));
  //res.send(conceptsJSON);
};


/** 
* HTTP Cloud Function.
 *
 * @param {Object} req Cloud Function request context.
 *                     More info: https://expressjs.com/en/api.html#req
 * @param {Object} res Cloud Function response context.
 *                     More info: https://expressjs.com/en/api.html#res
 */
exports.saveEntity = (req, res) => {

  //const summary = req.body.summary;
  //const summary = "bah";

  const Datastore = require('@google-cloud/datastore');

  const projectId = req.body.projectId;

  // Creates a client
  const datastore = new Datastore({
    projectId: projectId
  });

  // The kind for the new entity
  const kind = req.body.kind;
  // The name/ID for the new entity
  const ID = req.body.ID;

  const update = req.body.update;
  // The Cloud Datastore key for the new entity
  const taskKey = datastore.key([kind, ID]);

  // Prepares the new entity
  const task = {
    key: taskKey,
    data: {
      Date: update.date,
      "Full text": update.fullText,
      Source: update.source,
      Summary: update.summary,
      URL: update.url,
      title: update.title,
      "Country of origin": update.country,
      "Sentiment - polarity": update.sentimentPolarity,
      "Sentiment - polarity confidence level": update.sentimentPolarityConfidenceLevel,
      "Sentiment - Subjectivity": update.sentimentSubjectivity,
      "Sentiment - Subjectivity confidence level": update.sentimentSubjectivityConfidenceLevel,
      "Keywords": update.keywords,
      "Organizations": update.organizations,
      "Locations": update.locations,
      "People": update.people,
      "Summarization": update.summarization,
      "Concepts": update.concepts,
      "Attachment links": update.attachmentLinks,
      "Content-Type": update.contentType,
      "Attachments Full Text": update.attachmentsFullText,
      "Attachments Keywords": update.attachmentsKeywords,
      "Attachments Organizations": update.attachmentsOrganizations,
      "Attachments People": update.attachmentsPeople,
      "Attachments Concepts": update.attachmentsConcepts,
      "Attachment 1 URL": update.attachment1Url,
      "Attachment 1 Full Text": update.attachment1Text,
      "Attachment 2 URL": update.attachment2Url,
      "Attachment 2 Full Text": update.attachment2Text,
      "Attachment 3 URL": update.attachment3Url,
      "Attachment 3 Full Text": update.attachment3Text
    },
  };

  // Saves the entity
  datastore
    .save(task)
    .then(() => {
      console.log(`Saved ${task.key.ID}: ${task.data.description}`);
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
  
  res.send('saved');
};


function getLinks(html) {

  const linksToPDFs = [];

  const pdfLinkRegexp = /href\s*=\s*(['"]?)((\/|http)[^>]+?\.pdf)\1/ig;
  const siteURL = getSiteURL(pageURL);

  let match;
  let linkToPDF;
  while (match = pdfLinkRegexp.exec(html)) {
    if (match[2].indexOf("/") > 0) {
      linkToPDF = match[2];
    } else {
      linkToPDF= siteURL + match[2];
    }
    linksToPDFs.push(linkToPDF);
  } 
return linksToPDFs.join(";");
}


function getSiteURL(url) {
  return url.slice(0,url.indexOf("/",8));
}

// TODO - return true even if name of PDF followed by query string
function isLinkToPDF(input) {
  const url = input.toLowerCase().trim
  if (url.indexOf(".pdf") >= (url.length-4)){
      return true;
  } else {
    return false;
  }
}

module.exports.isLinkToPDF = isLinkToPDF;
module.exports.getSiteURL = getSiteURL;


