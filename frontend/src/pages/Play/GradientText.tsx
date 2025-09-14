import { ReactNode } from 'react';

const GradientText = ({ children }: { children: ReactNode }) => {
  return (
    <span
      className="bg-clip-text text-transparent"
      style={{
        backgroundImage:
          'linear-gradient(289deg, #1CADFF 11.56%, #DBFF00 150.15%)',
      }}
    >
      {children}
    </span>
  );
};

export default GradientText;
