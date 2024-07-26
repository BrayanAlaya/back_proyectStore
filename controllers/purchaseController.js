const prisma = require("../orm");
const validation = require("validator");
const moment = require("moment")

module.exports = {

    save: async (req, res) => {

        let userId = req.user.id;

        await prisma.cart.findMany({
            where: {
                user_id: userId
            },
            include: {
                products: true
            }
        }).then(async (data) => {

            if (data.length > 0) {

                let monto = 0;
                data.forEach(d => {
                    monto += parseFloat(d.products.price) * parseFloat(d.amount)
                });
                const createdDates = moment().toISOString(true)

                await prisma.purchases.create({
                    data: {
                        user_id: parseInt(userId),
                        monto: monto,
                        date: createdDates
                    }
                }).then(async (purchaseData) => {

                    let purchaseDetailsData = []

                    data.forEach(cart => {
                        purchaseDetailsData.push({
                            purchase_id: parseInt(purchaseData.id),
                            product_id: parseInt(cart.product_id),
                            monto: parseFloat(cart.products.price) * parseFloat(cart.amount),
                            amount: parseInt(cart.amount)
                        })
                    })

                    await prisma.purchase_details.createMany({
                        data: purchaseDetailsData
                    }).then(async (data) => {

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


                    }).catch(error => {
                        console.log(error)
                        return res.json({
                            status: 500,
                            message: error
                        })
                    })

                }).catch(error => {
                    console.log(error)
                    return res.json({
                        status: 500,
                        message: error
                    })
                })

            } else {
                return res.json({
                    status: 409,
                    message: "Cart empty"
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
    get: async (req, res) => {

        let userId = req.user.id;
        let page = req.params.page;
        let offset = 5;

        if (!validation.isNumeric(page)) {
            return res.json({
                message: "didn't pass validation",
                status: 500
            })
        }

        const [data, total] = await prisma.$transaction([
            prisma.purchases.findMany(
                {
                    where: {
                        user_id: parseInt(userId)
                    },
                    skip: parseInt(offset) * parseInt(page - 1),
                    take: parseInt(offset),
                }),

            prisma.purchases.count({
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
    getDetails: async (req, res) => {
        let purchaseId = req.params.id;

        if (!validation.isNumeric(purchaseId)) {
            return res.json({
                message: "didn't pass validation",
                status: 500
            })
        }

        await prisma.purchase_details.findMany({
            where:{
                purchase_id: parseInt(purchaseId)
            },
            include:{
                products: true
            }
        }).then(data => {

            return res.json({
                data: data,
                status: 200
            })

        }).catch(error => {
            return res.json({
                message: error,
                status: 500
            })
        })
    },
    delete: async (req, res) => {
        let userId = req.user.id;
        let purchaseId = req.params.id;

        if (!validation.isNumeric(purchaseId)) {
            return res.json({
                message: "didn't pass validation",
                status: 500
            })
        }

        const [purchaseEliminated, purchaseDetailEliminated] = await prisma.$transaction([
            prisma.purchase_details.deleteMany({
                where:{
                    purchase_id: parseInt(purchaseId)
                }
            }),
            prisma.purchases.delete({
                where:{
                    id: parseInt(purchaseId)
                }
            })
        ])

        return res.json({
            purchase: purchaseEliminated,
            purchaseDetails: purchaseDetailEliminated,
            status: 200
        })

    }

}

