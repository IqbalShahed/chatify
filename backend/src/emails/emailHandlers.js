import { resend, sender } from "../lib/resend.js";
import { createWelcomeEmailTemplate } from "./emailTemplates.js";


export const sendWelcomeEmail = async (email, name, clientURL) => {
    try {
        const { data, error } = await resend.emails.send({
            from: `${sender.name} <${sender.email}>`,
            to: email,
            subject: "Welcome to Chatify!",
            html: `${createWelcomeEmailTemplate(name, clientURL)}`,
        });

        if (error) {
            console.error("Error sending welcome email", error.message);
            return { success: false, message: error.message };
        }

        console.log("Welcome email send successfully", data);
    } catch (error) {
        console.error("Unexpected email send error:", error.message);
        return { success: false, message: error.message };
    }
}