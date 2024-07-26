const { isEmpty } = require("validator");
const prisma = require("../orm");
const moment = require("moment");
const validation = require("validator")

module.exports = {
    save: async (req, res) => {

        const post = req.body;
        const user_id = req.user.id;

        try {

            const nameValid = !isEmpty(post.name)
            const stockValid = !isEmpty(post.stock)
            const priceValid = !isEmpty(post.price)
            const descriptionValid = !isEmpty(post.description)
            const categoryIdValid = !isEmpty(post.category_id)

            if (nameValid, stockValid, priceValid, descriptionValid, categoryIdValid) {

                await prisma.products.create({
                    data: {
                        name: post.name,
                        stock: Number(post.stock),
                        price: parseFloat(post.price),
                        description: post.description,
                        createdDate: moment().toISOString(),
                        category_id: Number(post.category_id),
                        user_id: Number(user_id)
                    }
                }).then(data => {

                    return res.json({
                        status: 200,
                        data: data
                    })

                }).catch(error => {
                    console.log(error)
                    return res.json({
                        status: 500
                    })
                })
            } else {
                return res.json({
                    status: 409,
                    message: "didn't pass validation"
                })
            }

        } catch (error) {
            console.log(error)
            return res.json({
                status: 500
            })
        }

    },

    getByUserId: async (req, res) => {

        let userId = req.params.id;
        let page = req.params.page;
        let offset = 5;

        if (!validation.isNumeric(page)|| !validation.isNumeric(userId)) {
            return res.json({
                message: "didn't pass validation",
                status: 500
            })
        }

        const [data, total] = await prisma.$transaction([
            prisma.products.findMany(
                {
                    where: {
                        user_id: parseInt(userId)
                    },
                    skip: parseInt(offset) * parseInt(page - 1),
                    take: parseInt(offset),
                }),

            prisma.products.count({
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

    getByCategoryId: async (req, res) => {

        let categoryId = req.params.id;
        let page = req.params.page;
        let offset = 5;

        if (!validation.isNumeric(page) || !validation.isNumeric(categoryId)) {
            return res.json({
                message: "didn't pass validation",
                status: 500
            })
        }

        const [data, total] = await prisma.$transaction([
            prisma.products.findMany({
                where: {
                    category_id: parseInt(categoryId)
                },
                skip: parseInt(offset) * parseInt(page - 1),
                take: parseInt(offset),
            }),

            prisma.products.count({
                where: {
                    category_id: parseInt(categoryId)
                }
            }),
        ])

        return res.json({
            data: data,
            total: total,
            status: 200
        })

    },

    update: async (req, res) => {

        const post = req.body;
        const user_id = req.user.id;
        const id = req.params.id;

        try {

            const nameValid = !isEmpty(post.name)
            const stockValid = !isEmpty(post.stock)
            const priceValid = !isEmpty(post.price)
            const descriptionValid = !isEmpty(post.description)
            const categoryIdValid = !isEmpty(post.category_id)

            if (nameValid, stockValid, priceValid, descriptionValid, categoryIdValid) {

                await prisma.products.update({
                    where: {
                        id: Number(id),
                        user_id: Number(user_id)
                    },
                    data: {
                        name: post.name,
                        stock: Number(post.stock),
                        price: parseFloat(post.price),
                        description: post.description,
                        category_id: Number(post.category_id)
                    }
                }).then(data => {
                    return res.json({
                        status: 200,
                        data: data
                    })
                }).catch(error => {
                    return res.json({
                        status: 500
                    })
                })

            } else {
                return res.json({
                    status: 409,
                    message: "didn't pass validation"
                })
            }


        } catch (error) {

            return res.json({
                status: 500,
            })

        }

    },

    delete: async (req, res) => {

        const user_id = req.user.id;
        const id = req.params.id;

        await prisma.products.update({
            where: {
                id: Number(id),
                user_id: Number(user_id)
            },
            data: {
                eliminado: 1
            }
        }).then(data => {
            return res.json({
                status: 200,
                data: data
            })
        }).catch(error => {
            console.log(error)
            return res.json({
                status: 500
            })
        })

    }
}
