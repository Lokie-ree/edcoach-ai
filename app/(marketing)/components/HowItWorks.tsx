"use client"
import React from "react"
import { Container } from "@/components/ui/container"
import { Card } from "@/components/ui/card"
import { BorderBeam } from "@/components/magicui/border-beam"
import landingContent from "@/data/landing-content.json"
import { motion } from "framer-motion"
import { ClipboardList, Sparkles, TrendingUp, MessageSquareShare } from "lucide-react"
import { STATUS_COLORS, ICONS } from "@/lib/design-tokens"
import { cn } from "@/lib/utils"

// Map icon strings to components
const iconMap = {
  "ClipboardList": ClipboardList,
  "Sparkles": Sparkles,
  "TrendingUp": TrendingUp,
  "MessageSquareShare": MessageSquareShare,
}

export default function HowItWorksSection() {
  const { how_it_works } = landingContent;
  
  // Function to get icon component based on string name
  const getIconComponent = (iconName: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap]
    return IconComponent ? <IconComponent className={ICONS.sizes.lg} /> : null
  }
  
  // Generate gradient colors using our brand tokens
  const getGradientColors = (index: number) => {
    const gradients = [
      { from: "#3b82f6", to: "#10b981" }, // primary to secondary
      { from: "#10b981", to: "#f59e0b" }, // secondary to accent  
      { from: "#3b82f6", to: "#f59e0b" }, // primary to accent
    ]
    
    return gradients[index % gradients.length]
  }

  return (
    <section 
      id="how-it-works"
      className="relative py-12 md:py-16"
    >
      <Container size="lg" padding="normal">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl xl:text-4xl mb-6">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {how_it_works.headline}
            </span>
          </h2>
        </motion.div>
        
        <div className="grid gap-8 md:grid-cols-3">
          {how_it_works.steps.map((step, index) => {
            const { from, to } = getGradientColors(index)
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                {/* Step number bubble */}
                <div className="absolute -top-4 -left-4 z-10 bg-gradient-to-r from-primary to-secondary text-white h-10 w-10 rounded-full flex items-center justify-center font-bold shadow-md">
                  {step.id}
                </div>
                
                {/* Step content card */}
                <Card className="p-6 rounded-xl shadow-sm h-full relative overflow-hidden">
                  <div className="flex flex-col gap-4 h-full">
                    <div className={cn("rounded-full w-14 h-14 flex items-center justify-center", STATUS_COLORS.coach.bg, STATUS_COLORS.coach.text)}>
                      {getIconComponent(step.icon)}
                    </div>
                    
                    <h3 className="text-xl font-semibold">
                      {step.title}
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-300 flex-grow">
                      {step.description}
                    </p>
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