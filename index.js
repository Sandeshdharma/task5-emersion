const express = require("express");
const methodOverride = require("method-override");
const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.set("view engine", "ejs");

// In-memory data storage
let vehicles = [];
let currentId = 1;

// Home page: Show vehicle list and add form
app.get("/", (req, res) => {
  res.render("index", { vehicles });
});

// CREATE: Add a new vehicle (via form)
app.post("/vehicles", (req, res) => {
  const { vehicleName, price, image, desc, brand } = req.body;
  const newVehicle = {
    id: currentId++,
    vehicleName,
    price,
    image,
    desc,
    brand,
  };
  vehicles.push(newVehicle);
  res.redirect("/");
});

// READ: Get all vehicles (JSON)
app.get("/vehicles", (req, res) => {
  res.json(vehicles);
});

// READ: Get single vehicle by ID (JSON)
app.get("/vehicles/:id", (req, res) => {
  const vehicle = vehicles.find((v) => v.id === parseInt(req.params.id));
  if (vehicle) {
    res.json(vehicle);
  } else {
    res.status(404).json({ error: "Vehicle not found" });
  }
});

// UPDATE: Update vehicle by ID (JSON)
app.put("/vehicles/:id", (req, res) => {
  const index = vehicles.findIndex((v) => v.id === parseInt(req.params.id));
  if (index !== -1) {
    vehicles[index] = { ...vehicles[index], ...req.body };
    res.json(vehicles[index]);
  } else {
    res.status(404).json({ error: "Vehicle not found" });
  }
});

// DELETE: Delete vehicle by ID
app.delete("/vehicles/:id", (req, res) => {
  const index = vehicles.findIndex((v) => v.id === parseInt(req.params.id));
  if (index !== -1) {
    vehicles.splice(index, 1);
    res.json({ message: "Vehicle deleted" });
  } else {
    res.status(404).json({ error: "Vehicle not found" });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
