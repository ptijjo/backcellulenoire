/* eslint-disable prettier/prettier */
import { MailService } from '@/services/mail.service';

const mailservice = new MailService();

export async function sendMailActivation(email: string, link: string): Promise<void> {
  const subject = 'Invitation à rejoindre la bibliothèque Cellule noire';

  const content = `
    <p>Bonjour,</p>
    <p>Vous avez été invité(e) à rejoindre la bibliothèque <strong>Cellule noire</strong>.</p>
    <p>Voici comment démarrer :</p>
    <ol>
      <li>Cliquez sur le bouton ci-dessous pour créer votre compte.</li>
      <li>Choisissez un pseudo et un mot de passe sécurisé.</li>
      <li>Explorez la bibliothèque par catégorie ou via la sélection du moment.</li>
      <li>En tant que nouveau lecteur, vous pouvez télécharger <strong>1 livre par mois</strong> : choisissez-le avec soin.</li>
    </ol>
    <p>À très bientôt dans la bibliothèque.</p>
  `;

  const disclaimer = `
    <p>Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail.</p>
  `;

  await mailservice.sendEmail(email, subject, content, link, disclaimer);
}

export async function sendResetPassword(email: string, link: string): Promise<void> {
  const subject = 'Réinitialisation de votre mot de passe — Cellule noire';

  const content = `
    <p>Bonjour,</p>
    <p>Vous avez demandé la réinitialisation de votre mot de passe pour la bibliothèque Cellule noire.</p>
    <p>Cliquez sur le lien ci-dessous pour choisir un nouveau mot de passe :</p>
  `;

  const disclaimer = `
    <p>Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail.</p>
  `;

  await mailservice.sendEmail(email, subject, content, link, disclaimer);
}
