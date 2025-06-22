"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

interface FAQItemProps {
    question: string;
    answer: string;
    index: number;
}

function FAQItem({ question, answer, index }: FAQItemProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.3,
                delay: index * 0.15,
                ease: "easeOut",
            }}
            className={cn(
                "group rounded-lg border-[0.5px] border-gray-200 dark:border-gray-700",
                "transition-all duration-200 ease-in-out",
                isOpen
                    ? "bg-white dark:bg-gray-800/50 shadow-sm"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800/30"
            )}
        >
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-6 py-4 flex items-center justify-between gap-4"
            >
                <h3
                    className={cn(
                        "text-base font-medium transition-colors duration-200 text-left",
                        "text-gray-700 dark:text-gray-300",
                        isOpen && "text-gray-900 dark:text-white"
                    )}
                >
                    {question}
                </h3>
                <motion.div
                    animate={{
                        rotate: isOpen ? 180 : 0,
                        scale: isOpen ? 1.1 : 1,
                    }}
                    transition={{
                        duration: 0.3,
                        ease: "easeInOut",
                    }}
                    className={cn(
                        "p-0.5 rounded-full shrink-0",
                        "transition-colors duration-200",
                        isOpen
                            ? "text-gray-900 dark:text-white"
                            : "text-gray-400 dark:text-gray-500"
                    )}
                >
                    <ChevronDown className="h-4 w-4" />
                </motion.div>
            </button>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{
                            height: "auto",
                            opacity: 1,
                            transition: {
                                height: {
                                    duration: 0.4,
                                    ease: [0.04, 0.62, 0.23, 0.98],
                                },
                                opacity: {
                                    duration: 0.25,
                                    delay: 0.1,
                                },
                            },
                        }}
                        exit={{
                            height: 0,
                            opacity: 0,
                            transition: {
                                height: {
                                    duration: 0.3,
                                    ease: "easeInOut",
                                },
                                opacity: {
                                    duration: 0.25,
                                },
                            },
                        }}
                    >
                        <div className="px-6 pb-4 pt-2">
                            <motion.p
                                initial={{ y: -8, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -8, opacity: 0 }}
                                transition={{
                                    duration: 0.3,
                                    ease: "easeOut",
                                }}
                                className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed"
                            >
                                {answer}
                            </motion.p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

function FAQ() {
    const faqs: Omit<FAQItemProps, "index">[] = [
        {
            question: "What study materials are available on Ziora?",
            answer: "Ziora provides comprehensive study materials including video lectures, detailed notes, previous year questions (PYQs), important questions, flashcards, and practice tests across multiple subjects. All materials are curated by expert educators and updated regularly.",
        },
        {
            question: "Can I access Ziora on my mobile device?",
            answer: "Yes! Ziora is fully optimized for mobile learning. You can access all study materials, watch videos, take notes, and track your progress on any device - smartphone, tablet, or computer. Your data syncs seamlessly across all devices.",
        },
        {
            question: "How does the progress tracking work?",
            answer: "Ziora tracks your learning journey with detailed analytics including study time, quiz scores, topic completion rates, and performance trends. You'll receive personalized insights and recommendations to improve your learning efficiency.",
        },
        {
            question: "Are the video lectures available offline?",
            answer: "Yes, you can download video lectures and study materials for offline access. This feature ensures you can continue learning even without an internet connection, perfect for studying on the go.",
        },
        {
            question: "What subjects and courses does Ziora cover?",
            answer: "Ziora covers a wide range of subjects including Mathematics, Physics, Chemistry, Biology, Computer Science, and more. We offer content for various competitive exams, school curricula, and skill development courses.",
        },
        {
            question: "How often are PYQs and study materials updated?",
            answer: "Our content team regularly updates previous year questions and study materials. PYQs are added immediately after each exam session, and study materials are revised based on the latest curriculum changes and student feedback.",
        },
        {
            question: "Is there any mentorship or doubt support available?",
            answer: "Yes, Ziora offers multiple support channels including live doubt sessions, discussion forums, mentor consultations, and 24/7 chat support. You can get help from expert educators and connect with fellow learners.",
        },
        {
            question: "What makes Ziora different from other learning platforms?",
            answer: "Ziora focuses on comprehensive exam preparation with a unique combination of AI-powered personalization, extensive PYQ database, mobile-first design, and collaborative learning features. We prioritize practical learning with real-world applications.",
        },
    ];

    return (
        
            <div className="container px-4 mx-auto mb-16 max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-2xl mx-auto text-center mb-16"
                >
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-300">
                        Everything you need to know about learning with Ziora
                    </p>
                </motion.div>

                <div className="max-w-3xl mx-auto space-y-3">
                    {faqs.map((faq, index) => (
                        <FAQItem key={index} {...faq} index={index} />
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="max-w-md mx-auto mt-16 p-8 rounded-xl text-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
                >
                    <div className="inline-flex items-center justify-center p-3 rounded-full bg-gray-100 dark:bg-gray-700 mb-6">
                        <Mail className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Still have questions?
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                        Our support team is here to help you succeed in your learning journey
                    </p>
                    <button
                        type="button"
                        className={cn(
                            "px-6 py-3 text-sm rounded-lg w-full",
                            "bg-black dark:bg-white text-white dark:text-black",
                            "hover:bg-gray-800 dark:hover:bg-gray-100",
                            "transition-colors duration-200",
                            "font-medium"
                        )}
                    >
                        Contact Support
                    </button>
                </motion.div>
            </div>
        
    );
}

export default FAQ;
