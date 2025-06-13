document.addEventListener("DOMContentLoaded", async function () {

  await fetch('modal.html') // Adjust path if needed
                .then(response => response.text())
                .then(html => {
                    const wrapper = document.createElement('div');
                    wrapper.innerHTML = html;
                    document.body.appendChild(wrapper);
                })
                .catch(error => {
                    console.error('Error loading footer:', error);
                });

  const signInLink = document.getElementById("signInLink");
  const myOrdersLink = document.getElementById("myOrdersLink");
  const signUpLink = document.getElementById("signUpLink");
  const myProfileLink = document.getElementById("myProfileLink");
  const LogoutLink = document.getElementById("LogoutLink");
  // Modal
  const signInModal = document.getElementById("signInModal");
  const myOrdersModal = document.getElementById("myOrdersModal");
  const signUpModal = document.getElementById("signUpModal");
  const myProfileModal = document.getElementById("myProfileModal");
  const closeButtons = document.querySelectorAll(".closeModal");
  const modals = [signInModal, myOrdersModal, signUpModal, myProfileModal];
  const switchToSignIn = document.getElementById("switchToSignIn");
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
  const createAccountForm = document.getElementById("createAccountForm");
  createAccountForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const firstName = document.getElementById("firstName").value;
    const lastName = document.getElementById("lastName").value;
    const email = document.getElementById("newEmail").value;
    const username = document.getElementById("username").value;
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
            <p class="font-medium text-gray-800">Passwords do not match</p>
            <p class="text-sm text-gray-600">Please try again</p>
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
      register(firstName, lastName, email, password);
      const notification = document.createElement("div");
      notification.className =
        "fixed top-20 right-4 bg-white shadow-lg rounded-lg p-4 z-50 transform translate-x-full opacity-0 transition-all duration-500";
      notification.innerHTML = `
                <div class="flex items-center">
                <div class="w-8 h-8 flex items-center justify-center bg-primary/20 rounded-full mr-3">
                <i class="ri-check-line text-primary"></i>
                </div>
                <div>
                <p class="font-medium text-gray-800">Welcome to PawFashion!</p>
                <p class="text-sm text-gray-600">Account created successfully</p>
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
    updateProfile(
      firstName,
      lastName,
      email,
      phone,
      formattedDate,
      description
    );
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
                    <p class="font-medium text-gray-800">Profile Updated</p>
                    <p class="text-sm text-gray-600">Your changes have been saved</p>
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

  // Load cart popup
  // const cartWrapper = document.getElementById('cart-wrapper');
  // const cartPopup = document.getElementById('cart-popup');

  // cartWrapper.addEventListener('mouseenter', () => {
  //     const carts = getCookieObject("cart_items");

  //     if(carts){
  //         return;
  //     }
  //     cartPopup.classList.remove('opacity-0', 'invisible');
  //     cartPopup.classList.add('opacity-100', 'visible');
  // });

  // cartWrapper.addEventListener('mouseleave', () => {
  //     cartPopup.classList.remove('opacity-100', 'visible');
  //     cartPopup.classList.add('opacity-0', 'invisible');
  // });

  const signInForm = document.getElementById("signInForm");
  signInForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("password").value;
    if (email && password) {
      login(email, password);
      const notification = document.createElement("div");
      notification.className =
        "fixed top-20 right-4 bg-white shadow-lg rounded-lg p-4 z-50 transform translate-x-full opacity-0 transition-all duration-500";
      notification.innerHTML = `
            <div class="flex items-center">
            <div class="w-8 h-8 flex items-center justify-center bg-primary/20 rounded-full mr-3">
            <i class="ri-check-line text-primary"></i>
            </div>
            <div>
            <p class="font-medium text-gray-800">Welcome back!</p>
            <p class="text-sm text-gray-600">Successfully signed in</p>
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
    const input = document.getElementById('search-input');
    const icon = document.getElementById('search-icon');

    input.addEventListener('input', () => {
        if (input.value.trim() !== '') {
            icon.classList.remove('left-3');
            icon.classList.add('right-3', 'left-auto');
        } else {
            icon.classList.remove('right-3', 'left-auto');
            icon.classList.add('left-3');
        }
    });

    icon.addEventListener('click', () => {
        console.log("Hi");
        location.href = "shop.html"; 
    })

  //load featured product
  loadFeaturedProducts();
});

// Load products
async function loadFeaturedProducts() {
  const products = await getProducts();
  const productsDiv = document.getElementById("product-slider");
  if(!productsDiv) return;
  productsDiv.innerHTML = products
    .map(
      (product) => `
                <div class="bg-white rounded-lg shadow-md overflow-hidden group flex-shrink-0 snap-start w-[300px] md:w-[350px]">
                    <div class="relative">
                        <img src="${product.imgUrl}"
                            alt="${
                              product.name
                            }r" class="w-full h-64 object-cover object-top">
                        <button
                            class="absolute top-3 right-3 w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition">
                            <i class="ri-heart-line text-pink-500 ri-lg"></i>
                        </button>
                    </div>
                    <div class="p-4">
                        <div class="flex text-yellow-400 mb-2">
                            <i class="ri-star-fill"></i>
                            <i class="ri-star-fill"></i>
                            <i class="ri-star-fill"></i>
                            <i class="ri-star-fill"></i>
                            <i class="ri-star-half-fill"></i>
                            <span class="text-gray-500 text-sm ml-2">(42)</span>
                        </div>
                        <h3 class="font-semibold text-lg mb-1">${
                          product.name
                        }</h3>
                        <p class="text-gray-500 text-sm mb-3">${
                          product.description
                        }</p>
                        <div class="flex justify-between items-center">
                            <span class="font-bold text-lg">${formatCurrencyVND(
                              product.price
                            )}</span>
                            <button onclick="addToCart(${product.id})"
                                class="bg-primary text-white px-4 py-2 rounded-button hover:bg-pink-400 transition whitespace-nowrap">Add
                                to Cart</button>
                        </div>
                    </div>
                </div>
                `
    )
    .join("");
}

function loadCheckoutPage() {
    const carts = getCookieObject("cart_items");
    // debugger
    if(carts.length > 0){
        location.href = "checkout.html";
    }
}
