let userId = null;
const apiUrl = "/api";
let cartItems = [];

async function getProducts() {
  const response = await fetch(`${apiUrl}/products`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  const result = await response.json();
  if (response.ok) {
    return result;
  }
  return null;
}

// Load products
async function loadProducts(query = "") {
  // const url = query ? `${apiUrl}/products/search?query=${encodeURIComponent(query)}` : `${apiUrl}/products`;
  // const response = await fetch(url);
  // const products = await response.json();
  // const productsDiv = document.getElementById('products');
  // productsDiv.innerHTML = products.map(product => `
  //   <div class="product">
  //     <h3>${product.name}</h3>
  //     <p>Price: ${product.price} VND</p>
  //     <p>Pet Type: ${product.pet_type}</p>
  //     <p>Material: ${product.material}</p>
  //     <p>Stock: ${product.stock}</p>
  //     <img src="${product.imgUrl}" alt="${product.name}" style="max-width: 100px;">
  //     <div>
  //       <label>Size: </label>
  //       <select id="size-${product.id}">
  //         ${product.size.map(size => `<option value="${size}">${size}</option>`).join('')}
  //       </select>
  //     </div>
  //     <div>
  //       <label>Color: </label>
  //       <select id="color-${product.id}">
  //         ${product.color.map(color => `<option value="${color}">${color}</option>`).join('')}
  //       </select>
  //     </div>
  //     <button onclick="addToCart(${product.id})" ${!userId ? 'disabled' : ''}>Add to Cart</button>
  //   </div>
  // `).join('');
}
async function getCartItems() {
  cartItems = getCookieObject("cart_items");
}

// Load cart
async function loadCart() {
  getCartItems();
  if (!cartItems) return;
  const cartDiv = document.getElementById("cart-item");
  const totalCartDiv = document.getElementById("cart-subtotal");
  const sizeCartDiv = document.getElementById("cart-size");
  let total = cartItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  totalCartDiv.textContent = formatCurrencyVND(total);
  sizeCartDiv.textContent = cartItems.length;
  cartDiv.innerHTML = cartItems
    ?.map(
      (item) => `
                                <!-- Cart Item -->
                                <div class="flex items-center gap-3">
                                    <img src="${item.imgUrl}"
                                        alt="Blue Winter Sweater" class="w-16 h-16 object-cover rounded" />
                                    <div class="flex-1">
                                        <h4 class="text-sm font-medium">${
                                          item.name
                                        }</h4>
                                        <div class="text-gray-500 text-xs mt-1">
                                            Size:
                                            <select  onchange="setSize(this, ${item.id})" class="text-xs bg-transparent focus:outline-none ml-1">
                                                ${(item.size || [])
                                                  .map(
                                                    (size) =>
                                                      `<option value="${size}" 
                                                        ${size === item.selectedSize ? "selected" : ""}
                                                      >${size}</option>`
                                                  )
                                                  .join("")}
                                            </select>
                                        </div>
                                        <div class="flex items-center justify-between mt-1">
                                            <span class="text-sm font-semibold">${formatCurrencyVND(
                                              item.price
                                            )}</span>
                                            <div class="flex items-center gap-2">
                                                <button onclick="setQuantity(${item.id},false)"
                                                   class="text-gray-400 hover:text-primary">
                                                    <i class="ri-subtract-line"></i>
                                                </button>
                                                <span id="cart-quantity-${item.id}" class="text-sm">${item.quantity}</span>
                                                <button onclick="setQuantity(${item.id},true)" 
                                                    class="text-gray-400 hover:text-primary">
                                                    <i class="ri-add-line"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <button class="text-gray-400 hover:text-red-500" 
                                      onclick="removeFromCart(${item.id})">
                                        <i class="ri-close-line"></i>
                                    </button>
                                </div>
    
  `
    )
    .join("");
}

// Load orders
async function loadOrders() {
  if (!userId) return;
  const response = await fetch(`${apiUrl}/orders/${userId}`);
  const orders = await response.json();
  const ordersDiv = document.getElementById("orders");
  ordersDiv.innerHTML = orders
    .map(
      (order) => `
    <div class="order">
      <p>Order ID: ${order.id}</p>
      <p>Total: ${order.total} VND</p>
      <p>Date: ${new Date(order.date).toLocaleString()}</p>
      <div>
        ${order.items
          .map(
            (item) => `
          <p>${item.name} (Size: ${item.size}, Color: ${item.color}, Quantity: ${item.quantity})</p>
        `
          )
          .join("")}
      </div>
    </div>
  `
    )
    .join("");
}

// Register
async function register(firstName, lastName, email, password) {
  const response = await fetch(`${apiUrl}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ firstName, lastName, email, password }),
  });
  const result = await response.json();
  alert(result.message || result.error);
  if (response.ok) showLogin();
}

// Login
async function login(email, password) {
  const response = await fetch(`${apiUrl}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const result = await response.json();
  if (response.ok) {
    const user = result.user;
    localStorage.setItem("userId", user.id);
    setActionLogin();
    setProfile();

    loadCart();
    loadOrders();
  } else {
    alert(result.error);
  }
}

async function setProfile() {
  const response = await fetch(
    `${apiUrl}/user/${localStorage.getItem("userId")}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );
  const result = await response.json();
  if (!response.ok) {
    return;
  }

  const user = result.user;
  
  // Convert to YYYY-MM-DD format
  const rawDate = new Date(user.dateOfBirth);
  const formattedDate = rawDate.toISOString().split("T")[0]; // "2025-06-10"

  document.getElementById(
    "profile-fullname"
  ).textContent = `${user.firstName} ${user.lastName}`;
  document.getElementById("profile-icon-mail").textContent = user.email;
  document.getElementById(
    "profile-icon-fullname"
  ).textContent = `${user.firstName} ${user.lastName}`;
  document.getElementById("profile-icon-icon-mail").textContent = user.email;
  document.getElementById("profile-firstName").value = user.firstName;
  document.getElementById("profile-lastName").value = user.lastName;
  document.getElementById("profile-email").value = user.email;
  document.getElementById("profile-phone").value = user.phone;
  document.getElementById("profile-dateOfBirth").value = formattedDate;
  document.getElementById("profile-description").value = user.description;
}

async function updateProfile(
  firstName,
  lastName,
  email,
  phone,
  formattedDate,
  description
) {
  
  const response = await fetch(`${apiUrl}/update_profile`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      firstName,
      lastName,
      email,
      phone,
      formattedDate,
      description,
    }),
  });
  const result = await response.json();
  alert(result.error);
  if (response.ok) return;
}

// Logout
function logout() {
  userId = null;
  localStorage.removeItem("userId");
}

// Show login form
function showLogin() {
  const signInLink = document.getElementById("signInLink");
  signInLink.click();
}

// Show register form
function showRegister() {
  const signUpLink = document.getElementById("signUpLink");
  signUpLink.click();
}

// Search products
function searchProducts() {
  const query = document.getElementById("search-input").value;
  loadProducts(query);
}

// Add to cart
async function addToCart(productId) {
  // const size = document.getElementById(`size-${productId}`).value;
  // const color = document.getElementById(`color-${productId}`).value;
  const response = await fetch(`${apiUrl}/product/${productId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  const result = await response.json();
  cartItems = getCookieObject("cart_items") || [];
  const existItem = cartItems?.find(
    (item) => item.productId == result.productId && item.size == result.size
  );
  if (existItem) {
    existItem.quantity++;
  } else {
    let idNumber = Math.max(...cartItems.map(item => item.id)) ?? 0;
    cartItems.push({
      id: idNumber + 1,
      productId: productId,
      name: result.name,
      size: result.size,
      imgUrl: result.imgUrl,
      price: result.price,
      quantity: 1,
      selectedSize: result.size[0]
    });
  }
  setCookieObject("cart_items", cartItems, 7);

  loadCart();
}

// Remove from cart
async function removeFromCart(id) {
  cartItems = getCookieObject("cart_items");
  cartItems = cartItems.filter(
    (item) => item.id != id);
  setCookieObject("cart_items", cartItems, 7);
  loadCart();
}

// Place order
async function placeOrder() {
  if (!userId) return alert("Please login first");
  await fetch(`${apiUrl}/orders/${userId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  loadOrders();
}

function setActionLogin() {
  const isLogged = localStorage.getItem("userId") != null;
  document.getElementById("signInLink").style.display = isLogged
    ? "none"
    : "block";
  document.getElementById("myOrdersLink").style.display = isLogged
    ? "block"
    : "none";
  document.getElementById("signUpLink").style.display = isLogged
    ? "none"
    : "block";
  document.getElementById("myProfileLink").style.display = isLogged
    ? "block"
    : "none";
  document.getElementById("LogoutLink").style.display = isLogged
    ? "block"
    : "none";
}

// Format currency in VietNamese
function formatCurrencyVND(amount) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

function setCookieObject(name, obj, days) {
  const json = JSON.stringify(obj);
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = "expires=" + d.toUTCString();
  document.cookie = `${name}=${encodeURIComponent(json)}; ${expires}; path=/`;
}

function getCookieObject(name) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let c of ca) {
    c = c.trim();
    if (c.indexOf(nameEQ) === 0) {
      const value = c.substring(nameEQ.length);
      try {
        return JSON.parse(decodeURIComponent(value));
      } catch (e) {
        return null;
      }
    }
  }
  return null;
}

function setQuantity(id, isIncrease){
  const min = 0;
  const max = 101;
  const quantityElement = document.getElementById("cart-quantity-"+id);
  let quantity = Number(quantityElement.textContent);
  
  quantity = isIncrease ? ++quantity : --quantity;
  if(quantity == min || quantity == max) return;
  quantityElement.textContent = quantity;
  const carts = getCookieObject("cart_items");
  //debugger
  const cart = carts.find(item => item.id === id);
  if(cart){
    cart.quantity = quantity;
    setCookieObject("cart_items",carts,7);
    loadCart();
  }
}

function setSize(element, id){
  const carts = getCookieObject("cart_items");
  const cart = carts.find(item => item.id === id);
  if(cart){
    cart.selectedSize = element.value;
    //debugger
    setCookieObject("cart_items",carts,7);
  }
}

// function findCartById(id){
//   const carts = getCartItems("cart_items");
//   return carts.find(item => item.id === id);
// }

// Initialize
function init() {
  userId = localStorage.getItem("userId");
  if (userId) {
    loadOrders();
  }
  loadCart();
  setProfile();
  setActionLogin();

  loadProducts();
}

init();
