import TestPage from '../pages/Test';
import ExpPage from '../pages/Exp';
import VipPage from '../pages/Vip';
import MinerPage from '../pages/Miner';
import { Route, Routes } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { CharityPage } from '../pages/Charity';
import TokenPage from '../pages/Token';
import GovernancePage from '../pages/Governance';
import { refreshAccessToken } from '../services/api/bridge';
import { useEffect } from 'react';
import { setAccessTokenAtom } from '../atoms/auth';
import { useSetAtom } from 'jotai';
import PlayListPage from '../pages/PlayList';
import SpdPage from '../pages/Spd';
import DonationPlayPage from '../pages/Play/DonationPlay';
import NormalPlayPage from '../pages/Play/NormalPlay';
import VoucherPage from '../pages/Voucher';

export const CommonLayout = () => {
  const setAccessToken = useSetAtom(setAccessTokenAtom);
  // 刷新 access token
  useEffect(() => {
    const refreshToken = async () => {
      const token = await refreshAccessToken();
      if (token) {
        setAccessToken(token);
      }
    };
    refreshToken();
  }, [setAccessToken]);

  return (
    <>
      <Header />
      <main className="font-bold">
        <Routes>
          <Route path="test" element={<TestPage />} />
          <Route path="pool" element={<MinerPage />} />
          <Route path="pools/:pool" element={<MinerPage />} />
          <Route path="pools" element={<MinerPage />} />
          <Route path="play" element={<PlayListPage />} />
          <Route path="play/tables/:id" element={<NormalPlayPage />} />
          <Route path="play/spd-tables/:id" element={<DonationPlayPage />} />
          <Route path="exp" element={<ExpPage />} />
          <Route path="vip" element={<VipPage />} />
          <Route path="charity" element={<CharityPage />} />
          <Route path="charity-governance" element={<GovernancePage />} />
          <Route path="charity-donation" element={<CharityPage />} />
          <Route path="governance" element={<GovernancePage />} />
          <Route path="create-spd-table" element={<SpdPage />} />
          <Route path="token" element={<TokenPage />} />
          <Route path="voucher" element={<VoucherPage />} />
          <Route path="/" element={<PlayListPage />} />
        </Routes>
      </main>
      <Footer mode="sortes" bottomText="©&nbsp;2024&nbsp;Externality Labs" />
    </>
  );
};
