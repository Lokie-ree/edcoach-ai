import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BorderBeam } from "./magicui/border-beam";
import { TypingAnimation } from "./magicui/typing-animation";
import { AnimatedGradientText } from "./magicui/animated-gradient-text";

export function BeamCard() {
  return (
    <Card className="relative w-[400px] overflow-hidden">
      <CardHeader className="flex flex-col items-center justify-center gap-4">
        <CardTitle className="text-2xl">
          <AnimatedGradientText
            speed={2}
            colorFrom="#4ade80"
            colorTo="#06b6d4"
            className="text-2xl font-semibold tracking-tight"
          >
            Landing Page
          </AnimatedGradientText>
        </CardTitle>
        <CardDescription>
          <TypingAnimation>Work in progress!</TypingAnimation>
        </CardDescription>
      </CardHeader>
      <CardContent>Content</CardContent>
      <CardFooter className="flex justify-center">
        <Button variant="outline">Let&apos;s Go!!!</Button>
      </CardFooter>
      <BorderBeam duration={8} size={150} />
    </Card>
  );
}
