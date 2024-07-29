'use strict'
const { Resend } = require("resend");
const resend = new Resend("re_99oJrBqa_GdGe6C5QPNQuYP7ci9DY9d5a");
const emailDomain = "@mail.brayanalaya.dev"

module.exports = {
    sendCode: async (email, code) => {
        const { data, error } = await resend.emails.send({
            from: 'noreplay' + emailDomain,
            to: email,
            subject: 'Funciona',
            html: '<p>Por fin funacionaaaaa ya puedo enviar emails!!!!!!!</p>'
        });

        if (error) {
            return false
        }

        return true;
    },
    sendRegisterEmail: async (email) => {
        const { data, error } = await resend.emails.send({
            from: 'noreplay' + emailDomain,
            to: email,
            subject: 'Hello World',
            html: '<p>Tu cuenta ha sido creada</p>'
        });

        if (error) {
            return false
        }

        return true;
    }
}    