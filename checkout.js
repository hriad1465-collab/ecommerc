const CART_KEY = "your_store_cart";

const DELIVERY_CHARGE = 60;


/* =========================================
   GET CART
========================================= */

function getCart() {

    return JSON.parse(
        localStorage.getItem(CART_KEY) || "[]"
    );

}


/* =========================================
   SAVE CART
========================================= */

function saveCart(cart) {

    localStorage.setItem(
        CART_KEY,
        JSON.stringify(cart)
    );

}


/* =========================================
   CART COUNT
========================================= */

function updateCartCount() {

    const cart = getCart();

    const count = cart.reduce(
        (total, item) => {

            return total +
                Number(item.quantity || 0);

        },
        0
    );


    const cartCount =
        document.getElementById("cartCount");


    if (cartCount) {

        cartCount.textContent = count;

    }

}


/* =========================================
   CALCULATE SUBTOTAL
========================================= */

function calculateSubtotal() {

    const cart = getCart();

    return cart.reduce(
        (total, item) => {

            return total +
                (
                    Number(item.price) *
                    Number(item.quantity)
                );

        },
        0
    );

}


/* =========================================
   DISPLAY CART
========================================= */

function displayCart() {

    const cart = getCart();

    const container =
        document.getElementById("cartItems");


    if (!container) {

        return;

    }


    if (cart.length === 0) {

        container.innerHTML = `

            <div class="notice">

                <h3>
                    Your cart is empty.
                </h3>

                <p>
                    Please add some products
                    before checkout.
                </p>

                <a
                    href="index.html"
                    class="btn"
                >
                    Continue Shopping
                </a>

            </div>

        `;


        updateTotals();

        return;

    }


    container.innerHTML = cart.map(
        (item, index) => {

            const itemTotal =
                Number(item.price) *
                Number(item.quantity);


            return `

                <div class="product-card">

                    <img
                        src="${item.image || ""}"
                        alt="${escapeHTML(item.name)}"
                    >

                    <div class="product-info">

                        <h3>
                            ${escapeHTML(item.name)}
                        </h3>


                        <p>
                            Price:
                            ৳${Number(item.price).toLocaleString()}
                        </p>


                        <div class="quantity-control">

                            <button
                                type="button"
                                onclick="decreaseQuantity(${index})"
                            >
                                -
                            </button>


                            <span>
                                ${item.quantity}
                            </span>


                            <button
                                type="button"
                                onclick="increaseQuantity(${index})"
                            >
                                +
                            </button>

                        </div>


                        <p>
                            Product Total:
                            <strong>
                                ৳${itemTotal.toLocaleString()}
                            </strong>
                        </p>


                        <button
                            type="button"
                            class="btn"
                            onclick="removeProduct(${index})"
                        >
                            Remove
                        </button>

                    </div>

                </div>

            `;

        }
    ).join("");


    updateTotals();

}


/* =========================================
   INCREASE QUANTITY
========================================= */

function increaseQuantity(index) {

    const cart = getCart();


    if (!cart[index]) {

        return;

    }


    cart[index].quantity =
        Number(cart[index].quantity) + 1;


    saveCart(cart);

    displayCart();

    updateCartCount();

}


/* =========================================
   DECREASE QUANTITY
========================================= */

function decreaseQuantity(index) {

    const cart = getCart();


    if (!cart[index]) {

        return;

    }


    if (
        Number(cart[index].quantity) > 1
    ) {

        cart[index].quantity =
            Number(cart[index].quantity) - 1;

    } else {

        cart.splice(index, 1);

    }


    saveCart(cart);

    displayCart();

    updateCartCount();

}


/* =========================================
   REMOVE PRODUCT
========================================= */

function removeProduct(index) {

    const cart = getCart();


    if (!cart[index]) {

        return;

    }


    cart.splice(index, 1);


    saveCart(cart);

    displayCart();

    updateCartCount();

}


/* =========================================
   UPDATE TOTALS
========================================= */

function updateTotals() {

    const subtotal =
        calculateSubtotal();


    const delivery =
        subtotal > 0
            ? DELIVERY_CHARGE
            : 0;


    const total =
        subtotal + delivery;


    const subtotalElement =
        document.getElementById(
            "cartSubtotal"
        );


    const deliveryElement =
        document.getElementById(
            "deliveryCharge"
        );


    const totalElement =
        document.getElementById(
            "cartTotal"
        );


    if (subtotalElement) {

        subtotalElement.textContent =
            subtotal.toLocaleString();

    }


    if (deliveryElement) {

        deliveryElement.textContent =
            delivery.toLocaleString();

    }


    if (totalElement) {

        totalElement.textContent =
            total.toLocaleString();

    }

}


/* =========================================
   PAYMENT METHOD
========================================= */

const paymentMethod =
    document.getElementById(
        "paymentMethod"
    );


if (paymentMethod) {

    paymentMethod.addEventListener(
        "change",
        function () {

            const onlinePayment =
                document.getElementById(
                    "onlinePayment"
                );


            const transactionId =
                document.getElementById(
                    "transactionId"
                );


            if (
                this.value === "bkash" ||
                this.value === "nagad"
            ) {

                onlinePayment.style.display =
                    "block";


                if (transactionId) {

                    transactionId.required =
                        true;

                }

            } else {

                onlinePayment.style.display =
                    "none";


                if (transactionId) {

                    transactionId.required =
                        false;

                    transactionId.value =
                        "";

                }

            }

        }
    );

}


/* =========================================
   CHECKOUT FORM
========================================= */

const checkoutForm =
    document.getElementById(
        "checkoutForm"
    );


if (checkoutForm) {

    checkoutForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const cart =
                getCart();


            /* -----------------------------
               CHECK CART
            ----------------------------- */

            if (cart.length === 0) {

                alert(
                    "Your cart is empty."
                );

                return;

            }


            /* -----------------------------
               CUSTOMER INFORMATION
            ----------------------------- */

            const name =
                document
                .getElementById(
                    "customerName"
                )
                .value
                .trim();


            const phone =
                document
                .getElementById(
                    "customerPhone"
                )
                .value
                .trim();


            const email =
                document
                .getElementById(
                    "customerEmail"
                )
                .value
                .trim();


            const address =
                document
                .getElementById(
                    "customerAddress"
                )
                .value
                .trim();


            const payment =
                document
                .getElementById(
                    "paymentMethod"
                )
                .value;


            const transactionElement =
                document.getElementById(
                    "transactionId"
                );


            const transactionId =
                transactionElement
                    ? transactionElement.value.trim()
                    : "";


            /* -----------------------------
               VALIDATION
            ----------------------------- */

            if (!name) {

                alert(
                    "Please enter your name."
                );

                return;

            }


            if (!phone) {

                alert(
                    "Please enter your phone number."
                );

                return;

            }


            if (!address) {

                alert(
                    "Please enter your delivery address."
                );

                return;

            }


            if (!payment) {

                alert(
                    "Please select a payment method."
                );

                return;

            }


            if (
                (
                    payment === "bkash" ||
                    payment === "nagad"
                ) &&
                !transactionId
            ) {

                alert(
                    "Please enter your Transaction ID."
                );

                return;

            }


            /* -----------------------------
               CALCULATE TOTAL
            ----------------------------- */

            const subtotal =
                calculateSubtotal();


            const delivery =
                DELIVERY_CHARGE;


            const total =
                subtotal + delivery;


            /* -----------------------------
               ORDER DATA
            ----------------------------- */

            const order = {

                customer: {

                    name: name,

                    phone: phone,

                    email: email,

                    address: address

                },


                payment: {

                    method: payment,

                    transactionId:
                        transactionId

                },


                products: cart.map(
                    item => ({

                        id:
                            item.id,

                        name:
                            item.name,

                        price:
                            Number(item.price),

                        quantity:
                            Number(item.quantity),

                        image:
                            item.image || ""

                    })
                ),


                subtotal:
                    subtotal,


                delivery:
                    delivery,


                total:
                    total

            };


            /* -----------------------------
               DISABLE BUTTON
            ----------------------------- */

            const submitButton =
                checkoutForm.querySelector(
                    'button[type="submit"]'
                );


            if (submitButton) {

                submitButton.disabled =
                    true;

                submitButton.textContent =
                    "Processing Order...";

            }


            try {

                /* =============================
                   SEND ORDER TO BACKEND
                ============================= */

                const response =
                    await fetch(
                        "/api/orders",
                        {

                            method:
                                "POST",


                            headers: {

                                "Content-Type":
                                    "application/json"

                            },


                            body:
                                JSON.stringify(
                                    order
                                )

                        }
                    );


                /* =============================
                   READ SERVER RESPONSE
                ============================= */

                const result =
                    await response.json();


                /* =============================
                   SUCCESS
                ============================= */

                if (
                    response.ok &&
                    result.success
                ) {

                    localStorage.removeItem(
                        CART_KEY
                    );


                    const message =
                        document.getElementById(
                            "orderMessage"
                        );


                    if (message) {

                        message.innerHTML = `

                            <div class="notice">

                                <h2>
                                    Order Successful
                                </h2>


                                <p>
                                    Thank you,
                                    <strong>
                                        ${escapeHTML(name)}
                                    </strong>
                                </p>


                                <p>
                                    Your Order ID:
                                    <strong>
                                        #${result.orderId}
                                    </strong>
                                </p>


                                <p>
                                    Order Total:
                                    <strong>
                                        ৳${total.toLocaleString()}
                                    </strong>
                                </p>


                                <p>
                                    Payment Method:
                                    <strong>
                                        ${escapeHTML(payment)}
                                    </strong>
                                </p>


                                <a
                                    href="index.html"
                                    class="btn"
                                >
                                    Continue Shopping
                                </a>

                            </div>

                        `;

                    }


                    checkoutForm.reset();


                    const onlinePayment =
                        document.getElementById(
                            "onlinePayment"
                        );


                    if (onlinePayment) {

                        onlinePayment.style.display =
                            "none";

                    }


                    displayCart();

                    updateCartCount();


                } else {

                    alert(
                        result.message ||
                        "Order failed. Please try again."
                    );

                }


            } catch (error) {

                console.error(
                    "Order Error:",
                    error
                );


                alert(
                    "Unable to connect to the server. Please try again."
                );


            } finally {

                /* -----------------------------
                   ENABLE BUTTON AGAIN
                ----------------------------- */

                if (submitButton) {

                    submitButton.disabled =
                        false;

                    submitButton.textContent =
                        "Place Order";

                }

            }

        }
    );

}


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHTML(value) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        String(value ?? "");


    return div.innerHTML;

}


/* =========================================
   INITIALIZE
========================================= */

displayCart();

updateCartCount();