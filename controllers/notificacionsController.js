const prisma = require("../orm");
const moment = require("moment");
const validation = require("validator")

module.exports = {
    create: async (req, res) => {

        const body = req.body;

        try {

            var titleValid = !isEmpty(body.title)
            var messageValid = !isEmpty(body.message)
            var userIdValid = !isEmpty(body.user_id)

            if (titleValid && messageValid && userIdValid) {

                await prisma.notifications.create({
                    data: {
                        title: body.title,
                        message: body.message,
                        date: moment().toISOString(),
                        user_Id: Number(body.user_id)
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
                    message: "Validation failed"
                })
            }

        } catch (error) {
            return res.json({
                status: 500,
            })
        }

    },

    getByUser: async (req, res) => {

        let userId = req.user.id;
        let page = req.query.page ?? "1";
        let offset = 5;

        if (validation.isEmpty(page) || !validation.isNumeric(page)) {
            page = 1
        } else {
            page = parseInt(page)
        }

        await prisma.$transaction([
            prisma.notifications.findMany(
                {
                    where: {
                        user_Id: parseInt(userId)
                    },
                    skip: parseInt(offset) * parseInt(page - 1),
                    take: parseInt(offset),
                    orderBy: {
                        id: "desc"
                    }
                }),

            prisma.notifications.count({
                where: {
                    user_Id: parseInt(userId)
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
                status: 500,
                message: "An error has ocurred"
            })
        })



    },

    updateRead: async (req, res) => {
        const id = Number(req.params.id);
        const userId = req.user.id;

        await prisma.notifications.update({
            where: {
                id: id,
                user_Id: userId
            },
            data: {
                read: 1
            }
        }).then((data) => {
            return res.json({
                status: 200,
                data: data
            })
        }).catch((error) => {
            console.log(error)
            return res.json({
                status: 500
            })
        })

    }
}
