const { MongoClient } = require('mongodb');
const http = require('http');
const fs = require('fs');
const url = require('url');

const uri = "mongodb+srv://stockexchangeuser1:w7o8lxhnXVoBHBAx@cluster0.qtbascu.mongodb.net/?retryWrites=true&w=majority";

async function searchCompany(searchType, searchTerm) {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const database = client.db("stockSymbols");
        const collection = database.collection("companies");

        let query = {};
        if (searchType === 'symbol') {
            query = { stockTicker: searchTerm };
        } else {
            query = { companyName: searchTerm };
        }

        const result = await collection.find(query).toArray();
        return result;
    } catch (err) {
        console.log("Error searching for company:", err);
        throw err;
    } finally {
        await client.close();
    }
}

const port = process.env.PORT || 3000;

http.createServer(async function (req, res) {
    if (req.url === '/search') {
        const { searchType, searchTerm } = url.parse(req.url, true).query;
        
        try {
            const searchResult = await searchCompany(searchType, searchTerm);

            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write("<h2>Search Results</h2>");
            if (searchResult.length === 0) {
                res.write("No results found.");
            } else {
                res.write("<ul>");
                searchResult.forEach(company => {
                    res.write(`<li>${company.companyName} (${company.stockTicker}) - Price: ${company.stockPrice}</li>`);
                });
                res.write("</ul>");
            }
            res.end();
        } catch (err) {
            console.log("Error in request:", err);
            res.writeHead(500, { 'Content-Type': 'text/html' });
            res.write("An error occurred while processing the request.");
            res.end();
        }
    } else if (req.url === '/form') {
        const formHtml = fs.readFileSync('form1.html', 'utf8'); // Change the filename to match your HTML file
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(formHtml);
        res.end();
    }
}).listen(port, () => {
    console.log(`Server running on port ${port}`);
});
