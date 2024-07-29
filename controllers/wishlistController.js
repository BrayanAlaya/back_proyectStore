const { isEmpty } = require("validator");
const prisma = require("../orm");
const validation = require("validator")

module.exports = {
    save: async (req, res) => {

        const post = req.body;
        const id = req.user.id;

        let found = false;

        try {

            if (!validation.isNumeric(post.product_id)) {
                return res.json({
                    status: 409,
                    message: "didn't pass validation"
                })
            }
        } catch (error) {
            console.log(error)
            return res.json({
                status: 500,
                message: error
            })
        }

        await prisma.wishlist.findFirst({
            where: {
                user_id: Number(id),
                product_id: Number(post.product_id)
            }
        }).then(async (data) => {
            if (data == null) {
                await prisma.wishlist.create({
                    data: {
                        product_id: Number(post.product_id),
                        user_id: Number(id)
                    }
                }).then(data => {
                    return res.json({
                        status: 200,
                        data: data
                    })
                }).catch(error => {
                    console.log(error)
                    return res.json({
                        status: 500,
                        message: error
                    })
                })
            }else{
                return res.json({
                    status: 400,
                    message: "repeated"
                })
            }
        }).catch(error => {
            console.log(error)
            return res.json({
                status: 500,
                message: error
            })
        })
    },

    read: async (req, res) => {

        let userId = req.user.id;
        let page = req.query.page ?? "";
        let offset = 2;

        if (validation.isEmpty(page) || !validation.isNumeric(page)) {
            page = 1
        } else  {
            page = parseInt(page)
        } 

        await prisma.$transaction([
            prisma.wishlist.findMany(
                {
                    where: {
                        user_id: parseInt(userId)
                    },
                    skip: parseInt(offset) * parseInt(page - 1),
                    take: parseInt(offset),
                    orderBy: {
                        id: "desc"
                    }
                }),

            prisma.wishlist.count({
                where: {
                    user_id: parseInt(userId)
                }
            }),
        ]).then(data => {
            return res.json({
                data: data[0],
                count: data[1],
                status: 200
            })
        }).catch(error => {
            return res.json({
                message: "An error has ocurred",
                status: 500
            })
        })

       

    },

    delete: async (req, res) => {

        let id = req.params.id;
        let user_id = req.user.id;

        await prisma.wishlist.delete({
            where: {
                id: Number(id),
                user_id: Number(user_id)
            }
        }).then(data => {

            return res.json({
                status: 200,
                data: data
            })

        }).catch(error => {
            return res.json({
                status: 500,
                message: error
            })
        })

    }
}