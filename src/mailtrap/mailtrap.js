import { MailtrapClient } from "mailtrap";
import dotenv from "dotenv";

dotenv.config();

const TOKEN = process.env.MAILTRAP_TOKEN;

if (!TOKEN) {
  throw new Error("MAILTRAP_TOKEN is missing in .env file");
}

const client = new MailtrapClient({
  token: TOKEN,
});



export default sendEmail;
