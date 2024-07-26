const { isEmpty, isNumeric } = require("validator");
const prisma = require("../orm");

module.exports = {
    save: async (req, res) => {

        let userId = req.user.id;
        let body = req.body;

        try {

            if (isEmpty(body.product_id) || isEmpty(body.amount) || !isNumeric(body.amount)) {
                return res.json({
                    status: 409,
                    message: "didn't pass validation"
                })
            }
        } catch (error) {
            return res.json({
                data: error,
                status: 500
            })
        }


        await prisma.cart.findFirst({
            where: {
                user_id: Number(userId),
                product_id: Number(body.product_id)
            }
        }).then(async (data) => {

            let id = 0;
            let cantidad = 0;

            if (data != null) {
                cantidad = Number(data.amount) + Number(body.amount);
                id = Number(data.id)
            } else {
                cantidad = Number(body.amount);
            }

            await prisma.cart.upsert({
                where: {
                    id: Number(id)
                },
                update: {
                    amount: cantidad
                },
                create: {
                    user_id: Number(userId),
                    product_id: Number(body.product_id),
                    amount: cantidad
                }

            }).then(data => {
                return res.json({
                    status: 200,
                    data: data,
                })
            }).catch(error => {
                console.log(error)
                return res.json({
                    data: error,
                    status: 400
                })
            })

        }).catch(error => {

            return res.json({
                data: error,
                status: 500
            })

        })

    },

    get: async (req, res) => {

        let userId = req.user.id;

        await prisma.cart.findMany({
            where: {
                user_id: Number(userId)
            }
        }).then(data => {

            return res.json({
                data: data,
                status: 200
            })

        }).catch(error => {
            return res.json({
                error: error,
                status: 500
            })
        })
    },

    getByPage: async (req, res) => {

        let userId = req.user.id;
        let page = req.params.page;
        let offset = 3;
        try {

            if (!isNumeric(page)) {
                return res.json({
                    message: "didn't pass validation",
                    status: 500
                })
            }

        } catch (error) {
            return res.json({
                error: error,
                status: 500
            })
        }

        const [data, total] = await prisma.$transaction([
            prisma.cart.findMany(
                {
                    where: {
                        user_id: parseInt(userId)
                    },
                    skip: parseInt(offset) * parseInt(page - 1),
                    take: parseInt(offset),
                    include: {
                        products: true
                    }
                }),

            prisma.cart.count({
                where: {
                    user_id: parseInt(userId)
                }
            }),
        ])

        return res.json({
            data: data,
            total: total,
            status: 200
        })

    },

    delete: async (req, res) => {

        let userId = req.user.id;
        let productId = req.params.id;

        try {

            if (isEmpty(productId) || !isNumeric(productId)) {
                return res.json({
                    message: "didn't pass validation",
                    status: 409
                })
            }

        } catch (error) {
            return res.json({
                error: error,
                status: 500
            })
        }

        await prisma.cart.delete({
            where: {
                id: parseInt(productId),
                user_id: parseInt(userId)
            }
        }).then(data => {
            return res.json({
                data: data,
                status: 200
            })
        }).catch(error => {
            console.log(error)
            return res.json({
                error: error,
                status: 500
            })
        })

    },
    deleteMany: async (req, res) => {

        let userId = req.user.id;

        await prisma.cart.deleteMany({
            where: {
                user_id: parseInt(userId)
            }
        }).then(data => {
            return res.json({
                data: data,
                status: 200
            })
        }).catch(error => {
            console.log(error)
            return res.json({
                error: error,
                status: 500
            })
        })

    }
}
