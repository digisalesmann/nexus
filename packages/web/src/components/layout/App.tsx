import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DashboardLayout } from './DashboardLayout';
import { LanguageProvider } from '../../context/LanguageContext';
import { SwapPage } from '../../pages/SwapPage';
import { SuccessPage } from '../../pages/SuccessPage';
import { ReviewPage } from '../../pages/ReviewPage';
import OverviewPage from '../../pages/OverviewPage';
import AccountsPage from '../../pages/AccountsPage';
import LoansPage from '../../pages/LoansPage';
import HistoryPage from '../../pages/HistoryPage';
import MyCardsPage from '../../pages/MyCardsPage';
import BeneficiariesPage from '../../pages/BeneficiariesPage';
import ReportsPage from '../../pages/ReportsPage';
import SettingsPage from '../../pages/SettingsPage';

export function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <DashboardLayout>
          <Routes>
            <Route path="/" element={<OverviewPage />} />
            <Route path="/swap" element={<SwapPage />} />
            <Route path="/swap/review" element={<ReviewPage />} />
            <Route path="/swap/success" element={<SuccessPage />} />
            <Route path="/accounts" element={<AccountsPage />} />
            <Route path="/loans" element={<LoansPage />} />
            <Route path="/transactions" element={<HistoryPage />} />
            <Route path="/cards" element={<MyCardsPage />} />
            <Route path="/recipients" element={<BeneficiariesPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </DashboardLayout>
      </BrowserRouter>
    </LanguageProvider>
  );
}