const express = require("express");
const db = require("../db");
const { NotFoundError } = require("../expressError");

const router = new express.Router();


router.get("/", async (req, res) => {
  let results = await db.query(`SELECT code, name FROM companies;`);
  return res.json({companies: results.rows});
});


router.get("/:code", async (req, res) => {
  let comResult = await db.query(`SELECT code, name, description
                                  FROM companies WHERE code = $1`, [req.params.code]);
  
  let company = comResult.rows[0];
  
  if (!company){
    throw new NotFoundError("Company code was not found");
  }

  let invResult = await db.query(`SELECT id, comp_code, amt, paid, add_date, paid_date
                                    FROM invoices JOIN companies on code = comp_code
                                    WHERE code = $1
                                    ORDER BY id`, [req.params.code]);
  company.invoices = invResult.rows;
  return res.json({company});                       
});


router.post("/", async (req,res) => {
  const { code, name, description } = req.body;

  let result = await db.query(`INSERT INTO companies (code, name, description)
                                VALUES ($1, $2, $3)
                                RETURNING code, name, description`, [code, name, description]);

  return res.status(201).json({company: result.rows[0]});
});


router.put("/:code", async (req, res) => {
  const {name, description} = req.body;

  let result = await db.query(`UPDATE companies
                                SET name=$1,
                                    description=$2
                                WHERE code=$3
                                RETURNING name, description, code`,
                               [name, description, req.params.code]);
  if (!result.rows[0]){
    throw new NotFoundError("Company code was not found");
  }

  return res.json({company: result.rows[0]});
});


router.delete("/:code", async (req, res) =>{
  let result = await db.query(`DELETE from companies WHERE code=$1
                               RETURNING code`,
                 [req.params.code]);
  if(!result.rows[0]){
    throw new NotFoundError("Company code cannot be found");
  }
  
  return res.json({status: "deleted"});
});



module.exports = router;