import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider }   from '../../context/AuthContext';
import { LanguageProvider } from '../../context/LanguageContext';
import { ProtectedRoute, PublicOnlyRoute } from '../ProtectedRoute';
import { DashboardLayout } from './DashboardLayout';

import { SwapPage }         from '../../pages/SwapPage';
import LandingPage          from '../../pages/LandingPage';
import LoginPage            from '../../pages/LoginPage';
import SignupPage           from '../../pages/SignupPage';
import ForgotPasswordPage   from '../../pages/ForgotPasswordPage';
import OverviewPage         from '../../pages/OverviewPage';
import AccountsPage         from '../../pages/AccountsPage';
import LoansPage            from '../../pages/LoansPage';
import HistoryPage          from '../../pages/HistoryPage';
import CardsPage            from '../../pages/MyCardsPage';
import BeneficiariesPage    from '../../pages/BeneficiariesPage';
import ReportsPage          from '../../pages/ReportsPage';
import SettingsPage         from '../../pages/SettingsPage';
import AddMoneyPage         from '../../pages/AddMoneyPage';
import SendPage             from '../../pages/SendPage';
import RequestPage          from '../../pages/RequestPage';
import ReceivePage          from '../../pages/ReceivePage';
import ResetPasswordPage    from '../../pages/ResetPasswordPage';
import PrivacyPage          from '../../pages/PrivacyPage';
import TermsPage            from '../../pages/TermsPage';
import ContactPage          from '../../pages/ContactPage';
import CookiesPage          from '../../pages/CookiesPage';
import FaqPage              from '../../pages/FaqPage';
import AccountAgreementPage from '../../pages/AccountAgreementPage';

const dash = (Page: React.ComponentType) => (
  <ProtectedRoute>
    <DashboardLayout>
      <Page />
    </DashboardLayout>
  </ProtectedRoute>
);

export function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/"                element={<LandingPage />} />
            <Route path="/login"           element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
            <Route path="/signup"          element={<PublicOnlyRoute><SignupPage /></PublicOnlyRoute>} />
            <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPasswordPage /></PublicOnlyRoute>} />
            <Route path="/reset-password"  element={<ResetPasswordPage />} />
            <Route path="/privacy"         element={<PrivacyPage />} />
            <Route path="/terms"           element={<TermsPage />} />
            <Route path="/contact"         element={<ContactPage />} />
            <Route path="/cookies"           element={<CookiesPage />} />
            <Route path="/faq"               element={<FaqPage />} />
            <Route path="/account-agreement" element={<AccountAgreementPage />} />

            {/* Protected dashboard */}
            <Route path="/dashboard"    element={dash(OverviewPage)} />
            <Route path="/accounts"     element={dash(AccountsPage)} />
            <Route path="/swap"         element={dash(SwapPage)} />
            <Route path="/transactions" element={dash(HistoryPage)} />
            <Route path="/loans"        element={dash(LoansPage)} />
            <Route path="/cards"        element={dash(CardsPage)} />
            <Route path="/recipients"   element={dash(BeneficiariesPage)} />
            <Route path="/reports"      element={dash(ReportsPage)} />
            <Route path="/settings"     element={dash(SettingsPage)} />
            <Route path="/add-money"    element={dash(AddMoneyPage)} />
            <Route path="/send"         element={dash(SendPage)} />
            <Route path="/request"      element={dash(RequestPage)} />
            <Route path="/receive"      element={dash(ReceivePage)} />
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </AuthProvider>
  );
}
