const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const { MongoClient } = require("mongodb");

const app = express();
const PORT = 3000;

const corsOptions = {
  origin: "http://localhost:3000",
};

async function connectToCluster(uri) {
  let mongoClient;

  try {
    mongoClient = new MongoClient(uri);

    console.log("Connecting to MongoDB Atlas cluster...");

    await mongoClient.connect();

    console.log("Successfully connected to MongoDB Atlas!");

    return mongoClient;
  } catch (error) {
    console.error("Connection to MongoDB Atlas failed!", error);
    process.exit(1);
  }
}

let connectionUri =
  "mongodb+srv://Marshalino:Testing@cluster0.h6pcrvm.mongodb.net/?retryWrites=true&w=majority";

async function startServer() {
  // Connect to MongoDB Atlas
  let mongoClient = await connectToCluster(connectionUri);
  const db = mongoClient.db("database");
  const collection = db.collection("users");

  // Use Body Parser
  app.use(bodyParser.json());

  // Use Cors
  app.use(cors(corsOptions));

  // Get html templates
  app.use(express.static(path.join(__dirname, "html")));

  app.get("/", async (req, res) => {
    // Render index.html
    return res.sendFile(path.join(__dirname, ".", "index.html"));
  });

  // Post /submit
  app.post("/submit", async (req, res) => {
    try {
      const userData = req.body;

      // Validate ID Number
      const existingUser = await collection.findOne({
        idNumber: userData.idNumber,
      });
      if (existingUser) {
        return res
          .status(400)
          .json({ error: "Duplicate ID Number. Please check your input." });
      }

      // Insert data into MongoDB
      await collection.insertOne(userData);

      res.json({ message: "Data submitted successfully!" });
    } catch (error) {
      console.error("Error:", error);

      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

startServer();