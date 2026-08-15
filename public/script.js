const CART_KEY = "your_store_cart";


// ================= CART =================

function getCart() {

    return JSON.parse(
        localStorage.getItem(CART_KEY) || "[]"
    );

}


function saveCart(cart) {

    localStorage.setItem(
        CART_KEY,
        JSON.stringify(cart)
    );

    updateCartCount();

}


function updateCartCount() {

    const cart = getCart();

    const count = cart.reduce(
        (total, product) =>
            total + product.quantity,
        0
    );

    const cartCount =
        document.getElementById("cartCount");

    if (cartCount) {

        cartCount.textContent = count;

    }

}


// ================= ADD PRODUCT =================

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
                Number(button.dataset.price),

            image:
                button.dataset.image,

            quantity: 1

        };


        const cart = getCart();


        const existing =
            cart.find(
                item =>
                    item.id === product.id
            );


        if (existing) {

            existing.quantity++;

        } else {

            cart.push(product);

        }


        saveCart(cart);


        alert(
            "Product added to cart successfully."
        );

    }
);


// ================= SEARCH =================

const searchInput =
    document.getElementById(
        "searchInput"
    );


if (searchInput) {

    searchInput.addEventListener(
        "input",
        function () {

            const search =
                this.value.toLowerCase();

            const products =
                document.querySelectorAll(
                    ".product-card"
                );


            products.forEach(
                product => {

                    const name =
                        product
                        .dataset
                        .name
                        .toLowerCase();


                    if (
                        name.includes(search)
                    ) {

                        product.style.display =
                            "";

                    } else {

                        product.style.display =
                            "none";

                    }

                }
            );

        }
    );

}


// ================= SORT =================

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


            const products =
                Array.from(
                    container.children
                );


            if (this.value === "low") {

                products.sort(
                    (a, b) =>
                        Number(a.dataset.price) -
                        Number(b.dataset.price)
                );

            }


            if (this.value === "high") {

                products.sort(
                    (a, b) =>
                        Number(b.dataset.price) -
                        Number(a.dataset.price)
                );

            }


            products.forEach(
                product =>
                    container.appendChild(
                        product
                    )
            );

        }
    );

}


// Initial cart count

updateCartCount();