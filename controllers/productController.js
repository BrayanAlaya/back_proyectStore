const { isEmpty } = require("validator");
const prisma = require("../orm");
const moment = require("moment");
const validation = require("validator");

module.exports = {
    save: async (req, res) => {

        const post = req.body;
        const user_id = req.user.id;

        try {

            const nameValid = !isEmpty(post.name.trim())
            const stockValid = !isEmpty(post.stock.trim())
            const priceValid = !isEmpty(post.price.trim())
            const descriptionValid = !isEmpty(post.description.trim())
            const categoryIdValid = !isEmpty(post.category_id.trim())

            if (nameValid, stockValid, priceValid, descriptionValid, categoryIdValid) {

                await prisma.products.create({
                    data: {
                        name: post.name.trim(),
                        stock: Number(post.stock),
                        price: parseFloat(post.price.trim()),
                        description: post.description.trim(),
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

    // getByUserId: async (req, res) => {

    //     let userId = req.params.id;
    //     let page = req.params.page;
    //     let offset = 10;

    //     if (!validation.isNumeric(page) || !validation.isNumeric(userId)) {
    //         return res.json({
    //             message: "didn't pass validation",
    //             status: 500
    //         })
    //     }

    //     await prisma.$transaction([
    //         prisma.products.findMany({
    //             where: {
    //                 user_id: parseInt(userId)
    //             },
    //             skip: parseInt(offset) * parseInt(page - 1),
    //             take: parseInt(offset),
    //             orderBy: {
    //                 id: "desc"
    //             }
    //         }),

    //         prisma.products.count({
    //             where: {
    //                 user_id: parseInt(userId)
    //             }
    //         }),
    //     ]).then(data => {
    //         return res.json({
    //             data: data[0],
    //             count: data[1],
    //             status: 200
    //         })
    //     }).catch(error => {
    //         return res.json({
    //             message: "An error has ocurred",
    //             status: 500
    //         })
    //     })
    // },

    getBySearch: async (req, res) => {

        let name = req.query.name ?? "";
        let page = req.query.page ?? "1";
        let user_id = req.query.user ?? "";
        let category = req.query.category ?? "";
        let offset = 10;

        let search = {}

        if (!validation.isEmpty(name)) {
            search['name'] = {
                startsWith: "%" + name + "%"
            }
        }

        if (validation.isNumeric(category)) {
            search['category_id'] = parseInt(category)
        }

        if(validation.isNumeric(user_id)){
            search['user_id'] = parseInt(user_id)
        }

        if (validation.isEmpty(page) || !validation.isNumeric(page)) {
            page = 1
        } else  {
            page = parseInt(page)
        } 

        console.log(search)

        await prisma.$transaction([
            prisma.products.findMany({
                where: search,
                skip: parseInt(offset) * parseInt(page - 1),
                take: parseInt(offset),
                orderBy: {
                    id: "desc"
                }
            }),

            prisma.products.count({
                where: search
            }),
        ]).then(data => {
            return res.json({
                data: data[0],
                count: data[1],
                status: 200
            })
        }).catch(error => {
            console.log(error)
            return res.json({
                message: "An error has ocurred",
                status: 500
            })
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
