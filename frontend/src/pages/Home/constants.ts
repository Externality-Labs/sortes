import { appPage } from '../../utils/env';
import whitepaper from '../../assets/whitepaper.pdf';
import Links from '../../utils/links';

export const linkData = [
  { href: '/', text: 'Home', isSpecial: false },
  { href: `${appPage}/play`, text: 'Launch App', isSpecial: true },
  { href: whitepaper, text: 'Whitepaper', isSpecial: false },
  { href: Links.Tokenomic, text: 'Tokenomic', isSpecial: false },
  { href: Links.Gitbook, text: 'Docs', isSpecial: false },
  { href: Links.Github, text: 'Github', isSpecial: false },
];
