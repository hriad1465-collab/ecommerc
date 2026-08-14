const express =
    require("express");

const multer =
    require("multer");

const path =
    require("path");

const fs =
    require("fs");

const helmet =
    require("helmet");

const rateLimit =
    require("express-rate-limit");


const db =
    require("./database");


const app =
    express();


const PORT =
    process.env.PORT || 3000;


/* ================= ADMIN PASSWORD ================= */

const ADMIN_PASSWORD =
    process.env.ADMIN_PASSWORD ||
    "change-this-password";


/* ================= UPLOAD DIRECTORY ================= */

const uploadDirectory =
    path.join(
        __dirname,
        "uploads"
    );


if (
    !fs.existsSync(
        uploadDirectory
    )
) {

    fs.mkdirSync(
        uploadDirectory,
        {
            recursive: true
        }
    );

}


/* ================= MULTER ================= */

const storage =
    multer.diskStorage({

        destination:
            function (
                request,
                file,
                callback
            ) {

                callback(
                    null,
                    uploadDirectory
                );

            },


        filename:
            function (
                request,
                file,
                callback
            ) {

                const extension =
                    path.extname(
                        file.originalname
                    );


                const filename =
                    Date.now() +
                    "-" +
                    Math.random()
                        .toString(36)
                        .substring(2) +
                    extension;


                callback(
                    null,
                    filename
                );

            }

    });


const upload =
    multer({

        storage,

        limits: {

            fileSize:
                5 * 1024 * 1024

        }

    });


/* ================= MIDDLEWARE ================= */

app.use(
    helmet({
        contentSecurityPolicy: false
    })
);


app.use(
    express.json({
        limit: "2mb"
    })
);


app.use(
    express.urlencoded({
        extended: true
    })
);


app.use(
    express.static(
        path.join(
            __dirname,
            "public"
        )
    )
);


app.use(
    "/uploads",
    express.static(
        uploadDirectory
    )
);


const limiter =
    rateLimit({

        windowMs:
            15 * 60 * 1000,

        limit: 200

    });


app.use(
    "/api/",
    limiter
);


/* ================= ADMIN AUTH ================= */

function adminAuth(
    request,
    response,
    next
) {

    const password =
        request.headers[
            "x-admin-password"
        ];


    if (
        password !==
        ADMIN_PASSWORD
    ) {

        return response
            .status(401)
            .json({

                success: false,

                message:
                    "Unauthorized"

            });

    }


    next();

}


/* ================= PRODUCTS ================= */


/* GET ALL PRODUCTS */

app.get(
    "/api/products",
    function (
        request,
        response
    ) {

        const products =
            db.prepare(
                `
                SELECT *
                FROM products
                ORDER BY id DESC
                `
            ).all();


        response.json(
            products
        );

    }
);


/* ADD PRODUCT */

app.post(
    "/api/products",
    adminAuth,
    upload.single("image"),

    function (
        request,
        response
    ) {

        try {

            const {

                name,
                category,
                price,
                old_price,
                description,
                stock

            } =
                request.body;


            if (
                !name ||
                !category ||
                !price
            ) {

                return response
                    .status(400)
                    .json({

                        message:
                            "Required fields missing"

                    });

            }


            let image =
                "";


            if (
                request.file
            ) {

                image =
                    "/uploads/" +
                    request.file.filename;

            }


            const result =
                db.prepare(
                    `
                    INSERT INTO products
                    (
                        name,
                        category,
                        price,
                        old_price,
                        description,
                        image,
                        stock
                    )

                    VALUES
                    (
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?
                    )
                    `
                ).run(

                    name,

                    category,

                    Number(price),

                    Number(
                        old_price || 0
                    ),

                    description || "",

                    image,

                    Number(
                        stock || 0
                    )

                );


            response.json({

                success: true,

                productId:
                    result.lastInsertRowid

            });


        } catch (error) {

            console.error(
                error
            );


            response
                .status(500)
                .json({

                    message:
                        "Product upload failed"

                });

        }

    }
);


/* DELETE PRODUCT */

app.delete(
    "/api/products/:id",
    adminAuth,

    function (
        request,
        response
    ) {

        const id =
            Number(
                request.params.id
            );


        db.prepare(
            `
            DELETE FROM products
            WHERE id = ?
            `
        ).run(id);


        response.json({

            success: true

        });

    }
);


/* ================= ORDERS ================= */


/* CREATE ORDER */

app.post(
    "/api/orders",

    function (
        request,
        response
    ) {

        try {

            const {

                customer,
                payment,
                products,
                subtotal,
                delivery,
                total

            } =
                request.body;


            if (
                !customer ||
                !customer.name ||
                !customer.phone ||
                !customer.address
            ) {

                return response
                    .status(400)
                    .json({

                        message:
                            "Customer information missing"

                    });

            }


            const order =
                db.prepare(
                    `
                    INSERT INTO orders
                    (
                        customer_name,
                        phone,
                        email,
                        address,
                        payment_method,
                        transaction_id,
                        subtotal,
                        delivery_charge,
                        total
                    )

                    VALUES
                    (
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?
                    )
                    `
                ).run(

                    customer.name,

                    customer.phone,

                    customer.email || "",

                    customer.address,

                    payment.method,

                    payment.transactionId || "",

                    Number(subtotal),

                    Number(delivery),

                    Number(total)

                );


            const orderId =
                order.lastInsertRowid;


            const itemStatement =
                db.prepare(
                    `
                    INSERT INTO order_items
                    (
                        order_id,
                        product_id,
                        product_name,
                        price,
                        quantity
                    )

                    VALUES
                    (
                        ?,
                        ?,
                        ?,
                        ?,
                        ?
                    )
                    `
                );


            const transaction =
                db.transaction(
                    function () {

                        for (
                            const product
                            of products
                        ) {

                            itemStatement.run(

                                orderId,

                                Number(
                                    product.id
                                ),

                                product.name,

                                Number(
                                    product.price
                                ),

                                Number(
                                    product.quantity
                                )

                            );

                        }

                    }
                );


            transaction();


            response.json({

                success: true,

                orderId

            });


        } catch (error) {

            console.error(
                error
            );


            response
                .status(500)
                .json({

                    message:
                        "Order processing failed"

                });

        }

    }
);


/* GET ORDERS */

app.get(
    "/api/orders",
    adminAuth,

    function (
        request,
        response
    ) {

        const orders =
            db.prepare(
                `
                SELECT *
                FROM orders
                ORDER BY id DESC
                `
            ).all();


        response.json(
            orders
        );

    }
);


/* UPDATE ORDER STATUS */

app.patch(
    "/api/orders/:id",
    adminAuth,

    function (
        request,
        response
    ) {

        const {

            status

        } =
            request.body;


        const allowedStatus = [

            "Pending",

            "Confirmed",

            "Processing",

            "Shipped",

            "Delivered",

            "Cancelled"

        ];


        if (
            !allowedStatus.includes(
                status
            )
        ) {

            return response
                .status(400)
                .json({

                    message:
                        "Invalid status"

                });

        }


        db.prepare(
            `
            UPDATE orders
            SET status = ?
            WHERE id = ?
            `
        ).run(

            status,

            Number(
                request.params.id
            )

        );


        response.json({

            success: true

        });

    }
);


/* ================= SITEMAP ================= */

app.get(
    "/sitemap.xml",
    function (
        request,
        response
    ) {

        const products =
            db.prepare(
                `
                SELECT id
                FROM products
                `
            ).all();


        const base =
            `${request.protocol}://${request.get("host")}`;


        const urls = [

            `${base}/`,

            `${base}/about.html`,

            `${base}/contact.html`,

            `${base}/privacy-policy.html`,

            `${base}/terms-condition.html`,

            ...products.map(
                product =>
                    `${base}/product.html?id=${product.id}`
            )

        ];


        const xml =
            `
            <?xml version="1.0"
            encoding="UTF-8"?>

            <urlset
            xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

            ${

                urls.map(
                    url =>
                        `<url>
                            <loc>${url}</loc>
                        </url>`
                ).join("")

            }

            </urlset>
            `;


        response
            .type("application/xml")
            .send(xml);

    }
);


/* ================= ROBOTS ================= */

app.get(
    "/robots.txt",
    function (
        request,
        response
    ) {

        response
            .type("text/plain")
            .send(
`
User-agent: *
Allow: /

Disallow: /admin/
Disallow: /api/

Sitemap: ${request.protocol}://${request.get("host")}/sitemap.xml
`
            );

    }
);


/* ================= SERVER ================= */

app.listen(
    PORT,
    function () {

        console.log(
            `Server running at http://localhost:${PORT}`
        );

    }
);