const express = require("express");
const { route } = require("../app");
const app = require("../app");
const db = require("../db");

const router = new express.Router();

router.get("/", async (req, res) => {
  let results = await db.query(`SELECT code, name FROM companies;`);
  return res.json({companies: results.rows});
});

router.get("/:code", async (req, res) => {
  let result = await db.query(`SELECT code, name, description
                                  FROM companies WHERE code = $1`, [req.params.code]);
  
  return res.json({company: result.rows[0]});                       
});

router.post("/", async (req,res) => {
  const { code, name, description } = req.body;

  let result = await db.query(`INSERT INTO companies (code, name, description)
                                VALUES ($1, $2, $3)
                                RETURNING code, name, description`, [code, name, description]);

  return res.status(201).json({company: result.rows[0]});

});



module.exports = router;