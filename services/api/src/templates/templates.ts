import Config from "../config";

const templates = {
    REGISTRATION_CONFIRMATION: `<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </head>
    <body style="margin: 0; padding: 0; background-color: #f6f6f6;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f6f6f6;">
            <tr>
                <td align="center" style="padding: 32px 16px;">
                    <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border: 1px solid #e5e5e5; border-radius: 8px; overflow: hidden;">
                        <tr>
                            <td>
                                <img src="https://reflectionsprojections.org/site/email_header.png" alt="Reflections | Projections 2026" width="600" style="display: block; width: 100%; height: auto; border: 0;" />
                            </td>
                        </tr>
                        <tr>
                            <td style="height: 3px; background-color: #e01e26; font-size: 0; line-height: 0;">&nbsp;</td>
                        </tr>
                        <tr>
                            <td style="padding: 32px 40px 8px 40px; font-family: Arial, Helvetica, sans-serif;">
                                <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #222222;">
                                    Thank you for registering for <strong>R|P&nbsp;2026</strong>. We have received your information and will be sending next steps shortly.
                                </p>
                                <p style="margin: 0 0 8px 0; font-size: 14px; line-height: 22px; color: #555555;">
                                    Need to update your registration?
                                    <a href="${Config.WEB_REGISTER_ROUTE}" style="color: #e01e26; text-decoration: underline;">Return to the registration form</a>
                                    to edit your responses!
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 16px 40px 32px 40px; font-family: Arial, Helvetica, sans-serif;">
                                <h2 style="margin: 16px 0 12px 0; font-size: 13px; line-height: 18px; color: #999999; text-transform: uppercase; letter-spacing: 1.5px; font-weight: bold;">
                                    Registration Details
                                </h2>
                                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top: 1px solid #eeeeee;">
                                <tr>
                                    <td width="180" style="padding: 10px 12px 10px 0; font-size: 14px; color: #888888; border-bottom: 1px solid #f0f0f0; vertical-align: top;">Name</td>
                                    <td style="padding: 10px 0; font-size: 14px; color: #222222; border-bottom: 1px solid #f0f0f0;">{{name}}</td>
                                </tr>
                                <tr>
                                    <td width="180" style="padding: 10px 12px 10px 0; font-size: 14px; color: #888888; border-bottom: 1px solid #f0f0f0; vertical-align: top;">School</td>
                                    <td style="padding: 10px 0; font-size: 14px; color: #222222; border-bottom: 1px solid #f0f0f0;">{{school}}</td>
                                </tr>
                                <tr>
                                    <td width="180" style="padding: 10px 12px 10px 0; font-size: 14px; color: #888888; border-bottom: 1px solid #f0f0f0; vertical-align: top;">Education Level</td>
                                    <td style="padding: 10px 0; font-size: 14px; color: #222222; border-bottom: 1px solid #f0f0f0;">{{educationLevel}}</td>
                                </tr>
                                <tr>
                                    <td width="180" style="padding: 10px 12px 10px 0; font-size: 14px; color: #888888; border-bottom: 1px solid #f0f0f0; vertical-align: top;">Graduation Year</td>
                                    <td style="padding: 10px 0; font-size: 14px; color: #222222; border-bottom: 1px solid #f0f0f0;">{{graduationYear}}</td>
                                </tr>
                                <tr>
                                    <td width="180" style="padding: 10px 12px 10px 0; font-size: 14px; color: #888888; border-bottom: 1px solid #f0f0f0; vertical-align: top;">Majors</td>
                                    <td style="padding: 10px 0; font-size: 14px; color: #222222; border-bottom: 1px solid #f0f0f0;">{{majors}}</td>
                                </tr>
                                <tr>
                                    <td width="180" style="padding: 10px 12px 10px 0; font-size: 14px; color: #888888; border-bottom: 1px solid #f0f0f0; vertical-align: top;">Minors</td>
                                    <td style="padding: 10px 0; font-size: 14px; color: #222222; border-bottom: 1px solid #f0f0f0;">{{minors}}</td>
                                </tr>
                                <tr>
                                    <td width="180" style="padding: 10px 12px 10px 0; font-size: 14px; color: #888888; border-bottom: 1px solid #f0f0f0; vertical-align: top;">Dietary Restrictions</td>
                                    <td style="padding: 10px 0; font-size: 14px; color: #222222; border-bottom: 1px solid #f0f0f0;">{{dietaryRestrictions}}</td>
                                </tr>
                                <tr>
                                    <td width="180" style="padding: 10px 12px 10px 0; font-size: 14px; color: #888888; border-bottom: 1px solid #f0f0f0; vertical-align: top;">Allergies</td>
                                    <td style="padding: 10px 0; font-size: 14px; color: #222222; border-bottom: 1px solid #f0f0f0;">{{allergies}}</td>
                                </tr>
                                <tr>
                                    <td width="180" style="padding: 10px 12px 10px 0; font-size: 14px; color: #888888; border-bottom: 1px solid #f0f0f0; vertical-align: top;">Gender</td>
                                    <td style="padding: 10px 0; font-size: 14px; color: #222222; border-bottom: 1px solid #f0f0f0;">{{gender}}</td>
                                </tr>
                                <tr>
                                    <td width="180" style="padding: 10px 12px 10px 0; font-size: 14px; color: #888888; border-bottom: 1px solid #f0f0f0; vertical-align: top;">Race/Ethnicity</td>
                                    <td style="padding: 10px 0; font-size: 14px; color: #222222; border-bottom: 1px solid #f0f0f0;">{{ethnicity}}</td>
                                </tr>
                                {{#personalLinks.length}}
                                <tr>
                                    <td width="180" style="padding: 10px 12px 10px 0; font-size: 14px; color: #888888; border-bottom: 1px solid #f0f0f0; vertical-align: top;">Personal Links</td>
                                    <td style="padding: 10px 0; font-size: 14px; color: #222222; border-bottom: 1px solid #f0f0f0;">{{#personalLinks}}<a href="{{.}}" style="color: #e01e26; text-decoration: underline;">{{.}}</a><br />{{/personalLinks}}</td>
                                </tr>
                                {{/personalLinks.length}}
                                <tr>
                                    <td width="180" style="padding: 10px 12px 10px 0; font-size: 14px; color: #888888; border-bottom: 1px solid #f0f0f0; vertical-align: top;">Interested in MechMania</td>
                                    <td style="padding: 10px 0; font-size: 14px; color: #222222; border-bottom: 1px solid #f0f0f0;">{{#isInterestedMechMania}}Yes{{/isInterestedMechMania}}{{^isInterestedMechMania}}No{{/isInterestedMechMania}}</td>
                                </tr>
                                <tr>
                                    <td width="180" style="padding: 10px 12px 10px 0; font-size: 14px; color: #888888; border-bottom: 1px solid #f0f0f0; vertical-align: top;">Interested in PuzzleBang</td>
                                    <td style="padding: 10px 0; font-size: 14px; color: #222222; border-bottom: 1px solid #f0f0f0;">{{#isInterestedPuzzleBang}}Yes{{/isInterestedPuzzleBang}}{{^isInterestedPuzzleBang}}No{{/isInterestedPuzzleBang}}</td>
                                </tr>
                                <tr>
                                    <td width="180" style="padding: 10px 12px 10px 0; font-size: 14px; color: #888888; border-bottom: 1px solid #f0f0f0; vertical-align: top;">How did you hear about us</td>
                                    <td style="padding: 10px 0; font-size: 14px; color: #222222; border-bottom: 1px solid #f0f0f0;">{{howDidYouHear}}</td>
                                </tr>
                                <tr>
                                    <td width="180" style="padding: 10px 12px 10px 0; font-size: 14px; color: #888888; border-bottom: 1px solid #f0f0f0; vertical-align: top;">Interest Tags</td>
                                    <td style="padding: 10px 0; font-size: 14px; color: #222222; border-bottom: 1px solid #f0f0f0;">{{tags}}</td>
                                </tr>
                                <tr>
                                    <td width="180" style="padding: 10px 12px 10px 0; font-size: 14px; color: #888888; border-bottom: 1px solid #f0f0f0; vertical-align: top;">Opportunities Interest</td>
                                    <td style="padding: 10px 0; font-size: 14px; color: #222222; border-bottom: 1px solid #f0f0f0;">{{opportunities}}</td>
                                </tr>
                                {{#hasResume}}
                                <tr>
                                    <td width="180" style="padding: 14px 12px 14px 0; font-size: 14px; color: #888888; vertical-align: middle;">Resume</td>
                                    <td style="padding: 14px 0;">
                                        <a href="${Config.WEB_RESUME_ROUTE}" style="display: inline-block; padding: 8px 18px; background-color: #e01e26; color: #ffffff; font-size: 13px; font-weight: bold; text-decoration: none; border-radius: 4px;">View Your Resume</a>
                                    </td>
                                </tr>
                                {{/hasResume}}
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 20px 40px; background-color: #fafafa; border-top: 1px solid #eeeeee; font-family: Arial, Helvetica, sans-serif;">
                                <p style="margin: 0; font-size: 12px; line-height: 18px; color: #999999;">
                                    R|P 2026 &bull; Reflections | Projections &bull; University of Illinois Urbana-Champaign<br />
                                    <a href="https://reflectionsprojections.org" style="color: #999999; text-decoration: underline;">reflectionsprojections.org</a>
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
</html>`,
    REGISTRATION_UPDATE_CONFIRMATION: `<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </head>
    <body style="margin: 0; padding: 0; background-color: #f6f6f6;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f6f6f6;">
            <tr>
                <td align="center" style="padding: 32px 16px;">
                    <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border: 1px solid #e5e5e5; border-radius: 8px; overflow: hidden;">
                        <tr>
                            <td>
                                <img src="https://reflectionsprojections.org/site/email_header.png" alt="Reflections | Projections 2026" width="600" style="display: block; width: 100%; height: auto; border: 0;" />
                            </td>
                        </tr>
                        <tr>
                            <td style="height: 3px; background-color: #e01e26; font-size: 0; line-height: 0;">&nbsp;</td>
                        </tr>
                        <tr>
                            <td style="padding: 32px 40px 8px 40px; font-family: Arial, Helvetica, sans-serif;">
                                <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #222222;">
                                    Your registration information has been updated.
                                </p>
                                <p style="margin: 0 0 8px 0; font-size: 14px; line-height: 22px; color: #555555;">
                                    Need to update your registration (again)?
                                    <a href="${Config.WEB_REGISTER_ROUTE}" style="color: #e01e26; text-decoration: underline;">Return to the registration form</a>
                                    to edit your responses!
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 16px 40px 32px 40px; font-family: Arial, Helvetica, sans-serif;">
                                <h2 style="margin: 16px 0 12px 0; font-size: 13px; line-height: 18px; color: #999999; text-transform: uppercase; letter-spacing: 1.5px; font-weight: bold;">
                                    Registration Details
                                </h2>
                                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top: 1px solid #eeeeee;">
                                <tr>
                                    <td width="180" style="padding: 10px 12px 10px 0; font-size: 14px; color: #888888; border-bottom: 1px solid #f0f0f0; vertical-align: top;">Name</td>
                                    <td style="padding: 10px 0; font-size: 14px; color: #222222; border-bottom: 1px solid #f0f0f0;">{{name}}</td>
                                </tr>
                                <tr>
                                    <td width="180" style="padding: 10px 12px 10px 0; font-size: 14px; color: #888888; border-bottom: 1px solid #f0f0f0; vertical-align: top;">School</td>
                                    <td style="padding: 10px 0; font-size: 14px; color: #222222; border-bottom: 1px solid #f0f0f0;">{{school}}</td>
                                </tr>
                                <tr>
                                    <td width="180" style="padding: 10px 12px 10px 0; font-size: 14px; color: #888888; border-bottom: 1px solid #f0f0f0; vertical-align: top;">Education Level</td>
                                    <td style="padding: 10px 0; font-size: 14px; color: #222222; border-bottom: 1px solid #f0f0f0;">{{educationLevel}}</td>
                                </tr>
                                <tr>
                                    <td width="180" style="padding: 10px 12px 10px 0; font-size: 14px; color: #888888; border-bottom: 1px solid #f0f0f0; vertical-align: top;">Graduation Year</td>
                                    <td style="padding: 10px 0; font-size: 14px; color: #222222; border-bottom: 1px solid #f0f0f0;">{{graduationYear}}</td>
                                </tr>
                                <tr>
                                    <td width="180" style="padding: 10px 12px 10px 0; font-size: 14px; color: #888888; border-bottom: 1px solid #f0f0f0; vertical-align: top;">Majors</td>
                                    <td style="padding: 10px 0; font-size: 14px; color: #222222; border-bottom: 1px solid #f0f0f0;">{{majors}}</td>
                                </tr>
                                <tr>
                                    <td width="180" style="padding: 10px 12px 10px 0; font-size: 14px; color: #888888; border-bottom: 1px solid #f0f0f0; vertical-align: top;">Minors</td>
                                    <td style="padding: 10px 0; font-size: 14px; color: #222222; border-bottom: 1px solid #f0f0f0;">{{minors}}</td>
                                </tr>
                                <tr>
                                    <td width="180" style="padding: 10px 12px 10px 0; font-size: 14px; color: #888888; border-bottom: 1px solid #f0f0f0; vertical-align: top;">Dietary Restrictions</td>
                                    <td style="padding: 10px 0; font-size: 14px; color: #222222; border-bottom: 1px solid #f0f0f0;">{{dietaryRestrictions}}</td>
                                </tr>
                                <tr>
                                    <td width="180" style="padding: 10px 12px 10px 0; font-size: 14px; color: #888888; border-bottom: 1px solid #f0f0f0; vertical-align: top;">Allergies</td>
                                    <td style="padding: 10px 0; font-size: 14px; color: #222222; border-bottom: 1px solid #f0f0f0;">{{allergies}}</td>
                                </tr>
                                <tr>
                                    <td width="180" style="padding: 10px 12px 10px 0; font-size: 14px; color: #888888; border-bottom: 1px solid #f0f0f0; vertical-align: top;">Gender</td>
                                    <td style="padding: 10px 0; font-size: 14px; color: #222222; border-bottom: 1px solid #f0f0f0;">{{gender}}</td>
                                </tr>
                                <tr>
                                    <td width="180" style="padding: 10px 12px 10px 0; font-size: 14px; color: #888888; border-bottom: 1px solid #f0f0f0; vertical-align: top;">Race/Ethnicity</td>
                                    <td style="padding: 10px 0; font-size: 14px; color: #222222; border-bottom: 1px solid #f0f0f0;">{{ethnicity}}</td>
                                </tr>
                                {{#personalLinks.length}}
                                <tr>
                                    <td width="180" style="padding: 10px 12px 10px 0; font-size: 14px; color: #888888; border-bottom: 1px solid #f0f0f0; vertical-align: top;">Personal Links</td>
                                    <td style="padding: 10px 0; font-size: 14px; color: #222222; border-bottom: 1px solid #f0f0f0;">{{#personalLinks}}<a href="{{.}}" style="color: #e01e26; text-decoration: underline;">{{.}}</a><br />{{/personalLinks}}</td>
                                </tr>
                                {{/personalLinks.length}}
                                <tr>
                                    <td width="180" style="padding: 10px 12px 10px 0; font-size: 14px; color: #888888; border-bottom: 1px solid #f0f0f0; vertical-align: top;">Interested in MechMania</td>
                                    <td style="padding: 10px 0; font-size: 14px; color: #222222; border-bottom: 1px solid #f0f0f0;">{{#isInterestedMechMania}}Yes{{/isInterestedMechMania}}{{^isInterestedMechMania}}No{{/isInterestedMechMania}}</td>
                                </tr>
                                <tr>
                                    <td width="180" style="padding: 10px 12px 10px 0; font-size: 14px; color: #888888; border-bottom: 1px solid #f0f0f0; vertical-align: top;">Interested in PuzzleBang</td>
                                    <td style="padding: 10px 0; font-size: 14px; color: #222222; border-bottom: 1px solid #f0f0f0;">{{#isInterestedPuzzleBang}}Yes{{/isInterestedPuzzleBang}}{{^isInterestedPuzzleBang}}No{{/isInterestedPuzzleBang}}</td>
                                </tr>
                                <tr>
                                    <td width="180" style="padding: 10px 12px 10px 0; font-size: 14px; color: #888888; border-bottom: 1px solid #f0f0f0; vertical-align: top;">How did you hear about us</td>
                                    <td style="padding: 10px 0; font-size: 14px; color: #222222; border-bottom: 1px solid #f0f0f0;">{{howDidYouHear}}</td>
                                </tr>
                                <tr>
                                    <td width="180" style="padding: 10px 12px 10px 0; font-size: 14px; color: #888888; border-bottom: 1px solid #f0f0f0; vertical-align: top;">Interest Tags</td>
                                    <td style="padding: 10px 0; font-size: 14px; color: #222222; border-bottom: 1px solid #f0f0f0;">{{tags}}</td>
                                </tr>
                                <tr>
                                    <td width="180" style="padding: 10px 12px 10px 0; font-size: 14px; color: #888888; border-bottom: 1px solid #f0f0f0; vertical-align: top;">Opportunities Interest</td>
                                    <td style="padding: 10px 0; font-size: 14px; color: #222222; border-bottom: 1px solid #f0f0f0;">{{opportunities}}</td>
                                </tr>
                                {{#hasResume}}
                                <tr>
                                    <td width="180" style="padding: 14px 12px 14px 0; font-size: 14px; color: #888888; vertical-align: middle;">Resume</td>
                                    <td style="padding: 14px 0;">
                                        <a href="${Config.WEB_RESUME_ROUTE}" style="display: inline-block; padding: 8px 18px; background-color: #e01e26; color: #ffffff; font-size: 13px; font-weight: bold; text-decoration: none; border-radius: 4px;">View Your Resume</a>
                                    </td>
                                </tr>
                                {{/hasResume}}
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 20px 40px; background-color: #fafafa; border-top: 1px solid #eeeeee; font-family: Arial, Helvetica, sans-serif;">
                                <p style="margin: 0; font-size: 12px; line-height: 18px; color: #999999;">
                                    R|P 2026 &bull; Reflections | Projections &bull; University of Illinois Urbana-Champaign<br />
                                    <a href="https://reflectionsprojections.org" style="color: #999999; text-decoration: underline;">reflectionsprojections.org</a>
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
</html>`,
    REGISTRATION_CONFIRMATION_OLD: `<!DOCTYPE html>
        <html>
            <body>
                <div class="container">
                    <p> Thank you for registering for R|P 2026. We have received your information, and will be sending next steps shortly.  </p>
                    
                    <p> Need to update your registration? Return to the 
                        <a href="${Config.WEB_REGISTER_ROUTE}">registration form</a>
                    to edit your responses!</p>

                    <p> For your reference, your submission included the following information: </p>
                    <ul>
                        <li> <b> Name: </b>  {{name}} </li>
                        <li> <b> School: </b>  {{school}} </li>
                        <li> <b> Education Level: </b>  {{educationLevel}} </li>
                        <li> <b> Graduation Year: </b>  {{graduationYear}} </li>
                        <li> <b> Majors: </b>  {{majors}} </li>
                        <li> <b> Minors: </b>  {{minors}} </li>
                        <li> <b> Dietary Restrictions: </b> {{dietaryRestrictions}} </li>
                        <li> <b> Allergies: </b> {{allergies}} </li>
                        <li> <b> Gender: </b> {{gender}} </li>
                        <li> <b> Race/Ethnicity: </b> {{ethnicity}} </li>
                        {{#personalLinks.length}}
                        <li><b>Personal Links:</b>
                            <ul>
                                {{#personalLinks}}<li><a href="{{.}}">{{.}}</a></li>{{/personalLinks}}
                            </ul>
                        </li>
                        {{/personalLinks.length}}
                        {{#isInterestedMechMania}}
                        <li> <b> Interested in MechMania: </b> Yes </li>
                        {{/isInterestedMechMania}}
                        {{^isInterestedMechMania}}
                        <li> <b> Interested in MechMania: </b> No </li>
                        {{/isInterestedMechMania}}
                        {{#isInterestedPuzzleBang}}
                        <li> <b> Interested in PuzzleBang: </b> Yes </li>
                        {{/isInterestedPuzzleBang}}
                        {{^isInterestedPuzzleBang}}
                        <li> <b> Interested in PuzzleBang: </b> No </li>
                        {{/isInterestedPuzzleBang}}
                        <li> <b> Interest Tags: </b> {{tags}} </li>
                        <li> <b> Opportunities Interest: </b> {{opportunities}} </li>
                        {{#hasResume}}
                        <li>
                            <a href="${Config.WEB_RESUME_ROUTE}">View your uploaded resume</a>
                        </li>
                        {{/hasResume}}
                    </ul>

                </div>
            </body>
        </html>
    `,

    MAGIC_LINK: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{{action}}</title>
        <style>
            body {
                display: flex;
                justify-content: center;
                align-items: center;
                height: 50vh;
                margin: 0;
                font-family: Arial, sans-serif;
                background-color: #f7f7f7;
            }
            .container {
                background-color: #ffffff;
                padding: 20px 40px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                border-radius: 10px;
                text-align: center;
            }
            h2 {
                font-size: 24px;
                color: #333333;
                margin-bottom: 10px;
            }
            .button {
                font-size: 18px;
                font-weight: bold;
                color: #ffffff;
                background-color: #e74c3c;
                padding: 12px 24px;
                border-radius: 5px;
                display: inline-block;
                text-decoration: none;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>{{action}} with Reflections | Projections</h2>
            <p><a class="button" href="{{{link}}}">{{action}}</a></p>
            <p> Note that this link is single use and will expire approximately 10 minutes from now. </p>
            <p> If you did not request this link, you can ignore this email. </p>
        </div>
    </body>
    </html>`,

    SPONSOR_VERIFICATION: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verification Code</title>
        <style>
            body {
                display: flex;
                justify-content: center;
                align-items: center;
                height: 50vh;
                margin: 0;
                font-family: Arial, sans-serif;
                background-color: #f7f7f7;
            }
            .container {
                background-color: #ffffff;
                padding: 20px 40px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                border-radius: 10px;
                text-align: center;
            }
            h1 {
                font-size: 24px;
                color: #333333;
                margin-bottom: 10px;
            }
            .code {
                font-size: 32px;
                font-weight: bold;
                color: #e74c3c;
                letter-spacing: 2px;
                background-color: #f2f2f2;
                padding: 10px 20px;
                border-radius: 5px;
                display: inline-block;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>Here is your <a href="https://sponsor.reflectionsprojections.org/login/">SponsorRP</a> verification code:</h2>
            <div class="code">{{code}}</div>
            <p> Note that this verification code will expire approximately 10 minutes from now. </p>
        </div>
    </body>
    </html>`,
};

export default templates;
