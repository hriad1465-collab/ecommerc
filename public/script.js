```javascript
const CART_KEY = "your_store_cart";


// =========================================================
// CART
// =========================================================

function getCart() {
    try {
        return JSON.parse(
            localStorage.getItem(CART_KEY) || "[]"
        );
    } catch (error) {
        console.error("Cart loading error:", error);
        return [];
    }
}


function saveCart(cart) {

    localStorage.setItem(
        CART_KEY,
        JSON.stringify(cart)
    );

    updateCartCount();

}


// =========================================================
// CART COUNT
// =========================================================

function updateCartCount() {

    const cart = getCart();

    const count = cart.reduce(
        (total, product) =>
            total + Number(product.quantity || 0),
        0
    );

    const cartCount =
        document.getElementById("cartCount");

    if (cartCount) {
        cartCount.textContent = count;
    }

}


// =========================================================
// ADD TO CART
// =========================================================

document.addEventListener(
    "click",
    function (event) {

        const button =
            event.target.closest(".add-cart");

        if (!button) return;


        const product = {

            id: button.dataset.id,

            name: button.dataset.name,

            price:
                Number(button.dataset.price || 0),

            image:
                button.dataset.image || "",

            quantity: 1

        };


        const cart = getCart();


        const existing =
            cart.find(
                item =>
                    String(item.id) ===
                    String(product.id)
            );


        if (existing) {

            existing.quantity =
                Number(existing.quantity || 0) + 1;

        } else {

            cart.push(product);

        }


        saveCart(cart);


        // Button animation

        const originalText =
            button.textContent;

        button.textContent =
            "✓ Added to Cart";

        button.disabled = true;


        setTimeout(
            function () {

                button.textContent =
                    originalText;

                button.disabled = false;

            },
            1200
        );


        // Small notification

        showNotification(
            `${product.name} added to cart 🛒`
        );

    }
);


// =========================================================
// NOTIFICATION
// =========================================================

function showNotification(message) {

    const oldNotification =
        document.querySelector(
            ".store-notification"
        );

    if (oldNotification) {
        oldNotification.remove();
    }


    const notification =
        document.createElement("div");

    notification.className =
        "store-notification";

    notification.textContent =
        message;


    notification.style.position =
        "fixed";

    notification.style.right =
        "20px";

    notification.style.bottom =
        "20px";

    notification.style.zIndex =
        "99999";

    notification.style.padding =
        "14px 20px";

    notification.style.borderRadius =
        "12px";

    notification.style.background =
        "linear-gradient(135deg, #7c3aed, #2563eb)";

    notification.style.color =
        "#ffffff";

    notification.style.fontWeight =
        "700";

    notification.style.boxShadow =
        "0 12px 30px rgba(0,0,0,0.20)";

    notification.style.opacity =
        "0";

    notification.style.transform =
        "translateY(15px)";

    notification.style.transition =
        "all 0.3s ease";


    document.body.appendChild(
        notification
    );


    requestAnimationFrame(
        function () {

            notification.style.opacity =
                "1";

            notification.style.transform =
                "translateY(0)";

        }
    );


    setTimeout(
        function () {

            notification.style.opacity =
                "0";

            notification.style.transform =
                "translateY(15px)";


            setTimeout(
                function () {

                    notification.remove();

                },
                300
            );

        },
        1800
    );

}


// =========================================================
// SEARCH
// =========================================================

const searchInput =
    document.getElementById(
        "searchInput"
    );


if (searchInput) {

    searchInput.addEventListener(
        "input",
        function () {

            const search =
                this.value
                    .trim()
                    .toLowerCase();


            const products =
                document.querySelectorAll(
                    ".product-card"
                );


            let visibleProducts = 0;


            products.forEach(
                product => {

                    const name =
                        (
                            product.dataset.name ||
                            product
                                .querySelector("h3")
                                ?.textContent ||
                            ""
                        )
                            .toLowerCase();


                    const category =
                        (
                            product
                                .querySelector(".category")
                                ?.textContent ||
                            ""
                        )
                            .toLowerCase();


                    const matches =
                        name.includes(search) ||
                        category.includes(search);


                    if (matches) {

                        product.style.display =
                            "";

                        visibleProducts++;

                    } else {

                        product.style.display =
                            "none";

                    }

                }
            );


            // No result message

            let noResult =
                document.querySelector(
                    ".no-search-result"
                );


            if (
                search &&
                visibleProducts === 0
            ) {

                if (!noResult) {

                    noResult =
                        document.createElement(
                            "div"
                        );

                    noResult.className =
                        "no-search-result";

                    noResult.style.gridColumn =
                        "1 / -1";

                    noResult.style.textAlign =
                        "center";

                    noResult.style.padding =
                        "40px 20px";

                    noResult.style.color =
                        "#64748b";

                    noResult.style.fontSize =
                        "17px";

                    document
                        .getElementById(
                            "productContainer"
                        )
                        ?.appendChild(
                            noResult
                        );

                }


                noResult.textContent =
                    `No products found for "${this.value}"`;

                noResult.style.display =
                    "block";

            } else if (noResult) {

                noResult.style.display =
                    "none";

            }

        }
    );

}


// =========================================================
// SORT PRODUCTS
// =========================================================

const sortProducts =
    document.getElementById(
        "sortProducts"
    );


if (sortProducts) {

    sortProducts.addEventListener(
        "change",
        function () {

            const container =
                document.getElementById(
                    "productContainer"
                );


            if (!container) return;


            const products =
                Array.from(
                    container.querySelectorAll(
                        ".product-card"
                    )
                );


            if (this.value === "low") {

                products.sort(
                    (a, b) =>
                        Number(
                            a.dataset.price || 0
                        ) -
                        Number(
                            b.dataset.price || 0
                        )
                );

            }


            if (this.value === "high") {

                products.sort(
                    (a, b) =>
                        Number(
                            b.dataset.price || 0
                        ) -
                        Number(
                            a.dataset.price || 0
                        )
                );

            }


            if (this.value === "default") {

                return;

            }


            products.forEach(
                product => {

                    container.appendChild(
                        product
                    );

                }
            );

        }
    );

}


// =========================================================
// IMAGE ERROR HANDLING
// =========================================================

document.addEventListener(
    "error",
    function (event) {

        const image =
            event.target;

        if (
            image &&
            image.tagName === "IMG"
        ) {

            image.style.objectFit =
                "contain";

            image.style.background =
                "#f1f5f9";

        }

    },
    true
);


// =========================================================
// INITIALIZATION
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        updateCartCount();

    }
);


// Also run immediately

updateCartCount();
```
