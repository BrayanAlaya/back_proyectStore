'use strict'
require('dotenv').config()
const validator = require("validator");
const prisma = require("../orm");
const bcrypt = require("bcryptjs");
const moment = require("moment");
const jwt = require("../services/jwt");
const email = require("../services/mail/sendAuthCode");
const s3 = require("../services/s3")
const crypto = require("crypto")
const sharp = require("sharp")

module.exports = {

    register: async (req, res) => {


        let response = {};
        let params = await req.body;

        try {

            const validName = !validator.isEmpty(params.name.trim());
            const validBirthdate = !validator.isEmpty(params.birthdate) && validator.isDate(params.birthdate);
            const validEmail = !validator.isEmpty(params.email.trim()) && validator.isEmail(params.email.trim());
            const validPassword = !validator.isEmpty(params.password.trim());

            if (validName && validBirthdate && validEmail && validPassword) {

                const emailExist = await prisma.users.findUnique({
                    where: {
                        email: params.email
                    }
                })

                if (!emailExist) {

                    const passwordHash = bcrypt.hashSync(params.password.trim(), bcrypt.genSaltSync(10));

                    const birthDateIso = moment(params.birthdate).toISOString(true)
                    const createdDatee = moment().toISOString(true)

                    let payload = {
                        name: params.name.trim(),
                        birthdate: birthDateIso,
                        email: params.email.trim().toLowerCase(),
                        password: passwordHash,
                        createdDate: createdDatee,
                        auth_code: Math.floor(Math.random() * (8549 - 2186 + 1) + 2186),
                        code_try: 0,
                    }


                    const sendEmail = email.sendRegisterEmail(params.email.trim().toLowerCase());

                    if (sendEmail) {
                        response = {
                            status: 400,
                            message: "Email not allow"
                        }
                    }

                    await prisma.users.create({
                        data: payload
                    });

                    response = {
                        status: 200,
                        message: "User Created"
                    }

                } else {
                    response = {
                        status: 409,
                        message: "Email existente"
                    }
                }

            } else {
                response = {
                    status: 400,
                    message: "Validacion fallida"
                }
            }
        } catch (error) {
            console.log(error)

            response = {
                status: 500,
                message: error
            }
        }

        return res.json(response);
    },
    login: async (req, res) => {

        let params = req.body;
        let response = {}

        try {

            const validateEmail = !validator.isEmpty(params.email) && validator.isEmail(params.email);
            const validatePassword = !validator.isEmpty(params.password);

            if (validateEmail && validatePassword) {

                const user = await prisma.users.findUnique({
                    where: {
                        email: params.email
                    }
                });

                if (user && user.eliminado != 1) {

                    if (bcrypt.compareSync(params.password, user.password)) {

                        const token = jwt.token(user)

                        if (user.auth != 1) {
                            return res.json({
                                status: 401,
                                token: token,
                                data: jwt.data(token)
                            })
                        }

                        return res.json({
                            status: 200,
                            token: token,
                            data: jwt.data(token)
                        })

                    } else {
                        return res.json({
                            status: 409,
                            message: "Error al ingresar"
                        })
                    }

                } else {

                    return res.json({
                        status: 409,
                        message: "Error al ingresar"
                    })
                }

            } else {

                return res.json({
                    status: 400,
                    message: "validacion fallida"
                })
            }

        } catch (error) {

            console.log(error)
            return res.json({
                status: 500,
                message: "there has been an error"
            });

        }


        return res.json(response);
    },
    getUser: async (req, res) => {

        let response = {}
        const id = Number(req.params.id)

        try {

            const user = await prisma.users.findUnique({
                where: {
                    id: id
                }
            })
            delete user.password

            if (user) {

                response = {
                    status: 200,
                    data: user
                }

            } else {
                response = {
                    status: 400,
                    message: "User not found"
                }
            }

        } catch (error) {
            console.log(error)
            response = {
                status: 500
            }
        }

        return res.json(response);
    },
    update: async (req, res) => {

        let userUpdate = req.body
        let userId = req.user.id
        const file = req.file
        let imageUrl = null

        if (file) {
            const generatedName = crypto.randomBytes(10).toString('hex') + Date.now().toString()
            imageUrl = generatedName
            const fileBuffer = await sharp(file.buffer)
                .resize({
                    height: 720,
                    width: 1280,
                    fit: 'cover',
                    withoutEnlargement: true
                })
                .toFormat("jpeg", { quality: 80 })
                .toBuffer();
            try {
                await s3.uploadFile(fileBuffer, generatedName, file.mimetype)
            } catch (error) {
                console.log(error)
                return res.json({
                    status: 500,
                    message: "An error has acurred dasdads"
                });
            }
        }

        let data = {
            name: userUpdate.name
        }

        if (imageUrl != null || req.body.image == "delete") {
            data["image"] = imageUrl
            await prisma.users.findFirst({
                where: {
                    id: userId
                }
            }).then(async (data) => {
                await s3.deleteFile(data.image)
            }).catch(error => {
                console.log(error)
            })
        }



        await prisma.users.update({
            where: {
                id: userId
            },
            data: data
        }).then(async (data) => {

            const token = await jwt.token(data)
            return res.json({
                status: 200,
                token: token,
                data: jwt.data(token)
            });
        }).catch(error => {
            console.log(error)
            return res.json({
                status: 500,
                message: "An error has acurred"
            });
        })

    },
    delete: async (req, res) => {

        const user_id = parseInt(req.user.id);

        const [user, cart, notifications, products, purchaseDetail, purchase, wishlist] = await prisma.$transaction([
            prisma.users.update({
                where: {
                    id: user_id
                },
                data: {
                    eliminado: 1
                }
            }),
            prisma.cart.deleteMany({
                where: {
                    user_id: user_id
                }
            }),
            prisma.notifications.deleteMany({
                where: {
                    user_Id: user_id
                }
            }),
            prisma.products.updateMany({
                where: {
                    user_id: user_id
                },
                data: {
                    eliminado: 1
                }
            }),
            prisma.purchase_details.deleteMany({
                where: {
                    purchases: {
                        user_id: user_id
                    }
                }
            }),
            prisma.purchases.deleteMany({
                where: {
                    user_id: user_id
                }
            }),
            prisma.wishlist.deleteMany({
                where: {
                    user_id: user_id
                }
            })
        ])

        return res.json({
            user: user,
            cart: cart,
            notifications: notifications,
            products: products,
            purchase: purchase,
            purchaseDetail: purchaseDetail,
            wishlist: wishlist
        })

    },
    authCode: async (req, res) => {

        let body = req.body;
        let emailValid = false
        let codeValid = false

        try {

            emailValid = validator.isEmail(body.email);
            codeValid = validator.isNumeric(body.auth_code);

        } catch (error) {
            console.log(error)
            return res.json({
                status: 500,
                message: "An error has ocurred"
            })
        }

        if (!emailValid || !codeValid) {
            return res.json({
                status: 409,
                message: "Didn't pass validation"
            })
        }

        await prisma.users.findFirst({
            where: {
                email: body.email
            }
        }).then(async (data) => {

            if (data.code_try > 7) {
                return res.json({
                    status: 429,
                    message: "Cantidad de intentos excedido"
                })
            }

            if (parseInt(data.auth_code) == parseInt(body.auth_code)) {

                await prisma.users.update({
                    where: {
                        email: data.email,
                        auth_code: parseInt(body.auth_code)
                    },
                    data: {
                        auth_code: null,
                        code_try: 0
                    }
                }).then(data => {

                    const token = jwt.token({
                        email: data.email
                    },
                        "1h",
                        process.env.JWTPASSWORD_AUTHCODE
                    )

                    return res.json({
                        status: 200,
                        token: token
                    })

                }).catch(error => {

                    return res.json({
                        status: 500,
                        message: "An error has ocurred"
                    })
                })


            } else {

                await prisma.users.update({
                    where: {
                        email: data.email
                    },
                    data: {
                        code_try: parseInt(data.code_try) + 1
                    }
                }).then(data => {
                    return res.json({
                        status: 400,
                        message: "Incorrect code",

                    })
                }).catch(error => {
                    return res.json({
                        status: 500,
                        message: "An error has ocurred"
                    })
                })

            }
        }).catch(error => {
            return res.json({
                status: 500,
                message: "An error has ocurred"
            })
        })


    },
    createCode: async (req, res) => {

        let body = req.body;
        let emailValid = false;

        try {

            emailValid = validator.isEmail(body.email)

        } catch (error) {
            return res.json({
                status: 500,
                message: "An error has ocurred"
            })
        }

        if (!emailValid) {
            return res.json({
                status: 400,
                message: "Error en la validacion de datos"
            })
        }

        const code = Math.floor(Math.random() * (8549 - 2186 + 1) + 2186);

        await prisma.users.update({
            where: {
                email: body.email
            },
            data: {
                auth_code: code,
                code_try: 0,
            }
        }).then(data => {
            //edgaralaya_01@hotmail.com
            //brayan.alaya@hotmail.com
            //antonyalaya96@gmail.com

            email.sendCode(body.email, code);

            return res.json({
                status: 200,
                message: "Mensaje de verificacion"
            })
        }).catch(error => {
            console.log(error)
            return res.json({
                status: 500,
                message: "An error has ocurred"
            })
        })



    },
    authAccount: async (req, res) => {

        const user = req.user;

        await prisma.users.update({
            where: {
                email: user.email
            },
            data: {
                auth: 1,
                auth_code: null,
                code_try: 0
            }
        }).then(data => {

            if (data.auth == 1) {

                return res.json({
                    status: 200,
                    message: "User authenticaded"
                })

            }
            return res.json({
                status: 500,
                message: "An error has ocurred"
            })
        }).catch(error => {
            return res.json({
                status: 500,
                message: "An error has ocurred"
            })
        })

    },
    changePassword: async (req, res) => {

        const user = req.user
        const body = req.body

        try {

            const passwordValid = validator.isEmpty(body.password.trim())

            if (passwordValid) {
                return res.json({
                    status: 500,
                    message: "An error has ocurred"
                })
            }

        } catch (error) {
            return res.json({
                status: 500,
                message: "An error has ocurred"
            })
        }

        const passwordHash = bcrypt.hashSync(body.password.trim(), bcrypt.genSaltSync(10));

        await prisma.users.update({
            where: {
                email: user.email
            },
            data: {
                password: passwordHash
            }
        }).then(data => {
            return res.json({
                status: 200,
                message: data
            })
        }).catch(error => {
            return res.json({
                status: 500,
                message: "An error has ocurred"
            })
        })

    }
}

