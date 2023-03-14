const request = require("supertest");
const app = require("../src/app");
const Image = require("../src/models/image");
const {defaultImage, setUpDatabase} = require("./fixtures/db");

// beforeEach calls the passed function (like a callback function) 
beforeEach(setUpDatabase);

test("Testing getting image that doesn't exist", async () => {
    await request(app).get("/images/cat_5.jpg").send(defaultImage).expect(404);
});

test("Testing getting image that exists", async () => {
    await request(app).get("/images/cat_3.jpg").send(defaultImage).expect(200);
});
