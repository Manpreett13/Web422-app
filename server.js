/********************************************************************************
 *  WEB422 – Assignment 1
 *
 *  I declare that this assignment is my own work in accordance with Seneca's
 *  Academic Integrity Policy:
 *
 *  https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
 *
 *  Name: Manpreet Singh    Student ID: 149578239   Date: May 16, 2025
 *  Published URL on Vercel:
 *  https://web422-one-umber.vercel.app/
 ********************************************************************************/

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const SitesDB = require("./modules/sitesDB.js");
const db = new SitesDB();

const app = express();
const HTTP_PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "API Listening",
    term: "Summer 2025",
    student: "Manpreet Singh",
  });
});

// POST
app.post("/api/sites", (req, res) => {
  db.addNewSite(req.body)
    .then((data) => {
      res.status(201).json(data);
    })
    .catch((err) => {
      res.status(500).json({ message: err.message });
    });
});

// GET  All sites
app.get("/api/sites", (req, res) => {
  const { page, perPage, name, region, provinceOrTerritoryName } = req.query;
  db.getAllSites(
    parseInt(page),
    parseInt(perPage),
    name,
    region,
    provinceOrTerritoryName
  )
    .then((data) => res.json(data))
    .catch((err) => res.status(500).json({ message: err.message }));
});

// GET
app.get("/api/sites/:id", (req, res) => {
  db.getSiteById(req.params.id)
    .then((site) => {
      if (site) {
        res.json(site);
      } else {
        res.status(404).json({ message: "Site not found" });
      }
    })
    .catch((err) => {
      res.status(500).json({ message: err.message });
    });
});

// PUT
app.put("/api/sites/:id", (req, res) => {
  db.updateSiteById(req.body, req.params.id)
    .then(() => {
      res.status(204).end();
    })
    .catch((err) => {
      res.status(500).json({ message: err.message });
    });
});

// DELETE
app.delete("/api/sites/:id", (req, res) => {
  db.deleteSiteById(req.params.id)
    .then(() => {
      res.status(204).end();
    })
    .catch((err) => {
      res.status(500).json({ message: err.message });
    });
});

let initialized = false;

async function initializeDB() {
  if (!initialized) {
    console.log("Connection string:", process.env.MONGODB_CONN_STRING);
    await db.initialize(process.env.MONGODB_CONN_STRING);
    initialized = true;
  }
}
if (require.main === module) {
  initializeDB()
    .then(() => {
      app.listen(HTTP_PORT, () => {
        console.log(`Server listening on port ${HTTP_PORT}`);
      });
    })
    .catch((err) => {
      console.error("Failed to initialize DB:", err);
    });
} else {
  module.exports = async (req, res) => {
    try {
      await initializeDB();
      app(req, res);
    } catch (err) {
      res.status(500).json({
        message: "Database initialization failed",
        error: err.message,
      });
    }
  };
}
