 document.addEventListener("DOMContentLoaded", function () {
                  function loadPartial() {
                fetch('modal.html')
                  .then(response => response.text())
                  .then(data => {
                    document.getElementById('modal-container').innerHTML = data;
                  })
                  .catch(console.error);
              }
               loadPartial();
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
                const modals = [
                    signInModal,
                    myOrdersModal,
                    signUpModal,
                    myProfileModal,
                ];
                const switchToSignIn = document.getElementById("switchToSignIn");
                function openModal(modal) {
                    modal.classList.remove("hidden");
                    console.log("open",modal);
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
                    console.log("close",modal);
                    setTimeout(() => {
                        modal.classList.add("hidden");
                         console.log("2",modal)
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
                    openModal(myProfileModal);
                });
                switchToSignIn.addEventListener("click", (e) => {
                    e.preventDefault();
                    closeModal(signUpModal);
                    openModal(signInModal);
                });
                const createAccountForm = document.getElementById("createAccountForm");
                createAccountForm.addEventListener("submit", (e) => {
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
                        console.log("closeButton",modal);
                        closeModal(modal.parentElement);
                    });
                });
                modals.forEach((modal) => {
                    modal.addEventListener("click", (e) => {
                        console.log("Runnnnnnnnn",modal.childNodes);
                        console.log("OKIKI",e.target);
                        if ([...modal.childNodes].includes(e.target)) {
                            console.log("Runnnnnnnnn");
                            closeModal(modal);
                        }
                      });
                });
                const signInForm = document.getElementById("signInForm");
                signInForm.addEventListener("submit", (e) => {
                    e.preventDefault();
                    const email = document.getElementById("email").value;
                    const password = document.getElementById("password").value;
                    if (email && password) {
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
            });