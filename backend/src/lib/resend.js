import { Resend } from "resend";
import { ENV } from "./env.js";

export const resend = new Resend(ENV.RESEND_API_KEY);

export const sender = {
    email: ENV.RESEND_FROM,
    name: ENV.RESEND_FROM_NAME,

}
