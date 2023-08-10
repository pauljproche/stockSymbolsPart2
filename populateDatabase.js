const { MongoClient } = require('mongodb');
const http = require('http');

const uri = "mongodb+srv://stockexchangeuser1:w7o8lxhnXVoBHBAx@cluster0.qtbascu.mongodb.net/?retryWrites=true&w=majority";

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const database = client.db("stockSymbols");
    const collection = database.collection("companies");
    const query = await collection.find({}).toArray();
    return JSON.stringify(query, null, 2);
  } catch (err) {
    console.log("Error in MongoDB query:", err);
    throw err;
  } finally {
    await client.close();
  }
}

const port = process.env.PORT || 3000;

http.createServer(async function (req, res) {
  if (req.url === '/') {
    try {
      const queryResult = await run();

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.write("<h2>Hello World</h2>");
      res.write("Success! This app is deployed online");
      res.write("<h3>Query Results for Stock Companies & Symbols:</h3>");
      res.write("<pre>" + queryResult + "</pre>");
      res.end();
    } catch (err) {
      console.log("Error in request:", err);
      res.writeHead(500, { 'Content-Type': 'text/html' });
      res.write("An error occurred while processing the request.");
      res.end();
    }
  }
}).listen(port, () => {
  console.log(`Server running on port ${port}`);
});
