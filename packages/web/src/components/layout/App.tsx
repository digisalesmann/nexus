import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DashboardLayout } from './DashboardLayout';
import { LanguageProvider } from '../../context/LanguageContext';
import { SwapPage } from '../../pages/SwapPage';
import OverviewPage from '../../pages/OverviewPage';
import AccountsPage from '../../pages/AccountsPage';
import LoansPage from '../../pages/LoansPage';
import HistoryPage from '../../pages/HistoryPage';
import CardsPage from '../../pages/MyCardsPage';
import BeneficiariesPage from '../../pages/BeneficiariesPage';
import ReportsPage from '../../pages/ReportsPage';
import SettingsPage from '../../pages/SettingsPage';
import AddMoneyPage from '../../pages/AddMoneyPage';

export function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <DashboardLayout>
          <Routes>
            <Route path="/"            element={<OverviewPage />}       />
            <Route path="/accounts"    element={<AccountsPage />}       />
            <Route path="/swap"        element={<SwapPage />}           />
            <Route path="/transactions"element={<HistoryPage />}        />
            <Route path="/loans"       element={<LoansPage />}          />
            <Route path="/cards"       element={<CardsPage />}          />
            <Route path="/recipients"  element={<BeneficiariesPage />}  />
            <Route path="/reports"     element={<ReportsPage />}        />
            <Route path="/settings"    element={<SettingsPage />}       />
            <Route path="/add-money"   element={<AddMoneyPage />}       />
          </Routes>
        </DashboardLayout>
      </BrowserRouter>
    </LanguageProvider>
  );
}