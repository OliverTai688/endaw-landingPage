"use server";

import nodemailer from "nodemailer";

export async function sendFeedbackEmail(formData: {
    page: string;
    pageUrl: string;
    elementContext: string;
    suggestionType: string;
    content: string;
    imageLink?: string;
    screenshot?: string; // base64 string
}) {
    const { page, pageUrl, elementContext, suggestionType, content, imageLink, screenshot } = formData;

    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD,
            },
        });

        const subject = `[Admin Feedback] ${page} - ${suggestionType}`;
        const html = `
            <h2>New Page Feedback</h2>
            <p><strong>Page:</strong> ${page}</p>
            <p><strong>URL:</strong> <a href="${pageUrl}">${pageUrl}</a></p>
            <p><strong>Suggestion Type:</strong> ${suggestionType}</p>
            <p><strong>Context/Element:</strong> ${elementContext}</p>
            <p><strong>Suggestion:</strong></p>
            <p>${content.replace(/\n/g, "<br>")}</p>
            ${imageLink ? `<p><strong>Requested Image Link:</strong> ${imageLink}</p>` : ""}
            ${screenshot ? `<p><strong>Visual Context:</strong> See attached screenshot.</p>` : ""}
            <br/>
            <small>This feedback was sent from the Admin Feedback system.</small>
        `;

        const attachments = [];
        if (screenshot) {
            // Remove the data:image/png;base64, prefix
            const base64Data = screenshot.replace(/^data:image\/\w+;base64,/, "");
            attachments.push({
                filename: 'screenshot.png',
                content: Buffer.from(base64Data, 'base64'),
                contentType: 'image/png'
            });
        }

        await transporter.sendMail({
            from: `"ENDAW Admin Feedback" <${process.env.GMAIL_USER}>`,
            to: process.env.CONTACT_RECEIVER_EMAIL,
            subject: subject,
            html: html,
            attachments: attachments
        });

        return { success: true };
    } catch (error: any) {
        console.error("FEEDBACK EMAIL ERROR:", error);
        return { success: false, error: error.message };
    }
}
