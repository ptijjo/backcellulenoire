/* eslint-disable prettier/prettier */
import { MailService } from '@/services/mail.service';

const mailservice = new MailService();

export async function sendMailActivation(email: string, link: string): Promise<void> {
  const subject = 'Invitation à rejoindre la bibliothèque de cellule noire';

  const content = `
    <p>Bonjour !</p>
    <p> Vous avez été invité à rejoindre  la bibliothèque de cellule noire </p>
    <p>Pour cela, cliquez sur le lien ci-dessous : </p>
  `;

  const disclaimer = `
  <p>Si vous n'ètes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail.</p>
    `;

  const envoi = await mailservice.sendEmail(email, subject, content, link, disclaimer);

  console.log(envoi);
}
