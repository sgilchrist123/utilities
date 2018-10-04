const index = require('./index');



test('correct site URL is generated', () => {
  expect(index.getSiteURL("http://www.foo.com/report.pdf")).toBe("http://www.foo.com");
});


test('correct greeting is generated', () => {
  //expect(index.isLinkToPDF("http://www.foo.com/report.pdf?something=something")).toBe(true);
  expect(index.isLinkToPDF("http://www.foo.com/index.html")).toBe(false);
}); 

test('correct greeting is generated', () => {
  expect(index.isLinkToPDF("http://www.foo.com/pdfs/index.html")).toBe(false);
});     

test('isLinkToPDF - Link to PDF', () => {
  expect(index.isLinkToPDF("http://www.foo.com/report.pdf")).toBe(true);
  
});  

test('isLinkToPDF - Link to PDF - Uppercase', () => {
  expect(index.isLinkToPDF("http://www.foo.com/report.PDF")).toBe(true);
});

test('isLinkToPDF - trim input', () => {
  expect(index.isLinkToPDF(" http://www.foo.com/report.PDF ")).toBe(true);
}); 