import React, { useRef, useState, useEffect } from 'react';
import LogoSvg from '../../assets/svg/logo-new.svg';
import posterImg from '../../assets/images/distributor/poster.png';
import { QRCode } from 'react-qrcode-logo';
import html2canvas from 'html2canvas';

interface PosterWithQRExporterProps {
  url: string;
}

const PosterWithQRExporter: React.FC<PosterWithQRExporterProps> = ({ url }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const exportImage = async (): Promise<void> => {
    if (!containerRef.current) return;

    setIsExporting(true);
    try {
      const canvas = await html2canvas(containerRef.current, {
        scale: 2, // 提高导出图片的清晰度
        useCORS: true, // 允许加载跨域图片
        allowTaint: true, // 允许加载跨域图片（可能会污染画布）
      });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'poster-with-qr.png';
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('export poster fail:', error);
      throw new Error('export poster fail');
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center">
      <button
        className="flex w-full justify-center rounded-lg bg-[#3370FF] py-2.5 text-center text-sm text-white max-sm:mt-2.5"
        disabled={isExporting}
        onClick={exportImage}
      >
        Download the poster
      </button>
      <div ref={containerRef} className="relative mt-2.5 w-[249px]">
        <img src={posterImg} alt="Poster" className="h-auto w-full" />
        <div className="absolute left-1/2 top-[145px] ml-[0.8px] mt-[0.2px] flex -translate-x-1/2 transform items-center justify-center">
          <QRCode
            value={url}
            size={120}
            logoImage={LogoSvg}
            logoHeight={20}
            logoWidth={20}
            quietZone={2}
            logoPadding={2}
            qrStyle="dots"
            eyeRadius={10}
            ecLevel="H"
            removeQrCodeBehindLogo={true}
            style={{ borderRadius: 10 }}
          />
        </div>
      </div>
    </div>
  );
};

export default PosterWithQRExporter;
