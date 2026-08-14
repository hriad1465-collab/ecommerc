const adminPassword =
    localStorage.getItem(
        "adminPassword"
    );


if (!adminPassword) {

    window.location.href =
        "login.html";

}


/* ================= API ================= */

const headers = {

    "x-admin-password":
        adminPassword

};


/* ================= LOAD PRODUCTS ================= */

async function loadProducts() {

    const response =
        await fetch(
            "/api/products"
        );


    const products =
        await response.json();


    const container =
        document.getElementById(
            "productList"
        );


    if (!products.length) {

        container.innerHTML =
            "<p>No products found.</p>";

        return;

    }


    container.innerHTML =
        products.map(
            product => `

            <div
                class="product-card"
            >

                ${
                    product.image
                    ?
                    `<img
                        src="${product.image}"
                        alt="${product.name}"
                    >`
                    :
                    ""
                }


                <div
                    class="product-info"
                >

                    <h3>
                        ${product.name}
                    </h3>

                    <p>
                        Category:
                        ${product.category}
                    </p>

                    <p>
                        Price:
                        ৳${product.price}
                    </p>

                    <p>
                        Stock:
                        ${product.stock}
                    </p>


                    <button
                        class="btn"
                        onclick="deleteProduct(${product.id})"
                    >

                        Delete

                    </button>

                </div>

            </div>

            `
        )
        .join("");

}


/* ================= DELETE PRODUCT ================= */

async function deleteProduct(
    id
) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this product?"
        );


    if (!confirmDelete) {

        return;

    }


    const response =
        await fetch(
            `/api/products/${id}`,
            {

                method:
                    "DELETE",

                headers

            }
        );


    const result =
        await response.json();


    if (
        result.success
    ) {

        loadProducts();

    } else {

        alert(
            result.message ||
            "Delete failed"
        );

    }

}


/* ================= UPLOAD PRODUCT ================= */

document
.getElementById(
    "productForm"
)
.addEventListener(
    "submit",
    async function(event){

        event.preventDefault();


        const formData =
            new FormData(
                this
            );


        const response =
            await fetch(
                "/api/products",
                {

                    method:
                        "POST",

                    headers,

                    body:
                        formData

                }
            );


        const result =
            await response.json();


        const message =
            document
            .getElementById(
                "productMessage"
            );


        if (
            result.success
        ) {

            message.textContent =
                "Product uploaded successfully.";

            this.reset();

            loadProducts();

        } else {

            message.textContent =
                result.message ||
                "Upload failed.";

        }

    }
);


/* ================= LOAD ORDERS ================= */

async function loadOrders() {

    const response =
        await fetch(
            "/api/orders",
            {
                headers
            }
        );


    const orders =
        await response.json();


    const container =
        document.getElementById(
            "orderList"
        );


    if (!orders.length) {

        container.innerHTML =
            "<p>No orders yet.</p>";

        return;

    }


    container.innerHTML =

        orders.map(
            order => `

            <div
                class="product-card"
            >

                <h3>
                    Order #${order.id}
                </h3>

                <p>
                    Customer:
                    ${order.customer_name}
                </p>

                <p>
                    Phone:
                    ${order.phone}
                </p>

                <p>
                    Address:
                    ${order.address}
                </p>

                <p>
                    Payment:
                    ${order.payment_method}
                </p>

                <p>
                    Transaction ID:
                    ${order.transaction_id || "N/A"}
                </p>

                <p>
                    Total:
                    ৳${order.total}
                </p>

                <p>
                    Status:
                    <strong>
                        ${order.status}
                    </strong>
                </p>


                <select
                    onchange="
                    updateOrderStatus(
                        ${order.id},
                        this.value
                    )"
                >

                    <option
                        value="Pending"
                        ${
                            order.status ===
                            "Pending"
                            ? "selected"
                            : ""
                        }
                    >
                        Pending
                    </option>

                    <option
                        value="Confirmed"
                        ${
                            order.status ===
                            "Confirmed"
                            ? "selected"
                            : ""
                        }
                    >
                        Confirmed
                    </option>

                    <option
                        value="Processing"
                        ${
                            order.status ===
                            "Processing"
                            ? "selected"
                            : ""
                        }
                    >
                        Processing
                    </option>

                    <option
                        value="Shipped"
                        ${
                            order.status ===
                            "Shipped"
                            ? "selected"
                            : ""
                        }
                    >
                        Shipped
                    </option>

                    <option
                        value="Delivered"
                        ${
                            order.status ===
                            "Delivered"
                            ? "selected"
                            : ""
                        }
                    >
                        Delivered
                    </option>

                    <option
                        value="Cancelled"
                        ${
                            order.status ===
                            "Cancelled"
                            ? "selected"
                            : ""
                        }
                    >
                        Cancelled
                    </option>

                </select>

            </div>

            `
        )
        .join("");

}


/* ================= UPDATE ORDER ================= */

async function updateOrderStatus(
    id,
    status
) {

    await fetch(
        `/api/orders/${id}`,
        {

            method:
                "PATCH",

            headers: {

                ...headers,

                "Content-Type":
                    "application/json"

            },

            body:
                JSON.stringify({
                    status
                })

        }
    );


    loadOrders();

}


/* ================= LOGOUT ================= */

function logout() {

    localStorage.removeItem(
        "adminPassword"
    );


    window.location.href =
        "login.html";

}


/* ================= START ================= */

loadProducts();

loadOrders();