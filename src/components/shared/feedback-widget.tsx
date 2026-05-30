"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquarePlus,
  X,
  Bug,
  Lightbulb,
  MessageCircle,
  Send,
} from "lucide-react";
import { HeadPhoneIcon } from "@/../public/svg";

type FeedbackType = "Bug" | "Feature" | "General";

export function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<FeedbackType>("General");
  const [message, setMessage] = useState("");

  const toggleOpen = () => setIsOpen((prev) => !prev);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      return;
    }
    
    console.log("Feedback sent:", { type: feedbackType, message });
    setMessage("");
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="mb-4 w-[340px] origin-bottom-right rounded-2xl bg-[#1A1D21] p-5 shadow-2xl border border-white/10 text-white"
          >
            <div className="mb-5">
              <h3 className="text-lg font-semibold text-white">
                Send us feedback
              </h3>
              <p className="text-sm text-gray-400">
                We'd love to hear from you
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type Selection */}
              <div className="flex gap-2">
                {(
                  [
                    { id: "Bug", icon: Bug, label: "Bug" },
                    { id: "Feature", icon: Lightbulb, label: "Feature" },
                    { id: "General", icon: MessageCircle, label: "General" },
                  ] as const
                ).map((type) => {
                  const Icon = type.icon;
                  const isActive = feedbackType === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setFeedbackType(type.id)}
                      className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? "border-[#A855F7] text-[#A855F7] bg-[#A855F7]/10"
                          : "border-white/10 text-gray-400 hover:bg-white/5"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {type.label}
                    </button>
                  );
                })}
              </div>

              {/* Textarea */}
              <div className="relative">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what's on your mind..."
                  rows={4}
                  className="w-full resize-none rounded-lg border border-white/10 bg-black/40 p-3 text-sm text-white placeholder-gray-500 focus:border-[#A855F7] focus:outline-none focus:ring-1 focus:ring-[#A855F7]"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#5E2A8C] py-3 font-medium text-white transition-colors hover:bg-[#7C3AED]"
              >
                <Send className="h-4 w-4" />
                Send Feedback
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB Container */}
      <div className="relative flex h-14 w-14 items-center justify-center">
        {/* Ripple Effect (Ping) */}
        {!isOpen && (
          <div className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#5E2A8C] opacity-75 duration-1000" />
        )}

        <motion.button
          onClick={toggleOpen}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative flex h-full w-full items-center justify-center rounded-full bg-[#5E2A8C] text-white shadow-xl hover:shadow-2xl transition-all"
        >
          <motion.div
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {isOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <div className="relative bottom-[3px] right-px">
                <HeadPhoneIcon />
              </div>
            )}
          </motion.div>
        </motion.button>
      </div>
    </div>
  );
}
