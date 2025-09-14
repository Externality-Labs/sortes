import { Route, Routes } from 'react-router-dom';
import Footer from './layouts/Footer';
import { DesktopHomePage } from './pages/Home/index.tsx';

function Website() {
  return (
    <>
      <main className="flex flex-col">
        <Routes>
          <Route path="/" element={<DesktopHomePage />} />
          <Route path="/home" element={<DesktopHomePage />} />
        </Routes>
      </main>
      <Footer mode="sortes" bottomText="©&nbsp;2024&nbsp;Externality Labs" />
    </>
  );
}

export default Website;
