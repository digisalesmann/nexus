import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DashboardLayout } from './DashboardLayout';
import { LanguageProvider } from '../../context/LanguageContext';
import { SwapPage } from '../../pages/SwapPage';
import LandingPage from '../../pages/LandingPage';
import LoginPage from '../../pages/LoginPage';
import SignupPage from '../../pages/SignupPage';
import OverviewPage from '../../pages/OverviewPage';
import AccountsPage from '../../pages/AccountsPage';
import LoansPage from '../../pages/LoansPage';
import HistoryPage from '../../pages/HistoryPage';
import CardsPage from '../../pages/MyCardsPage';
import BeneficiariesPage from '../../pages/BeneficiariesPage';
import ReportsPage from '../../pages/ReportsPage';
import SettingsPage from '../../pages/SettingsPage';
import AddMoneyPage from '../../pages/AddMoneyPage';
import SendPage from '../../pages/SendPage';
import RequestPage from '../../pages/RequestPage';
import ReceivePage from '../../pages/ReceivePage';

export function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>

          {/* Public routes */}
          <Route path="/"       element={<LandingPage />} />
          <Route path="/login"  element={<LoginPage />}   />
          <Route path="/signup" element={<SignupPage />}  />

          {/* Dashboard routes (wrapped in layout) */}
          <Route path="/dashboard" element={<DashboardLayout><OverviewPage /></DashboardLayout>} />
          <Route path="/accounts"    element={<DashboardLayout><AccountsPage /></DashboardLayout>} />
          <Route path="/swap"        element={<DashboardLayout><SwapPage /></DashboardLayout>} />
          <Route path="/transactions"element={<DashboardLayout><HistoryPage /></DashboardLayout>} />
          <Route path="/loans"       element={<DashboardLayout><LoansPage /></DashboardLayout>} />
          <Route path="/cards"       element={<DashboardLayout><CardsPage /></DashboardLayout>} />
          <Route path="/recipients"  element={<DashboardLayout><BeneficiariesPage /></DashboardLayout>} />
          <Route path="/reports"     element={<DashboardLayout><ReportsPage /></DashboardLayout>} />
          <Route path="/settings"    element={<DashboardLayout><SettingsPage /></DashboardLayout>} />
          <Route path="/add-money"   element={<DashboardLayout><AddMoneyPage /></DashboardLayout>} />
          <Route path="/send"        element={<DashboardLayout><SendPage /></DashboardLayout>} />
          <Route path="/request"     element={<DashboardLayout><RequestPage /></DashboardLayout>} />
          <Route path="/receive"     element={<DashboardLayout><ReceivePage /></DashboardLayout>} />

        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}
