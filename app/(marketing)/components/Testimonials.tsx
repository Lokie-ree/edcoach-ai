"use client"
import React from "react"
import { Section } from "@/components/ui/section"
import { Card } from "@/components/ui/card"
import { BorderBeam } from "@/components/magicui/border-beam"
import landingContent from "@/data/landing-content.json"
import { motion } from "framer-motion"
import { Quote } from "lucide-react"

// Generate gradient colors based on index
const getGradientColors = (index: number) => {
  const gradients = [
    { from: "#6366F1", to: "#8B5CF6" }, // indigo to purple
    { from: "#8B5CF6", to: "#EC4899" }, // purple to pink
    { from: "#3B82F6", to: "#6366F1" }, // blue to indigo
  ]
  
  return gradients[index % gradients.length]
}

export default function TestimonialsSection() {
  const { testimonials } = landingContent;
  
  return (
    <Section 
      id="testimonials"
      spacing="landing"
      className="relative overflow-hidden"
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-indigo-50/30 to-purple-50/30 dark:from-zinc-950 dark:via-indigo-950/10 dark:to-purple-950/10"></div>
        <div className="absolute inset-x-0 top-12 -z-[1] mx-auto h-1/3 w-2/3 rounded-full bg-indigo-300/20 blur-3xl dark:bg-indigo-700/10"></div>
        <div className="absolute inset-0 -top-8 left-1/2 -z-20 h-56 w-full -translate-x-1/2 [background-image:linear-gradient(to_bottom,transparent_98%,theme(colors.gray.200/75%)_98%),linear-gradient(to_right,transparent_94%,_theme(colors.gray.200/75%)_94%)] [background-size:16px_35px] [mask:radial-gradient(black,transparent_95%)] dark:opacity-10"></div>
      </div>

      <div className="mx-auto max-w-6xl px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl xl:text-4xl mb-6">
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">
              {testimonials.headline}
            </span>
          </h2>
        </motion.div>
        
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.quotes.slice(0, 6).map((testimonial, index) => {
            const { from, to } = getGradientColors(index)
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="group p-6 rounded-xl shadow-sm h-full relative overflow-hidden transition-all duration-300 hover:shadow-lg">
                  <div className="flex flex-col h-full">
                    <div className="mb-6">
                      <Quote className="h-8 w-8 text-indigo-600 dark:text-indigo-400 mb-4" />
                      <p className="text-gray-600 dark:text-gray-300 italic">
                        {testimonial.quote}
                      </p>
                    </div>
                    
                    <div className="mt-auto">
                      <div className="font-semibold text-gray-900 dark:text-gray-100">
                        {testimonial.author}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {testimonial.title}
                      </div>
                    </div>
                  </div>

                  <BorderBeam
                    duration={6}
                    size={300}
                    colorFrom={from}
                    colorTo={to}
                  />
                  <BorderBeam
                    duration={6}
                    delay={3}
                    size={300}
                    colorFrom={to}
                    colorTo={from}
                  />
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </Section>
  )
} 