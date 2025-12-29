import Head from 'next/head'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import nextI18NextConfig from '../next-i18next.config'

import siteConfig from '../config/site.config'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function Custom500() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-gray-900">
      <Head>
        <title>500 - {siteConfig.title}</title>
      </Head>

      <main className="flex w-full flex-1 flex-col bg-gray-50 dark:bg-gray-800">
        <Navbar />
        <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center py-4 sm:p-4">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-gray-900 dark:text-gray-100">500</h1>
            <h2 className="mt-4 text-2xl font-semibold text-gray-700 dark:text-gray-300">Internal Server Error</h2>
            <p className="mt-4 text-gray-500 dark:text-gray-400">
              Something went wrong on our end. Please try again later.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'], nextI18NextConfig)),
    },
  }
}