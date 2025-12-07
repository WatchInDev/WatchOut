import { AccountSettings } from "./AccountSettings";
import { NotificationSettings } from "./notifications/NotificationSettings";

export const settingsRoutes = [
  {
    icon: 'account-circle',
    label: 'Konto',
    component: AccountSettings,
    link: 'AccountSettings',
  },
  {
    icon: 'bell',
    label: 'Powiadomienia',
    component: NotificationSettings,
    link: 'NotificationSettings',
  },
];