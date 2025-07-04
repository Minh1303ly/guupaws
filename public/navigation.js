document.addEventListener("DOMContentLoaded", async function () {
  await fetch("modal.html") // Adjust path if needed
    .then((response) => response.text())
    .then((html) => {
      const wrapper = document.createElement("div");
      wrapper.innerHTML = html;
      document.body.appendChild(wrapper);
    })
    .catch((error) => {
      console.error("Error loading footer:", error);
    });

  const signInLink = document.getElementById("signInLink");
  const myOrdersLink = document.getElementById("myOrdersLink");
  const signUpLink = document.getElementById("signUpLink");
  const myProfileLink = document.getElementById("myProfileLink");
  const LogoutLink = document.getElementById("LogoutLink");
  const forgotLink = document.getElementById("forgotLink");
  // Modal
  const signInModal = document.getElementById("signInModal");
  const myOrdersModal = document.getElementById("myOrdersModal");
  const signUpModal = document.getElementById("signUpModal");
  const myProfileModal = document.getElementById("myProfileModal");
  const closeButtons = document.querySelectorAll(".closeModal");
  const modals = [signInModal, myOrdersModal, signUpModal, myProfileModal];
  const switchToSignIn = document.getElementById("switchToSignIn");
  const switchToSignUp = document.getElementById("switchToSignUp");
  const forgotModal = document.getElementById("forgotModal");
  function openModal(modal) {
    modal.classList.remove("hidden");
    setTimeout(() => {
      const modalContent = modal.querySelector(".transform");
      modalContent.classList.remove("scale-95", "opacity-0");
      modalContent.classList.add("scale-100", "opacity-100");
    }, 10);
  }
  function closeModal(modal) {
    const modalContent = modal.querySelector(".transform");
    modalContent.classList.remove("scale-100", "opacity-100");
    modalContent.classList.add("scale-95", "opacity-0");
    setTimeout(() => {
      modal.classList.add("hidden");
    }, 300);
  }
  signInLink.addEventListener("click", (e) => {
    e.preventDefault();
    openModal(signInModal);
  });
  myOrdersLink.addEventListener("click", (e) => {
    e.preventDefault();
    openModal(myOrdersModal);
  });
  signUpLink.addEventListener("click", (e) => {
    e.preventDefault();
    openModal(signUpModal);
  });

  myProfileLink.addEventListener("click", (e) => {
    e.preventDefault();
    setProfile();
    openModal(myProfileModal);
  });
  forgotLink.addEventListener("click", (e) => {
    e.preventDefault();
    closeModal(signInModal);
    openModal(forgotModal);
  });
  switchToSignIn.addEventListener("click", (e) => {
    e.preventDefault();
    closeModal(signUpModal);
    openModal(signInModal);
  });
  LogoutLink.addEventListener("click", (e) => {
    e.preventDefault();
    logout();
    location.reload();
  });
  switchToSignUp.addEventListener("click", (e) => {
    e.preventDefault();
    closeModal(signInModal);
    openModal(signUpModal);
  });
  const createAccountForm = document.getElementById("createAccountForm");
  const forgotForm = document.getElementById("forgotPassForm");

  forgotForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("forgot-email").value;
    const response = await fetch(`/api/user/password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email }),
    });

    const message = document.getElementById("message-forgot");
    console.log(JSON.stringify(response));
    if (response.status == 204) {
      message.classList.remove("hidden");
      message.textContent =
        "Tài khoản này không tồn tại. Vui lòng đăng kí tài khoản!";
      return;
    }
    const submitBtn = forgotForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    setTimeout(() => {
      submitBtn.disabled = false;
    }, 30000);

    message.classList.remove("hidden");
    message.textContent =
      "📩 Vui lòng kiểm tra email của bạn để lấy mật khẩu mới! Có thể gửi lại sau 30s!";
  });

  createAccountForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const firstName = document.getElementById("firstName").value;
    const lastName = document.getElementById("lastName").value;
    const email = document.getElementById("newEmail").value;
    const password = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    if (password !== confirmPassword) {
      const notification = document.createElement("div");
      notification.className =
        "fixed top-20 right-4 bg-white shadow-lg rounded-lg p-4 z-50 transform translate-x-full opacity-0 transition-all duration-500";
      notification.innerHTML = `
            <div class="flex items-center">
            <div class="w-8 h-8 flex items-center justify-center bg-red-100 rounded-full mr-3">
            <i class="ri-error-warning-line text-red-500"></i>
            </div>
            <div>
            <p class="font-medium text-gray-800">Mật khẩu không khớp</p>
            <p class="text-sm text-gray-600">Vui lòng thử lại</p>
            </div>
            </div>
            `;
      document.body.appendChild(notification);
      setTimeout(() => {
        notification.classList.remove("translate-x-full", "opacity-0");
      }, 100);
      setTimeout(() => {
        notification.classList.add("translate-x-full", "opacity-0");
        setTimeout(() => {
          notification.remove();
        }, 500);
      }, 3000);
      return;
    }
    if (firstName && lastName && email && password) {
      if (!(await register(firstName, lastName, email, password))) {
        document.getElementById("signup-message").textContent =
          "Email đã tồn tại!";
        return;
      }
      showLogin();
      const notification = document.createElement("div");
      notification.className =
        "fixed top-20 right-4 bg-white shadow-lg rounded-lg p-4 z-50 transform translate-x-full opacity-0 transition-all duration-500";
      notification.innerHTML = `
                <div class="flex items-center">
                <div class="w-8 h-8 flex items-center justify-center bg-primary/20 rounded-full mr-3">
                <i class="ri-check-line text-primary"></i>
                </div>
                <div>
                <p class="font-medium text-gray-800">Chào mừng đến với GuuPawz!</p>
                <p class="text-sm text-gray-600">Tạo tài khoản thành công</p>
                </div>
                </div>
                `;
      document.body.appendChild(notification);
      setTimeout(() => {
        notification.classList.remove("translate-x-full", "opacity-0");
      }, 100);
      setTimeout(() => {
        notification.classList.add("translate-x-full", "opacity-0");
        setTimeout(() => {
          notification.remove();
        }, 500);
      }, 3000);
      closeModal(signUpModal);
    }
  });
  const profileForm = document.getElementById("profileForm");
  profileForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const firstName = document.getElementById("profile-firstName").value;
    const lastName = document.getElementById("profile-lastName").value;
    const email = document.getElementById("profile-email").value;
    const phone = document.getElementById("profile-phone").value;
    const formattedDate = document.getElementById("profile-dateOfBirth").value;
    const description = document.getElementById("profile-description").value;
    const password = document.getElementById("profile-password").value;

    const isUpdated = updateProfile(
      firstName,
      lastName,
      email,
      phone,
      formattedDate,
      description,
      password
    );
    if (!isUpdated) return;
    closeModal(myProfileModal);

    const notification = document.createElement("div");
    notification.className =
      "fixed top-20 right-4 bg-white shadow-lg rounded-lg p-4 z-50 transform translate-x-full opacity-0 transition-all duration-500";
    notification.innerHTML = `
                    <div class="flex items-center">
                    <div class="w-8 h-8 flex items-center justify-center bg-primary/20 rounded-full mr-3">
                    <i class="ri-check-line text-primary"></i>
                    </div>
                    <div>
                    <p class="font-medium text-gray-800">Cập nhật hồ sơ cá nhân</p>
                    <p class="text-sm text-gray-600">Sửa đổi của bạn đã được cập nhật!</p>
                    </div>
                    </div>
                    `;
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.classList.remove("translate-x-full", "opacity-0");
    }, 100);
    setTimeout(() => {
      notification.classList.add("translate-x-full", "opacity-0");
      setTimeout(() => {
        notification.remove();
      }, 500);
    }, 3000);
  });

  closeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const modal = button.closest(".fixed.inset-0");
      closeModal(modal.parentElement);
    });
  });

  modals.forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if ([...modal.childNodes].includes(e.target)) {
        closeModal(modal);
      }
    });
  });

  const signInForm = document.getElementById("signInForm");
  signInForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("password").value;
    if (email && password) {
      if (!(await login(email, password))) return;
      const notification = document.createElement("div");
      notification.className =
        "fixed top-20 right-4 bg-white shadow-lg rounded-lg p-4 z-50 transform translate-x-full opacity-0 transition-all duration-500";
      notification.innerHTML = `
            <div class="flex items-center">
            <div class="w-8 h-8 flex items-center justify-center bg-primary/20 rounded-full mr-3">
            <i class="ri-check-line text-primary"></i>
            </div>
            <div>
            <p class="font-medium text-gray-800">Chào mừng bạn đến với GuuPawz!</p>
            <p class="text-sm text-gray-600">Đăng nhập thành công</p>
            </div>
            </div>
            `;
      document.body.appendChild(notification);
      setTimeout(() => {
        notification.classList.remove("translate-x-full", "opacity-0");
      }, 100);
      setTimeout(() => {
        notification.classList.add("translate-x-full", "opacity-0");
        setTimeout(() => {
          notification.remove();
        }, 500);
      }, 3000);
      closeModal(signInModal);
    }
  });

  // Handle search feature
  const input = document.getElementById("search-input");
  const icon = document.getElementById("search-icon");

  input.addEventListener("input", () => {
    if (input.value.trim() !== "") {
      icon.classList.remove("left-3");
      icon.classList.add("right-3", "left-auto");
    } else {
      icon.classList.remove("right-3", "left-auto");
      icon.classList.add("left-3");
    }
  });

  icon.addEventListener("click", () => {
    location.href = "shop.html";
  });

  //load featured product
  loadOrders();
  init();
});

// Load orders
async function loadOrders() {
  userId = localStorage.getItem("userId");
  if (!userId) return;
  const response = await fetch(`/api/orders/${userId}`);
  const orders = await response.json();
  const ordersDiv = document.getElementById("orders");
  if (!ordersDiv || orders.length == 0) return;
  const itemOrders = orders
    .flatMap((aa) =>
      JSON.parse(aa.items)?.map((n) => ({
        id: aa.id,
        item: n,
        date: aa.date,
        status: aa.status,
      }))
    )
    .sort((a, b) => b.id - a.id);
  ordersDiv.innerHTML = itemOrders
    ?.map(
      (order) => `
    <div class="bg-white rounded-lg border p-6">
                                <div class="flex justify-between items-start mb-4">
                                    <div>
                                        <div class="flex items-center gap-3 mb-2">
                                            <span class="text-sm font-medium text-gray-500">Đơn hàng #${
                                              order.id
                                            }</span>
                                            <span
                                                class="px-2 py-1 text-xs font-medium ${getHtmlStatus(
                                                  order?.status
                                                )} rounded-full">${getValueStatus(
        order?.status
      )}</span>
                                        </div>
                                        <p class="text-sm text-gray-500">Đặt hàng lúc ${
                                          order.date
                                        }</p>
                                    </div>                                   
                                </div>
                                <div class="flex items-center gap-4">
                                    <img src="${order.item.imgUrl[0]}"
                                        alt="Product" class="w-20 h-20 object-cover rounded-lg">
                                    <div>
                                        <h3 class="font-medium text-gray-800">${
                                          order.item.name
                                        }</h3>
                                        <p class="text-sm text-gray-500">Size: ${
                                          order.item.selectedSize
                                        }</p>
                                        <p class="text-sm font-medium text-gray-800 mt-1">${formatCurrencyVND(
                                          order.item.price
                                        )} x ${order.item.quantity}</p>
                                    </div>
                                </div>
                            </div>
  `
    )
    .join("");
}

function getHtmlStatus(status) {
  const statusValue = {
    delivered: "text-green-700 bg-green-100",
    pending: "text-blue-700 bg-blue-100",
    return: "text-gray-700 bg-red-100",
    cancel: "text-gray-700 bg-gray-100",
  };
  return statusValue[status];
}

function getValueStatus(status) {
  const statusValue = {
    delivered: "Đã giao",
    pending: "Đang giao",
    return: "Trả hàng",
    cancel: "Đã hủy",
  };
  return statusValue[status];
}

async function getProducts() {
  const response = await fetch(`/api/products`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  const result = await response.json();
  if (response.ok) {
    return result;
  }
  return null;
}

function loadCheckoutPage() {
  const carts = getCookieObject("cart_items");
  if (carts.length > 0) {
    location.href = "checkout.html";
  }
}

let userId = null;
const apiUrl = "/api";
let cartItems = [];

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
  let total = cartItems.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );
  totalCartDiv.textContent = formatCurrencyVND(total);
  sizeCartDiv.textContent = cartItems.length;
  cartDiv.innerHTML = cartItems
    ?.map(
      (item) => `
                                <!-- Cart Item -->
                                <div class="flex items-center gap-3">
                                    <img src="${item.imgUrl[0]}"
                                        alt="Blue Winter Sweater" class="w-16 h-16 object-cover rounded" />
                                    <div class="flex-1">
                                        <h4 class="text-sm font-medium">${
                                          item.name
                                        }</h4>
                                        <div class="text-gray-500 text-xs mt-1">
                                            Kích cỡ:
                                            <select  onchange="setSize(this, ${
                                              item.id
                                            })" class="text-xs bg-transparent focus:outline-none ml-1">
                                                ${(item.size || [])
                                                  .map(
                                                    (size) =>
                                                      `<option value="${size}" 
                                                        ${
                                                          size ===
                                                          item.selectedSize
                                                            ? "selected"
                                                            : ""
                                                        }
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
                                                <button onclick="setQuantity(${
                                                  item.id
                                                },false)"
                                                   class="text-gray-400 hover:text-primary">
                                                    <i class="ri-subtract-line"></i>
                                                </button>
                                                <span id="cart-quantity-${
                                                  item.id
                                                }" class="text-sm">${
        item.quantity
      }</span>
                                                <button onclick="setQuantity(${
                                                  item.id
                                                },true)" 
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

// Register
async function register(firstName, lastName, email, password) {
  const response = await fetch(`${apiUrl}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ firstName, lastName, email, password }),
  });
  //const result = await response.json();
  if (response.ok) return true;
  return false;
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
    return true;
  }

  document.getElementById("login-message").textContent =
    "Tài khoản hoặc mặt khẩu không đúng!";
  return false;
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

  document.getElementById("profile-fullname").textContent =
    user?.firstName + " " + user?.lastName;
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
  document.getElementById("profile-password").value = user.password;
}

async function updateProfile(
  firstName,
  lastName,
  email,
  phone,
  formattedDate,
  description,
  password
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
      password,
    }),
  });
  const result = await response.json();
  if (response.ok) return true;
  alert(result.error);
  return false;
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
    let idNumber = cartItems.reduce((max, item) => Math.max(max, item.id), 0);
    cartItems.push({
      id: idNumber + 1,
      productId: productId,
      name: result.name,
      size: result.size,
      imgUrl: result.imgUrl,
      price: result.price,
      quantity: 1,
      selectedSize: result.size[0],
    });
  }
  notification("Sản phẩm đã nằm trong giỏ hàng🎉", "Hãy mở giỏ hàng để xem!");
  setCookieObject("cart_items", cartItems, 7);

  loadCart();
}

// Remove from cart
async function removeFromCart(id) {
  Swal.fire({
    title: "🐾 Bạn chắc chắn muốn xoá?",
    text: "Hành động này không thể hoàn tác đâu đó nha!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Vâng, xoá đi! 🗑️",
    cancelButtonText: "Huỷ nè 💞",
    background: "#fff0f5",
    customClass: {
      popup: "cute-popup",
      confirmButton: "cute-confirm-button",
      cancelButton: "cute-cancel-button",
    },
  }).then((result) => {
    if (result.isConfirmed) {
      // Hành động xoá thật sự ở đây
      // Swal.fire({
      //   title: 'Đã xoá!',
      //   text: 'Dữ liệu đã bay màu 🐶💨',
      //   icon: 'success',
      //   background: '#fff0f5',
      //   confirmButtonText: 'OK 💖',
      //   customClass: {
      //     popup: 'cute-popup',
      //     confirmButton: 'cute-confirm-button'
      //   }
      // });
      cartItems = getCookieObject("cart_items");
      cartItems = cartItems.filter((item) => item.id != id);
      setCookieObject("cart_items", cartItems, 7);
      loadCart();
    }
  });
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

function setQuantity(id, isIncrease) {
  const min = 0;
  const max = 101;
  const quantityElement = document.getElementById("cart-quantity-" + id);
  let quantity = Number(quantityElement.textContent);

  quantity = isIncrease ? ++quantity : --quantity;
  if (quantity == min || quantity == max) return;
  quantityElement.textContent = quantity;
  const carts = getCookieObject("cart_items");
  //debugger
  const cart = carts.find((item) => item.id === id);
  if (cart) {
    cart.quantity = quantity;
    setCookieObject("cart_items", carts, 7);
    loadCart();
  }
}

function setSize(element, id) {
  const carts = getCookieObject("cart_items");
  const cart = carts.find((item) => item.id === id);
  if (cart) {
    cart.selectedSize = element.value;
    //debugger
    setCookieObject("cart_items", carts, 7);
  }
}

function notification(messageTitle, message) {
  const notification = document.createElement("div");
  notification.className =
    "fixed top-20 right-4 bg-white shadow-lg rounded-lg p-4 z-50 transform translate-x-full opacity-0 transition-all duration-500";
  notification.innerHTML = `
            <div class="flex items-center">
            <div class="w-8 h-8 flex items-center justify-center bg-primary/20 rounded-full mr-3">
            <i class="ri-check-line text-primary"></i>
            </div>
            <div>
            <p class="font-medium text-gray-800">${messageTitle}</p>
            <p class="text-sm text-gray-600">${message}</p>
            </div>
            </div>
            `;
  document.body.appendChild(notification);
  setTimeout(() => {
    notification.classList.remove("translate-x-full", "opacity-0");
  }, 100);
  setTimeout(() => {
    notification.classList.add("translate-x-full", "opacity-0");
    setTimeout(() => {
      notification.remove();
    }, 500);
  }, 3000);
}

// add new order
async function addOrder(data) {
  const response = await fetch(`${apiUrl}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return response.ok;
}

function displayPopupContact() {
  Swal.fire({
    title: "🐾 Liên hệ với chúng mình!",
    html: `
      <div style="font-size: 16px; line-height: 1.8; color: #444;">
        <p>📞 <strong>SĐT:</strong> <a href="tel:0367382521">0367382521</a></p>
        <p>📘 <strong>Facebook:</strong> <a href="https://www.facebook.com/profile.php?id=61576966434198" target="_blank">facebook.com/guupawz</a></p>
        <p>📸 <strong>Instagram:</strong> <a href="https://www.instagram.com/guupawz/" target="_blank">@pet.guupawz</a></p>
        <p>📧 <strong>Email:</strong> <a href="mailto:guupawz@gmail.com">contact@guupawz.vn</a></p>
      </div>
    `,
    icon: "info",
    confirmButtonText: "Đã rõ nè 💕",
    background: "#fff0f5",
    customClass: {
      popup: "cute-popup",
      confirmButton: "cute-confirm-button",
    },
  });
}

// Initialize
function init() {
  userId = localStorage.getItem("userId");

  loadOrders();
  loadCart();
  setProfile();
  setActionLogin();

  // loadProducts();
}
