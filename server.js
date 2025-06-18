const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const cors = require("cors");
const {
  sendOrderConfirmationEmail,
  sendNewOrderToShop,
  sendPassword,
} = require("./sendMail");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const DATA_DIR = path.join(__dirname, "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");
const CART_FILE = path.join(DATA_DIR, "cart.json");

// Helper functions
async function readJson(filePath) {
  const fullPath = path.isAbsolute(filePath)
    ? filePath
    : path.join(__dirname, filePath);
  try {
    const data = await fs.readFile(fullPath, "utf-8");
    if (!data) return []; // Trường hợp file rỗng
    return JSON.parse(data);
  } catch (err) {
    return []; // fallback nếu file hỏng
  }
}

async function writeJson(file, data) {
  try {
    await fs.writeFile(file, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error writing ${file}:`, error);
  }
}

// Send confirm buy mail
app.get("/api/mail", async (req, res) => {
  await sendMailConfirm();
  res.json({ message: "Send email success" });
});

// Get user
app.get("/api/user/:userId", async (req, res) => {
  const users = await readJson(USERS_FILE);
  let user = users.find((user) => user.id === parseInt(req.params.userId));
  if (user) return res.json({ user: user });
  return res.status(400).json({ error: "User not exists" });
});

// Update profile
app.post("/api/update_profile", async (req, res) => {
  const {
    userId,
    firstName,
    lastName,
    email,
    phone,
    formattedDate,
    description,
    password,
  } = req.body;
  const users = await readJson(USERS_FILE);
  let user = users.find((user) => user.id === Number(userId));

  if (user === undefined) {
    return res.status(400).json({ error: "User not exists" });
  }

  user.firstName = firstName;
  user.lastName = lastName;
  user.email = email;
  user.phone = phone;
  user.dateOfBirth = formattedDate;
  user.description = description;
  user.password = password;

  await writeJson(USERS_FILE, users);
  res.json({ message: "Update profile successfully" });
});

// Register
app.post("/api/register", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  const users = await readJson(USERS_FILE);
  if (users.find((user) => user.email === email)) {
    return res.status(400).json({ error: "Email already exists" });
  }

  const newUser = {
    id: users.length + 1,
    firstName: firstName,
    lastName: lastName,
    phone: "",
    password: password,
    email: email,
    description: "",
    dateOfBirth: "",
  };
  users.push(newUser);

  // Initialize cart for new user
  const carts = await readJson(CART_FILE);
  carts.push({ userId: newUser.id, items: [] });

  await writeJson(USERS_FILE, users);
  await writeJson(CART_FILE, carts);
  res.json({ message: "User registered successfully", userId: newUser.id });
});

// Login
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  const users = await readJson(USERS_FILE);
  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  res.json({ user: user });
});

// Forgot password
app.post("/api/user/password", async (req, res) => {
  const { email } = req.body;
  console.log(email);
  const users = await readJson(USERS_FILE);
  const user = users.find((u) => u.email === email);

  if (!user) {
    console.log("Not found user with " + email);
    return res.sendStatus(204); // properly ends response
  }

  console.log(`Send mail forgot password for ${user.email}`);
  sendPassword(user);

  res.status(200).send("Password sent"); // ends response properly
});

// Get all products
app.get("/api/products", async (req, res) => {
  const products = await readJson(PRODUCTS_FILE);
  res.json(products);
});

// Search products
app.get("/api/products/search", async (req, res) => {
  const { query } = req.query;
  const products = await readJson(PRODUCTS_FILE);
  if (!query) return res.json(products);
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(query.toLowerCase())
  );
  res.json(filteredProducts);
});

// Get product follow id
app.get("/api/product/:productId", async (req, res) => {
  const products = await readJson(PRODUCTS_FILE);
  const product = products.find(
    (product) => product.id === parseInt(req.params.productId)
  );
  res.json(product);
});

// Get user cart
app.get("/api/cart/:userId", async (req, res) => {
  const carts = await readJson(CART_FILE);
  const userCart = carts.find(
    (cart) => cart.userId === parseInt(req.params.userId)
  );
  res.json(userCart || { userId: req.params.userId, items: [] });
});

// Add to cart
app.post("/api/cart/:userId", async (req, res) => {
  const { productId, quantity, size, color } = req.body;
  let carts = await readJson(CART_FILE);
  let userCart = carts.find(
    (cart) => cart.userId === parseInt(req.params.userId)
  );

  if (!userCart) {
    userCart = { userId: parseInt(req.params.userId), items: [] };
    carts.push(userCart);
  }

  const products = await readJson(PRODUCTS_FILE);
  const product = products.find((p) => p.id === productId);
  if (
    !product ||
    product.stock < quantity ||
    !product.size.includes(size) ||
    !product.color.includes(color)
  ) {
    return res
      .status(400)
      .json({
        error:
          "Product not available, insufficient stock, or invalid size/color",
      });
  }

  const itemIndex = userCart.items.findIndex(
    (item) =>
      item.productId === productId && item.size === size && item.color === color
  );
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
      quantity,
    });
  }

  product.stock -= quantity;
  await writeJson(PRODUCTS_FILE, products);
  await writeJson(CART_FILE, carts);
  res.json(userCart);
});

// Remove from cart
app.post("/api/cart/:userId/remove", async (req, res) => {
  const { productId, size, color } = req.body;
  let carts = await readJson(CART_FILE);
  let userCart = carts.find(
    (cart) => cart.userId === parseInt(req.params.userId)
  );

  if (!userCart) {
    return res.status(400).json({ error: "Cart not found" });
  }

  const itemIndex = userCart.items.findIndex(
    (item) =>
      item.productId === productId && item.size === size && item.color === color
  );
  if (itemIndex === -1) {
    return res.status(400).json({ error: "Item not found in cart" });
  }

  const item = userCart.items[itemIndex];
  const products = await readJson(PRODUCTS_FILE);
  const product = products.find((p) => p.id === productId);
  if (product) {
    product.stock += item.quantity; // Restore stock
    await writeJson(PRODUCTS_FILE, products);
  }

  userCart.items.splice(itemIndex, 1); // Remove item
  await writeJson(CART_FILE, carts);
  res.json(userCart);
});

// Place order
app.post("/api/orders", async (req, res) => {
  const orders = await readJson(ORDERS_FILE);
  const data = req.body;
  const order = {
    id: orders.length + 1,
    userId: data.userId,
    infor: data.infor,
    items: data.items,
    total: data.total,
    status: "pending",
    date: new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
  };
  orders.push(order);
  sendMailConfirm(order);
  await writeJson(ORDERS_FILE, orders);
  res.json(order);
});

async function sendMailConfirm(order) {
  sendOrderConfirmationEmail(order)
    .then(() => console.log("Đã gửi mail xác nhận cho khách"))
    .catch(console.error);

  sendNewOrderToShop(order)
    .then(() => console.log("Đã gửi mail thông báo cho người bán"))
    .catch(console.error);
}

// Get order history
app.get("/api/orders/:userId", async (req, res) => {
  const orders = await readJson(ORDERS_FILE);
  const userOrders = orders.filter(
    (order) => order.userId == parseInt(req.params.userId)
  );
  res.json(userOrders);
});

// Update status order
app.put("/api/orders/:orderId", async (req, res) => {
  const orders = await readJson(ORDERS_FILE);
  const { status } = req.body;
  const updateOrder = orders.find(
    (order) => order.id === parseInt(req.params.orderId)
  );
  if (!updateOrder) {
    return res.status(400).json({ error: "Order not exists" });
  }
  updateOrder.status = status;
  await writeJson(ORDERS_FILE, orders);
  res.json(updateOrder);
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
