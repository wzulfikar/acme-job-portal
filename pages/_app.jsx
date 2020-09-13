import "rodal/lib/rodal.css";

import "../styles/globals.css";
import "../styles/cards.css";

import { DefaultSeo } from "next-seo";

import seoConfig from "../src/config/seo";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <DefaultSeo {...seoConfig} />
      <Component {...pageProps} className="antialiased" />
    </>
  );
}

export default MyApp;
