'use strict'
const { Resend } = require("resend");
const resend = new Resend("re_g2mqa83b_8QtJFQm2NZYpuDXk68H6zBMK");

module.exports = {
    sendCode: async (email, code) => {
        const { data, error } = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: email,
            subject: 'Hello World',
            html: '<p>Code = ' + code + ', buenas noches</p>'
        });

        if (error) {
            return false
        }

        return true;
    },
    sendRegisterEmail: async (email) => {
        const { data, error } = await resend.emails.send({
            from: 'onboarding@resend.dev',
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