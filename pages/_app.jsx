import "rodal/lib/rodal.css";

import "../styles/globals.css";
import "../styles/cards.css";

import Head from 'next/head'
import { DefaultSeo } from "next-seo";

import seoConfig from "../src/config/seo";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>{seoConfig.openGraph.title} | React Spring x Tailwind x NextJS</title>
      </Head>
      <DefaultSeo {...seoConfig} />
      <Component {...pageProps} className="antialiased" />
    </>
  );
}

export default MyApp;
