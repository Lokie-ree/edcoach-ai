"use client"
import React from "react"
import { Container } from "@/components/ui/container"
import { Card } from "@/components/ui/card"
import { BorderBeam } from "@/components/magicui/border-beam"
import landingContent from "@/data/landing-content.json"
import { motion } from "framer-motion"
import { Quote } from "lucide-react"
import { ICONS } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

// Generate gradient colors using our brand tokens
const getGradientColors = (index: number) => {
  const gradients = [
    { from: "#3b82f6", to: "#10b981" }, // primary to secondary
    { from: "#10b981", to: "#f59e0b" }, // secondary to accent  
    { from: "#3b82f6", to: "#f59e0b" }, // primary to accent
  ]
  
  return gradients[index % gradients.length]
}

export default function TestimonialsSection() {
  const { testimonials } = landingContent;
  
  return (
    <section 
      id="testimonials"
      className="relative overflow-hidden py-12 md:py-16"
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-secondary/5"></div>
        <div className="absolute inset-x-0 top-12 -z-[1] mx-auto h-1/3 w-2/3 rounded-full bg-primary/20 blur-3xl dark:bg-primary/10"></div>
        <div className="absolute inset-0 -top-8 left-1/2 -z-20 h-56 w-full -translate-x-1/2 [background-image:linear-gradient(to_bottom,transparent_98%,theme(colors.gray.200/75%)_98%),linear-gradient(to_right,transparent_94%,_theme(colors.gray.200/75%)_94%)] [background-size:16px_35px] [mask:radial-gradient(black,transparent_95%)] dark:opacity-10"></div>
      </div>

      <Container size="lg" padding="normal">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl xl:text-4xl mb-6">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
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
                      <Quote className={cn(ICONS.sizes.lg, "text-primary dark:text-primary mb-4")} />
                      <p className="text-muted-foreground italic">
                        {testimonial.quote}
                      </p>
                    </div>
                    
                    <div className="mt-auto">
                      <div className="font-semibold text-foreground">
                        {testimonial.author}
                      </div>
                      <div className="text-sm text-muted-foreground">
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
      </Container>
    </section>
  )
} 