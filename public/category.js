const CART_KEY = "your_store_cart";

function getCart() {
    try {
        return JSON.parse(
            localStorage.getItem(CART_KEY) || "[]"
        );
    } catch (error) {
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

async function loadCategoryProducts() {

    const container =
        document.getElementById("categoryProducts");

    if (!container) return;

    const category =
        document.body.dataset.category;

    if (!category) {
        container.innerHTML =
            "<p>Category not found.</p>";
        return;
    }

    container.innerHTML =
        "<p>Loading products...</p>";

    try {

        const response =
            await fetch("/api/products");

        if (!response.ok) {
            throw new Error(
                "Failed to load products"
            );
        }

        const products =
            await response.json();

        const categoryProducts =
            products.filter(product => {

                return String(
                    product.category || ""
                )
                .trim()
                .toLowerCase()
                ===
                category
                    .trim()
                    .toLowerCase();

            });

        if (categoryProducts.length === 0) {

            container.innerHTML = `
                <div class="empty-category">
                    <h3>No Products Available</h3>
                    <p>
                        No products have been added
                        to this category yet.
                    </p>
                </div>
            `;

            return;
        }

        container.innerHTML =
            categoryProducts
                .map(createProductCard)
                .join("");

        updateCartCount();

    } catch (error) {

        console.error(error);

        container.innerHTML = `
            <div class="empty-category">
                <h3>Unable to Load Products</h3>
                <p>
                    Please refresh the page
                    and try again.
                </p>
            </div>
        `;
    }
}

function createProductCard(product) {

    const image =
        product.image &&
        product.image.trim() !== ""
            ? product.image
            : "https://via.placeholder.com/500x500?text=No+Image";

    const price =
        Number(product.price || 0);

    return `
        <div
            class="product-card"
            data-name="${escapeHTML(product.name || "")}"
            data-price="${price}"
        >

            <img
                src="${escapeHTML(image)}"
                alt="${escapeHTML(product.name || "Product")}"
                loading="lazy"
                onerror="this.src='https://via.placeholder.com/500x500?text=No+Image'"
            >

            <div class="product-info">

                <h3>
                    ${escapeHTML(product.name || "Product")}
                </h3>

                <p class="category">
                    ${escapeHTML(product.category || "")}
                </p>

                <p class="price">
                    ৳${price.toLocaleString("en-BD")}
                </p>

                <button
                    type="button"
                    class="btn add-cart"
                    data-id="${product.id}"
                    data-name="${escapeHTML(product.name || "")}"
                    data-price="${price}"
                    data-image="${escapeHTML(image)}"
                >
                    Add To Cart
                </button>

            </div>

        </div>
    `;
}

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

document.addEventListener(
    "click",
    function(event) {

        const button =
            event.target.closest(".add-cart");

        if (!button) return;

        const product = {

            id: button.dataset.id,

            name: button.dataset.name,

            price:
                Number(
                    button.dataset.price
                ),

            image:
                button.dataset.image,

            quantity: 1
        };

        const cart = getCart();

        const existing =
            cart.find(
                item =>
                    String(item.id)
                    ===
                    String(product.id)
            );

        if (existing) {
            existing.quantity++;
        } else {
            cart.push(product);
        }

        saveCart(cart);

        alert(
            "Product added to cart successfully!"
        );
    }
);

function setupSearch() {

    const searchInput =
        document.getElementById(
            "searchInput"
        );

    if (!searchInput) return;

    searchInput.addEventListener(
        "input",
        function() {

            const search =
                this.value
                    .trim()
                    .toLowerCase();

            const products =
                document.querySelectorAll(
                    "#categoryProducts .product-card"
                );

            products.forEach(product => {

                const name =
                    product
                        .dataset
                        .name
                        .toLowerCase();

                const category =
                    product.querySelector(
                        ".category"
                    )?.textContent
                    .toLowerCase() || "";

                if (
                    name.includes(search) ||
                    category.includes(search)
                ) {
                    product.style.display = "";
                } else {
                    product.style.display = "none";
                }
            });
        }
    );
}

function setupSort() {

    const sort =
        document.getElementById(
            "sortProducts"
        );

    if (!sort) return;

    sort.addEventListener(
        "change",
        function() {

            const container =
                document.getElementById(
                    "categoryProducts"
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

            products.forEach(product => {
                container.appendChild(product);
            });
        }
    );
}

document.addEventListener(
    "DOMContentLoaded",
    function() {

        updateCartCount();

        loadCategoryProducts();

        setupSearch();

        setupSort();

    }
);
