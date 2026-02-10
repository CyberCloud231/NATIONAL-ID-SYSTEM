import { Routes } from '@angular/router';
import { AuthLogin } from './auth-login/auth-login';
import { AuthSignup } from './auth-signup/auth-signup';
import { HomeDashboard } from './home-dashboard/home-dashboard';
import { PublicLayout } from './public-layout/public-layout';
import { SystemLayout } from './system-layout/system-layout';
import { About } from './about/about';
import { HowToApply } from './how-to-apply/how-to-apply';
import { FAQs } from './faqs/faqs';
import { CardClasses } from './card-classes/card-classes';
import { ImportantInstructions } from './important-instructions/important-instructions';
import { DocRequirements } from './doc-requirements/doc-requirements';
import { TechnicalInfo } from './technical-info/technical-info';
import { SupportCenter } from './support-center/support-center';
import { PaymentProcess } from './payment-process/payment-process';
import { Feedback } from './feedback/feedback';
import { Anouncements } from './anouncements/anouncements';
import { ApplicationForm } from './application-form/application-form';
import { ResumeApplication } from './resume-application/resume-application';

export const routes: Routes = [

  {
    path: '',
    component: PublicLayout,
    children: [
      { path: '', redirectTo: 'about', pathMatch: 'full' },
      { path: 'about', component: About },
      { path: 'how-to-apply', component: HowToApply },
      { path: 'faq', component: FAQs },
      { path: 'card-classes', component: CardClasses },
      { path: 'important-instructions', component: ImportantInstructions },
      { path: 'doc-requirements', component: DocRequirements },
      { path: 'technical-info', component: TechnicalInfo },
      { path: 'support-center', component: SupportCenter },
      { path: 'payment-process', component: PaymentProcess },
      { path: 'feedback', component: Feedback },
      { path: 'announcements', component: Anouncements },
    ]
  },

  { path: 'login', component: AuthLogin },
  { path: 'signup', component: AuthSignup },

  {
    path: 'app',
    component: SystemLayout,
    children: [
      { path: 'dashboard', component: HomeDashboard, data: { showHeader: true } },
      { path: 'resume-application', component: ResumeApplication, data: { showHeader: true } },
      { path: 'apply-form', component: ApplicationForm, data: { showHeader: true } },
    ],
  },

  { path: '**', redirectTo: '' },
];

