import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { magicLink } from "better-auth/plugins";
import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/resend";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "STUDENT",
        input: false,
      },
      studentId: {
        type: "string",
        required: false,
        unique: true,
        input: true,
      },
      department: {
        type: "string",
        required: false,
        input: true,
      },
      programme: {
        type: "string",
        required: false,
        input: true,
      },
      yearOfStudy: {
        type: "number",
        required: false,
        input: true,
      },
    },
  },
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await resend.emails.send({
          from: "AskHTU <mail@askhtu.com>",
          to: email,
          subject: "Sign in to AskHTU",
          html: `<p>Click the link below to sign in:</p>
                 <a href="${url}">Click here to sign in</a>`,
        });
      },
    }),
    nextCookies(),
  ],
});
