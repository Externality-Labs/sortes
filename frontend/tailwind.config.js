/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'selector',
  theme: {
    extend: {
      screens: {
        '3xl': '1740px',
      },
      backgroundImage: {
        'distributor-banner':
          "url('/src/assets/images/distributor/banner.png')",
      },

      fontFamily: {
        roboto: ['Roboto', 'sans-serif'],
        avenir: ['avenir', 'sans-serif'],
        montserrat: 'Montserrat',
        public_sans: 'Public Sans',
        pingfang: 'PingFang SC',
        'sf-compact': ['"SF Compact"', 'sans-serif'],
      },
      zIndex: {
        modal0: '1000',
        modal1: '2000',
        modal2: '3000',
        modal3: '4000',
        modal4: '5000',
        modal5: '6000',
      },
      boxShadow: {
        card: '2px 2px 4px 2px rgba(24,144,255,0.25)',
        voucher: '2px 2px 4px 2px rgba(123,97,255,0.25)',
      },
      colors: {
        transparent: 'transparent',

        primary: '#00997F',
        primary2: '#009980',
        secondary: '#00332B',
        tertiary: '#096657',
        quaternary: '#00CCAA',
        mainV1: '#7B61FF',

        reward0: '#fff',
        reward1: '#768595',
        reward2: '#1F5C99',
        reward3: '#008059',
        reward4: '#93733E',
        reward5: '#BA2538',
        rewardText: '#FFB580',

        blue0: '#5962BA',

        white: '#fff',
        dark0: '#F1F1F5',
        dark1: '#DFE3EB',
        dark2: '#BCC2CC',
        dark3: '#848999',
        dark4: '#1B1F26',
        dark5: '#0B101B',

        text1: '#202020',
        text2: '#666666',
        text3: '#FFA000',

        link: '#1890FF',
        warning: '#FF8833',
        error: '#FF4D4F',

        yellow2: '#FFDD21',

        purple0: '#4B3D9F',

        border0: '#D9D9D9',
        border1: '#E7E7E9',

        bg1: '#F8F8F8',
        bg2: '#0CA',
        bg3: '#ECECEC',

        // swap
        pink: '#FF48B5',

        swapGradient:
          'linear-gradient(273deg, rgba(255, 90, 116, 0.12) 0%, rgba(185, 80, 240, 0.12) 50.65%, rgba(58, 78, 255, 0.12) 100%), var(--Neutral-000, #FFF)',
      },
      keyframes: {
        broadcast: {
          from: {
            'margin-left': '100vw',
          },
          to: {
            'margin-left': '-100%',
          },
        },
        dropdown: {
          from: {
            height: '0px',
          },
          to: {
            height: 'auto',
          },
        },
        sidebarIn: {
          from: {
            width: '0px',
          },
          to: {
            width: '144px',
          },
        },
        sidebarOut: {
          from: {
            width: '144px',
          },
          to: {
            width: '0px',
          },
        },
        collapsePlayCardOut: {
          from: {
            width: '192px',
          },
          to: {
            width: '0px',
          },
        },
        collapsePlayCardIn: {
          from: {
            width: '0px',
          },
          to: {
            width: '192px',
          },
        },
      },
    },
  },
  plugins: [],
};
