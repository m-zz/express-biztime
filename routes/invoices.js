const express = require("express");
const db = require("../db");
const { NotFoundError } = require("../expressError");

const router = new express.Router();

router.get("/", async (req, res) => {
  let results = await db.query(`SELECT id, comp_code FROM invoices;`);
  return res.json({invoices: results.rows});
});

router.get("/:id", async (req, res) => {
  let result = await db.query(`SELECT code, name, description
                                  FROM companies WHERE code = $1`, [req.params.code]);
  if (!result.rows[0]){
    throw new NotFoundError("Company code was not found");
  }
  return res.json({company: result.rows[0]});                       
});




module.exports = router;