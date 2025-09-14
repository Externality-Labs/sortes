import { Route, Routes } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import PolicyPage from '../pages/Policy';

const UnsupportedLayout = () => {
  return (
    <>
      <Header />
      <main className="font-bold">
        <Routes>
          <Route path="*" element={<PolicyPage />} />
        </Routes>
      </main>
      <Footer mode="sortes" bottomText="©&nbsp;2024&nbsp;Externality Labs" />
    </>
  );
};

export default UnsupportedLayout;
