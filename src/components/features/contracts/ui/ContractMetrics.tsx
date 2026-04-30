"use client";
import { motion } from "framer-motion";
import { contractMetricsData } from "@/constants";
import { CardSkeleton } from "@/components/ui/skeleton";

export default function ContractMetrics({ loading = false }: { loading?: boolean }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 15 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex w-full gap-4 mb-4 overflow-x-auto max-w-screen sm:grid sm:grid-cols-2 xl:grid-cols-4 sm:overflow-x-visible"
    >
      {loading ? (
        Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="w-full min-w-3xs">
            <CardSkeleton />
          </div>
        ))
      ) : (
        contractMetricsData.map((metric) => (
          <motion.div
            variants={itemVariants}
            key={metric.title}
            className="w-full min-w-3xs"
          >
            <div className="h-full p-4 bg-white rounded-lg min-w-60 lg:w-full shadow-sm hover:shadow transition-shadow dark:bg-gray-900">
              <span className="flex justify-between text-xs font-medium">
                <p className="text-text-subtext dark:text-gray-400">
                  {metric.title}
                </p>
                <p className="text-[#7F8C9F] dark:text-gray-500">This year</p>
              </span>
              <hr className="my-4 text-border-primary dark:border-gray-800" />
              <div className="flex items-center justify-between">
                <span>
                  <p className="mb-1 text-2xl font-bold text-text-header lg:tracking-tight lg:text-3xl dark:text-white">
                    {metric.value}
                  </p>
                  <p className="text-sm font-medium text-[#7F8C9F] dark:text-gray-400">
                    {metric.subValue}
                  </p>
                </span>
                <span className="text-primary-500">{metric.icon}</span>
              </div>
            </div>
          </motion.div>
        ))
      )}
    </motion.div>
  );
}
