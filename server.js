const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const CART_FILE = path.join(DATA_DIR, 'cart.json');

// Helper functions
async function readJson(file) {
  try {
    const data = await fs.readFile(file, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${file}:`, error);
    return [];
  }
}

async function writeJson(file, data) {
  try {
    await fs.writeFile(file, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error writing ${file}:`, error);
  }
}

// Get user
app.get('/api/user/:userId', async (req, res) => {
  const users = await readJson(USERS_FILE);
  let user = users.find(user => user.id === parseInt(req.params.userId));
  if (user) return res.json({user: user});
  return res.status(400).json({ error: 'User not exists' }); 
});

// Update profile
app.post('/api/update_profile', async (req, res) => {
  const { userId, firstName, lastName, email, phone, formattedDate, description } = req.body;
  const users = await readJson(USERS_FILE);
  let user = users.find(user => user.id === Number(userId));
  if (user === undefined) {
    return res.status(400).json({ error: 'User not exists' });
  }

  user.firstName = firstName;
  user.lastName = lastName;
  user.email = email;
  user.phone = phone;
  user.formattedDate = formattedDate;
  user.description = description;

  await writeJson(USERS_FILE, users);
  res.json({ message: 'Update profile successfully'});
});

// Register
app.post('/api/register', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  const users = await readJson(USERS_FILE);
  if (users.find(user => user.email === email)) {
    return res.status(400).json({ error: 'Email already exists' });
  }

  const newUser = {
    id: users.length + 1,
    firstName: firstName,
    lastName: lastName,
    phone: "",
    password: password,
    email: email,
    description: "",
    dateOfBirth: ""
  };
  users.push(newUser);

  // Initialize cart for new user
  const carts = await readJson(CART_FILE);
  carts.push({ userId: newUser.id, items: [] });

  await writeJson(USERS_FILE, users);
  await writeJson(CART_FILE, carts);
  res.json({ message: 'User registered successfully', userId: newUser.id });
});

// Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const users = await readJson(USERS_FILE);
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  res.json({ user: user });
});

// Get all products
app.get('/api/products', async (req, res) => {
  const products = await readJson(PRODUCTS_FILE);
  res.json(products);
});

// Search products
app.get('/api/products/search', async (req, res) => {
  const { query } = req.query;
  const products = await readJson(PRODUCTS_FILE);
  if (!query) return res.json(products);
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(query.toLowerCase())
  );
  res.json(filteredProducts);
});

// Get product follow id
app.get('/api/product/:productId', async (req, res) => {
  const products = await readJson(PRODUCTS_FILE);
  const product = products.find(product =>
  product.id === parseInt(req.params.productId));
  res.json(product);
});

// Get user cart
app.get('/api/cart/:userId', async (req, res) => {
  const carts = await readJson(CART_FILE);
  const userCart = carts.find(cart => cart.userId === parseInt(req.params.userId));
  res.json(userCart || { userId: req.params.userId, items: [] });
});

// Add to cart
app.post('/api/cart/:userId', async (req, res) => {
  const { productId, quantity, size, color } = req.body;
  let carts = await readJson(CART_FILE);
  let userCart = carts.find(cart => cart.userId === parseInt(req.params.userId));

  if (!userCart) {
    userCart = { userId: parseInt(req.params.userId), items: [] };
    carts.push(userCart);
  }

  const products = await readJson(PRODUCTS_FILE);
  const product = products.find(p => p.id === productId);
  if (!product || product.stock < quantity || !product.size.includes(size) || !product.color.includes(color)) {
    return res.status(400).json({ error: 'Product not available, insufficient stock, or invalid size/color' });
  }

  const itemIndex = userCart.items.findIndex(item => item.productId === productId && item.size === size && item.color === color);
  if (itemIndex > -1) {
    userCart.items[itemIndex].quantity += quantity;
  } else {
    userCart.items.push({
      productId,
      name: product.name,
      pet_type: product.pet_type,
      size,
      color,
      material: product.material,
      imgUrl: product.imgUrl,
      price: product.price,
      quantity
    });
  }

  product.stock -= quantity;
  await writeJson(PRODUCTS_FILE, products);
  await writeJson(CART_FILE, carts);
  res.json(userCart);
});

// Remove from cart
app.post('/api/cart/:userId/remove', async (req, res) => {
  const { productId, size, color } = req.body;
  let carts = await readJson(CART_FILE);
  let userCart = carts.find(cart => cart.userId === parseInt(req.params.userId));

  if (!userCart) {
    return res.status(400).json({ error: 'Cart not found' });
  }

  const itemIndex = userCart.items.findIndex(item => 
    item.productId === productId && item.size === size && item.color === color
  );
  if (itemIndex === -1) {
    return res.status(400).json({ error: 'Item not found in cart' });
  }

  const item = userCart.items[itemIndex];
  const products = await readJson(PRODUCTS_FILE);
  const product = products.find(p => p.id === productId);
  if (product) {
    product.stock += item.quantity; // Restore stock
    await writeJson(PRODUCTS_FILE, products);
  }

  userCart.items.splice(itemIndex, 1); // Remove item
  await writeJson(CART_FILE, carts);
  res.json(userCart);
});

// Place order
app.post('/api/orders/:userId', async (req, res) => {
  const carts = await readJson(CART_FILE);
  const userCart = carts.find(cart => cart.userId === parseInt(req.params.userId));
  if (!userCart || userCart.items.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }

  const orders = await readJson(ORDERS_FILE);
  const order = {
    id: orders.length + 1,
    userId: parseInt(req.params.userId),
    items: userCart.items,
    total: await calculateTotal(userCart.items),
    date: new Date().toISOString()
  };

  orders.push(order);
  userCart.items = []; // Clear cart
  await writeJson(ORDERS_FILE, orders);
  await writeJson(CART_FILE, carts);
  res.json(order);
});

// Get order history
app.get('/api/orders/:userId', async (req, res) => {
  const orders = await readJson(ORDERS_FILE);
  const userOrders = orders.filter(order => order.userId === parseInt(req.params.userId));
  res.json(userOrders);
});

// Helper to calculate total
async function calculateTotal(items) {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});