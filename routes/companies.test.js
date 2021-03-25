const request = require("supertest");

const app = require("../app");

let db = require("../db");

let companies;

let topoChico = {
  code: "topo",
  name: "Topo Chico",
  description: "GREAT mineral water"
}

beforeEach(async function(){
  await db.query(`DELETE FROM companies`);
  await db.query(`DELETE FROM invoices`);
  let result = await db.query(`INSERT INTO companies(code, name, description)
                               VALUES ('apple', 'Apple Computer', 'Maker of OSX.'),
                                      ('ibm', 'IBM', 'Big blue.')
                              RETURNING code, name, description;`);

                              // INSERT INTO invoices (comp_code, amt, paid, paid_date)
                              // VALUES ('apple', 100, FALSE, NULL);
  companies = result.rows;
  console.log(companies);
});

describe("GET /companies", function(){
  test("Get list of companies", async function(){
    const resp = await request(app).get("/companies");
    expect(resp.body).toEqual({companies: companies.map(c => ({code: c.code, name: c.name}))});
    expect(resp.statusCode).toEqual(200);
  })
});


describe("POST /companies", function(){
  test("Add a new company to companies", async function(){
    const resp = await request(app).post("/companies").send(topoChico);
    expect(resp.body).toEqual(({company: topoChico}));
    expect(resp.statusCode).toEqual(201);

    const resp2 = await request(app).get("/companies");
    expect(resp2.body.companies.length).toEqual(3);
  });
});

describe("PUT /companies/:id", function(){
  test("Update a Company", async function(){
    const resp = await request(app).put("/companies/apple").send({name: "betterApple", description: "testtest"});
    expect(resp.body).toEqual(({company: {code: "apple", name: "betterApple", description: "testtest"}}));
    expect(resp.statusCode).toEqual(200);
  });
});


describe("DELETE /companies/:id", function(){
  test("DELETE a Company", async function(){
    const resp = await request(app).delete("/companies/apple");
    expect(resp.body).toEqual({status: "deleted"});
    expect(resp.statusCode).toEqual(200);

    const resp2 = await request(app).get("/companies");
    expect(resp2.body.companies.length).toEqual(1);
  });
});


