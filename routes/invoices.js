const express = require("express");
const db = require("../db");
const { NotFoundError } = require("../expressError");

const router = new express.Router();


router.get("/", async (req, res) => {
  let results = await db.query(`SELECT id, comp_code FROM invoices;`);
  return res.json({invoices: results.rows});
});


router.get("/:id", async (req, res) => {
  let invResult = await db.query(`SELECT id, amt, paid, add_date, paid_date
                                  FROM invoices WHERE id = $1`, [req.params.id]);
  let invoice = invResult.rows[0];
  if (!invoice){
    throw new NotFoundError("Invoice id was not found");
  }

  let comResult = await db.query(`SELECT code, name, description 
                                    FROM companies JOIN invoices ON comp_code = code
                                    WHERE id = $1`, [req.params.id]);

  invoice.company = comResult.rows[0];
  return res.json({invoice});                       
});


router.post("/", async (req, res) => {
  let result = await db.query(`INSERT INTO invoices (comp_code, amt)
                                VALUES ($1, $2)
                                RETURNING id, comp_code, amt, paid, add_date, paid_date`,
                                [req.body.comp_code, req.body.amt]);

  return res.json({invoice: result.rows[0]});
});


router.put("/:id", async (req, res) => {
  let result = await db.query(`UPDATE invoices
                                SET amt = $1
                                WHERE id = $2
                                RETURNING id, comp_code, amt, paid, add_date, paid_date`,
                                [req.body.amt, req.params.id]);
  if (!result.rows[0]){
    throw new NotFoundError("Invoice id was not found");
  }
  return res.json({invoice: result.rows[0]});
});


router.delete("/:id", async (req, res) => {
  let result = await db.query(`DELETE FROM invoices
                                WHERE id = $1
                                RETURNING id, comp_code, amt, paid, add_date, paid_date`,
                                [req.params.id]);
  if (!result.rows[0]){
    throw new NotFoundError("Invoice id was not found");
  }   

  return res.json({status: "deleted"});                   
});





module.exports = router;