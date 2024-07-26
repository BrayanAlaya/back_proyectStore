const { isEmpty } = require("validator");
const prisma = require("../orm");

module.exports = {
    createCategory: async (req, res) => {

        let response = {}
        let body = req.body

        try {

            const nameValidate = !isEmpty(body.name)
            
            if (nameValidate) {
                
                const responseQuery = await prisma.categories.create({
                    data: body
                })

                if (responseQuery) {

                    response = {
                        status: 200,
                        data: responseQuery
                    }                    
                } else{
                    response = {
                        status: 500
                    }
                }


            } else{
                response = {
                    status: 400,
                    message: "Validation failed"
                }
            }

        } catch (error) {
            response = {
                status: 500
            }            
        }

        res.json(response)
    },
    
    getCategories: async (req, res) => {

        let response = {}

        try {
            
            const categories = await prisma.categories.findMany()

            if (categories.length != 0) {
                response = {
                    status: 200,
                    data: categories
                }
            } else{
                response = {
                    status: 400,
                    message: "No categories"
                }
            }

        } catch (error) {
            response = {
                status: 500
            }
        }

        res.json(response)
    },

    updateCategory: async (req,res) => {

        let response = {}
        const body = req.body
        const id = req.params.id

        try {

            const nameValidate = !isEmpty(body.name)
            
            if (nameValidate) {
                
             
                await prisma.categories.update({
                    where: {
                        id: Number(id)
                    },
                    data: {
                        name: body.name
                    }
                }).then( data => {

                    response = {
                        status: 200,
                        data: data
                    }

                }). catch(error => {
                    console.log(error)

                    response = {
                        status: 400
                    }
                })

            } else{
                response = {
                    status: 400,
                    message: "Validation failed"
                }
            }

        } catch (error) {
            console.log(error)

            response = {
                status: 500
            }            
        }

        return res.json(response)
    },

    getCategory: async (req,res) => {

        const id = Number(req.params.id)

        await prisma.categories.findUnique({
            where: {
                id:id
            }
        }).then(data => {
            if (data) {
                return res.json({
                    status: 200,
                    data: data
                })
            } else{
                return res.json({
                    status: 400
                })
            }
        }).catch(error => {
            return res.json({
                status: 500
            })
        })

    }

}
