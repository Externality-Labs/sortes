import { Route, Routes } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import TouristPage from '../pages/Tourist';
import MinerPage from '../pages/Miner';
import ConnectWalletPopup from '../components/ConnectWalletPopup';

export const TouristLayout = () => {
  return (
    <>
      <Header />
      <main className="font-bold">
        <ConnectWalletPopup />
        <Routes>
          <Route path="pools" element={<MinerPage />} />
          <Route path="pools/:pool" element={<MinerPage />} />
          <Route path="*" element={<TouristPage />} />
        </Routes>
      </main>
      <Footer mode="sortes" bottomText="©&nbsp;2024&nbsp;Externality Labs" />
    </>
  );
};
