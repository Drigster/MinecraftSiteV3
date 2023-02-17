import dotenv from 'dotenv';

dotenv.config();

export function buildVerification(token) {
    return `<!DOCTYPE html>
    <html
        lang="en"
        xmlns:v="urn:schemas-microsoft-com:vml"
        style="color-scheme: light dark; width: 100%; max-width: 100%; overflow-x: hidden; height: 100%">
        <head>
            <meta charset="utf-8">
            <meta name="x-apple-disable-message-reformatting">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no">
            <meta name="color-scheme" content="light dark">
            <meta
            name="supported-color-schemes" content="light dark">
            <!-- [if mso]> <noscript> <xml>
                <o:OfficeDocumentSettings xmlns:o="urn:schemas-microsoft-com:office:office">
                  <o:PixelsPerInch>96</o:PixelsPerInch>
                </o:OfficeDocumentSettings>
            </xml> </noscript> <style> td,th,div,p,a,h1,h2,h3,h4,h5,h6 {font-family: "Segoe UI", sans-serif; mso-line-height-rule:
            exactly;} </style> <![endif] -->
            <title>Confirm your email address</title>
            <style>:root
            {
                color-scheme: light dark;
            }
            h1,
            h2,
            h3,
            h4,
            h5,
            h6 {
                font-size: inherit;
                font-weight: 400;
                color: #fc6f53;
            }
            .body {
                display: flex;
                flex-direction: column;
                position: relative;
                min-height: 100%;
                font-family: 'minecraft';
                color: #3eb9e5;
                background-color: #404040;
                background-image: url("../img/Background.png");
                background-size: cover;
                background-repeat: no-repeat;
                background-position: center, top;
                background-attachment: fixed;
            }
            button {
                margin-top: 4px;
                margin-bottom: 4px;
                color: #3eb9e5;
                background-color: #101010 !important;
                border-width: 1px;
                border-color: #fc6f53;
                border-radius: 6px;
                padding: 8px;
            }
            button:hover {
                background-color: rgba(255, 255, 255, 0.05);
            }
        </style>
    </head>
    <body style="max-width: 100%; overflow-x: hidden; height: 100%; -webkit-font-smoothing: antialiased; word-break: break-word;
            margin: 0; width: 100%; padding: 0; color: #3eb9e5">
        <div style="display: none">
            Для продолжения необходимо подтвердить почту. &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847;
            &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847;
            &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847;
            &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847;
            &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847;
            &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847;
            &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847;
            &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847;
            &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847;
            &#847; &#847; &#847; &#847;
        </div>
        <div role="article" aria-roledescription="email" aria-label="Подтвердите свою почту" lang="en">
            <table
                style="width: 100%; font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif"
                cellpadding="0"
                cellspacing="0"
                role="presentation">
                <tr>
                    <td align="center" style="background-color: #404040;">
                        <table class="sm-w-full" style="max-width: 600px" cellpadding="0" cellspacing="0" role="presentation">
                            <table>
                                <tr>
                                    <td class="sm-py-8 sm-px-6" style="padding: 48px; text-align: center">
                                        <a href="https://disepvp.ee/">
                                            <img
                                                src="https://disepvp.ee/img/logo.png"
                                                width="100"
                                                alt="disepvp"
                                                style="border: 0; max-width: 100%; vertical-align: middle">
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            <table>
                                <tr>
                                    <td align="center" class="sm-px-6">
                                        <table style="width: 100%" cellpadding="0" cellspacing="0" role="presentation">
                                            <tr>
                                                <td
                                                    class="sm-px-6"
                                                    style="border-radius: 4px; background-color: rgba(0,0,0,0.6); padding: 48px; text-align: left; font-size: 16px;
                                                        line-height: 24px; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05)">
                                                    <p>
                                                        Привет игрок!
                                                    </p>
                                                    <p class="sm-leading-8" style="margin: 0; margin-bottom: 24px; font-size: 24px; font-weight: 600">
                                                        Для продолжения необходимо подтвердить почту.
                                                    </p>
                                                    <p style="margin: 0">
                                                        Для подтверждения нажмите на кнопку ниже.
                                                    </p>
                                                    <p style="margin: 0; margin-bottom: 24px">
                                                        Ссылка действует 15 минут
                                                    </p>
                                                    <div style="line-height: 100%">
                                                        <a
                                                            href="${process.env.BASE_URL}/verify/${token}" style="cursor: pointer">
                                                            <!-- [if mso]>
                                                                <i style="mso-text-raise: 30px; letter-spacing: 24px">&#8202;</i>
                                                            <![endif] -->
                                                            <button style="margin-top: 4px; margin-bottom: 4px; color: #3eb9e5; border-width: 1px; border-color: #fc6f53; border-radius: 6px;
                                                                    padding: 8px; mso-text-raise: 16px; background-color: #101010; cursor: pointer">
                                                                Подтвердить почту &rarr;</button>
                                                            <!-- [if mso]>
                                                                <i style="letter-spacing: 24px">&#8202;</i>
                                                            <![endif] -->
                                                        </a>
                                                    </div>
                                                    <table role="separator" style="width: 100%" cellpadding="0" cellspacing="0">
                                                        <tr>
                                                            <td style="padding-top: 32px; padding-bottom: 32px">
                                                                <div style="height: 1px; background-color: #e2e8f0; line-height: 1px">&zwnj;</div>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                    <p style="margin: 0; margin-bottom: 16px">
                                                        В случае проблем с кнопкой вставьте данную сылку в браузер:
                                                    </p>
                                                    <p style="color: gray; margin: 0; margin-bottom: 16px">
                                                        ${process.env.BASE_URL}/verify/${token}
                                                    </p>
                                                    <p style="margin: 0; margin-bottom: 16px">
                                                        Спасибо, <br>Команда Disepvp
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>
                                        <table>
                                            <tr role="separator">
                                                <td style="height: 48px"></td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </table>
                    </td>
                </tr>
            </table>
        </div>
    </body></html>`
}