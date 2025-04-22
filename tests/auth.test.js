// const request = require("supertest");
// const mongoose = require("mongoose");
// // const { MongoMemoryServer } = require("mongodb-memory-server");
// const bcrypt = require("bcryptjs");
// const { app } = require("../server"); // Import the app
// const User = require("../models/User");
// const fs = require("fs");

// // let mongoServer;

// beforeAll(async () => {
//   const mongoUri = process.env.MONGO_URI || (fs.existsSync("/run/secrets/mongo_uri") ? fs.readFileSync("/run/secrets/mongo_uri", "utf8").trim() : null);

//   await mongoose
//   .connect(mongoUri)
//   .then(() => console.log("✅ Connected to MongoDB Cloud"))
//   .catch((err) => console.error("❌ MongoDB Connection Failed", err));
// });

// afterAll(async () => {
//   await mongoose.connection.close();
// //   await mongoServer.stop();
// });

// describe("Login Authentication Tests", () => {
//   beforeEach(async () => {
//     await User.deleteMany(); // Clean the DB before each test
//   });

//   it("should login a user with correct credentials", async () => {
//     const hashedPassword = await bcrypt.hash("TestPass123", 10);
//     await User.create({ name: "Login User", email: "login@example.com", password: hashedPassword });

//     const res = await request(app).post("/api/auth/login").send({
//       email: "login@example.com",
//       password: "TestPass123",
//     });

//     expect(res.statusCode).toBe(200);
//     expect(res.body).toHaveProperty("token");
//     expect(res.body).toHaveProperty("userId");
//   });

//   it("should not login with incorrect password", async () => {
//     const hashedPassword = await bcrypt.hash("CorrectPass", 10);
//     await User.create({ name: "Wrong Password User", email: "wrongpass@example.com", password: hashedPassword });

//     const res = await request(app).post("/api/auth/login").send({
//       email: "wrongpass@example.com",
//       password: "WrongPass",
//     });

//     expect(res.statusCode).toBe(400);
//     expect(res.body).toHaveProperty("message", "Invalid email or password");
//   });

//   it("should not login a non-existent user", async () => {
//     const res = await request(app).post("/api/auth/login").send({
//       email: "nonexistent@example.com",
//       password: "SomePassword",
//     });

//     expect(res.statusCode).toBe(400);
//     expect(res.body).toHaveProperty("message", "Invalid email or password");
//   });
// });
