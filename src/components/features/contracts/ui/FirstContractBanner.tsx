"use client";
import Link from "next/link";
import { motion } from "framer-motion";

export default function FirstContractBanner() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        backgroundImage: "url('/images/onboarding_bg.png')",
      }}
      className="p-8 rounded-xl space-y-6 bg-cover bg-center bg-no-repeat"
    >
      <div>
        <article className="space-y-2">
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-white sm:text-2xl text-xl font-bold "
          >
            Create your first contract
          </motion.p>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-[#E8E5FA] font-medium text-xs sm:text-sm leading-[120%]"
          >
            You&apos;re one step away! Set up your first contract and start
            managing payroll.
          </motion.p>
        </article>
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        <Link
          href={"/contracts/create"}
          className="inline-flex items-center justify-center px-4 py-2 h-12 ml-auto md:py-2 text-primary-500 bg-white font-medium rounded-full shadow-sm hover:shadow hover:bg-gray-100 focus:outline-none focus:ring-2 transition-all duration-200 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          New contract
        </Link>
      </motion.div>
    </motion.section>
  );
}
