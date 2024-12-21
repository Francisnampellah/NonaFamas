const express = require('express');
const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');

dotenv.config();
const prisma = new PrismaClient();
const app = express();

app.use(express.json());

// Get all medicines
app.get('/medicines', async (req, res) => {
  const medicines = await prisma.medicine.findMany();
  res.json(medicines);
});

// Add a new medicine
app.post('/medicines', async (req, res) => {
  const { name, price, quantity } = req.body;
  const newMedicine = await prisma.medicine.create({
    data: { name, price, quantity },
  });
  res.json(newMedicine);
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
