"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, Cpu, Video, FileQuestion, Sparkles } from "lucide-react"
import { motion, useReducedMotion, Variants, useInView } from "framer-motion"
import { useRef } from "react"

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

// Hero section - staggered word reveal
const heroContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
}

const wordReveal: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
}

// Fade in up for general elements
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
}

// Feature cards - staggered scroll reveal
const cardContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.05 }
  }
}

const cardReveal: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  }
}

// Course outcomes - scale reveal
const outcomeReveal: Variants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut" }
  }
}

// Nav slide down
const navVariant: Variants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  }
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

// Animated word component for staggered reveal
function AnimatedWords({ text, className }: { text: string; className?: string }) {
  const words = text.split(" ")
  return (
    <motion.span className={className}>
      {words.map((word, i) => (
        <motion.span key={i} variants={wordReveal} className="inline-block mr-[0.25em]">
          {word}
        </motion.span>
      ))}
    </motion.span>
  )
}

// Feature card with premium animated effects
function FeatureCard({
  icon: Icon,
  color,
  title,
  description,
  prefersReducedMotion,
  index = 0
}: {
  icon: typeof Brain
  color: string
  borderColor?: string
  title: string
  description: string
  prefersReducedMotion: boolean | null
  index?: number
}) {
  return (
    <motion.div
      variants={cardReveal}
      className="relative group"
    >
      {/* Color-matched visible border */}
      <div
        className="absolute -inset-[1px] rounded-2xl transition-all duration-300 opacity-50 group-hover:opacity-100"
        style={{
          background: `linear-gradient(135deg, ${color}, ${color}50 50%, ${color})`,
        }}
      />

      {/* Glow backdrop */}
      <motion.div
        className="absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-all duration-500"
        style={{ backgroundColor: color }}
      />

      <motion.div
        whileHover={prefersReducedMotion ? undefined : { y: -8, scale: 1.02 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative h-full"
      >
        <Card className="relative bg-gray-900 h-full overflow-hidden transition-all duration-300 rounded-2xl border-0">
          {/* Inner gradient overlay */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: `radial-gradient(circle at 30% 20%, ${color}20, transparent 60%)`
            }}
          />

          <CardHeader className="pb-3 relative z-10">
            {/* Floating icon with glow */}
            <motion.div
              className="relative w-fit"
              animate={prefersReducedMotion ? undefined : {
                y: [0, -4, 0]
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.2
              }}
            >
              {/* Icon glow */}
              <motion.div
                className="absolute inset-0 blur-lg opacity-0 group-hover:opacity-70 transition-opacity duration-300 rounded-full"
                style={{ backgroundColor: color }}
              />
              <motion.div
                whileHover={prefersReducedMotion ? undefined : { rotate: 12, scale: 1.2 }}
                transition={{ duration: 0.2 }}
                className="relative z-10 p-2 rounded-xl"
                style={{ backgroundColor: `${color}15` }}
              >
                <Icon className="h-8 w-8 drop-shadow-lg" style={{ color }} />
              </motion.div>
            </motion.div>
            <CardTitle className="text-lg font-semibold text-white mt-3 group-hover:text-white transition-colors">{title}</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10 pt-0">
            <CardDescription className="text-gray-400 group-hover:text-gray-300 transition-colors leading-relaxed">{description}</CardDescription>
          </CardContent>

          {/* Bottom accent line */}
          <div
            className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-500 ease-out"
            style={{
              background: `linear-gradient(90deg, transparent, ${color}, transparent)`
            }}
          />
        </Card>
      </motion.div>
    </motion.div>
  )
}

// Course outcome with premium animated effects
function CourseOutcome({
  code,
  color,
  text,
  prefersReducedMotion,
  index = 0
}: {
  code: string
  color: string
  text: string
  prefersReducedMotion: boolean | null
  index?: number
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  // Color map for consistent styling
  const colorMap: Record<string, string> = {
    purple: "#8B7CFF",
    cyan: "#22d3ee",
    green: "#4ade80",
    amber: "#fbbf24",
    pink: "#ec4899"
  }
  const hexColor = colorMap[color] || "#8B7CFF"

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20, scale: 0.98 }}
      animate={isInView ? { opacity: 1, x: 0, scale: 1 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative group"
    >
      {/* Animated gradient border */}
      <motion.div
        className="absolute -inset-[1px] rounded-xl opacity-50 group-hover:opacity-100 transition-all duration-500"
        style={{
          background: `linear-gradient(135deg, ${hexColor}, ${hexColor}40 50%, ${hexColor})`,
        }}
      />

      {/* Glow backdrop on hover */}
      <motion.div
        className="absolute inset-0 rounded-xl blur-xl opacity-0 group-hover:opacity-30 transition-all duration-500"
        style={{ backgroundColor: hexColor }}
      />

      <motion.div
        className="relative flex gap-4 p-5 rounded-xl bg-gray-900/95 overflow-hidden"
        whileHover={prefersReducedMotion ? undefined : { x: 6, scale: 1.01 }}
        transition={{ duration: 0.2 }}
      >
        {/* Shimmer effect on hover */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
        />

        {/* Animated number badge */}
        <motion.div
          className="shrink-0 w-14 h-14 rounded-xl flex items-center justify-center font-bold text-lg relative overflow-hidden"
          style={{ backgroundColor: `${hexColor}20` }}
          animate={isInView && !prefersReducedMotion ? {
            boxShadow: [`0 0 0 ${hexColor}00`, `0 0 20px ${hexColor}40`, `0 0 0 ${hexColor}00`]
          } : {}}
          transition={{ duration: 2, delay: index * 0.2, repeat: Infinity, repeatDelay: 3 }}
        >
          {/* Rotating gradient inside badge */}
          <motion.div
            className="absolute inset-0 opacity-30"
            style={{
              background: `conic-gradient(from 0deg, transparent, ${hexColor}, transparent)`,
            }}
            animate={prefersReducedMotion ? undefined : { rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
          <span style={{ color: hexColor }} className="relative z-10 font-extrabold">
            {code}
          </span>
        </motion.div>

        {/* Text content */}
        <p className="text-gray-300 group-hover:text-white transition-colors duration-300 leading-relaxed py-2">
          {text}
        </p>

        {/* Bottom accent line */}
        <div
          className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-500 ease-out"
          style={{
            background: `linear-gradient(90deg, transparent, ${hexColor}, transparent)`
          }}
        />
      </motion.div>
    </motion.div>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function LandingPage() {
  const prefersReducedMotion = useReducedMotion()

  // Section refs for scroll-based animations
  const videoRef = useRef(null)
  const videoInView = useInView(videoRef, { once: true, margin: "-100px" })

  return (
    <motion.div
      className="min-h-screen bg-background relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* ================================================================== */}
      {/* BACKGROUND - Ultra-slow parallax drift */}
      {/* ================================================================== */}
      <div className="absolute inset-0 z-0">
        <motion.div
          className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"
          animate={prefersReducedMotion ? undefined : {
            x: [0, 3, 0, -3, 0],
            y: [0, 3, 0, -3, 0]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-[#8B7CFF] opacity-20 blur-[100px]"
          animate={prefersReducedMotion ? undefined : {
            scale: [1, 1.03, 1],
            opacity: [0.2, 0.22, 0.2]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* ================================================================== */}
      {/* NAVIGATION - Slide down on load */}
      {/* ================================================================== */}
      <motion.nav
        className="border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-50"
        variants={navVariant}
        initial="hidden"
        animate="visible"
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Cpu className="h-10 w-10 text-[#8B7CFF]" />
            <span className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-[#8B7CFF] tracking-tight">COAverse</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <motion.div
                whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button variant="ghost">Dashboard</Button>
              </motion.div>
            </Link>
            <Link href="/dashboard">
              <motion.div
                whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="relative"
              >
                {/* Glow pulse on hover */}
                <motion.div
                  className="absolute inset-0 rounded-md bg-primary/20 blur-md opacity-0"
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
                <Button className="relative">Get Started</Button>
              </motion.div>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* ================================================================== */}
      {/* HERO SECTION - Staggered word reveal */}
      {/* ================================================================== */}
      <motion.section
        className="container mx-auto px-4 py-12 md:py-24 relative z-10"
        variants={heroContainer}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text with word animation */}
          <div className="text-center md:text-left space-y-6">
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
              variants={fadeInUp}
            >
              <Sparkles className="h-4 w-4" />
              <span>AI-Powered Learning Platform</span>
            </motion.div>

            {/* Headline with staggered word reveal + shimmer */}
            <motion.h1
              className="text-4xl md:text-6xl font-bold tracking-tight text-balance leading-tight relative"
              variants={heroContainer}
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-[#8B7CFF]">
                <AnimatedWords text="Digital Computers – COA Interactive Learning Platform" />
              </span>
              {/* Shimmer overlay */}
              {!prefersReducedMotion && (
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 6,
                    ease: "easeInOut"
                  }}
                  style={{ mixBlendMode: "overlay" }}
                />
              )}
            </motion.h1>

            <motion.p
              className="text-xl text-muted-foreground text-balance max-w-2xl leading-relaxed"
              variants={fadeInUp}
            >
              Master Computer Organization and Architecture with AI-assisted personalized learning, interactive
              visualizations, and adaptive assessments designed for engineering students.
            </motion.p>

            {/* CTA Buttons with hover glow */}
            <motion.div
              className="flex flex-col sm:flex-row items-center md:items-start justify-center md:justify-start gap-4 pt-4"
              variants={fadeInUp}
            >
              <Link href="/dashboard">
                <motion.div
                  whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="relative group"
                >
                  <motion.div
                    className="absolute -inset-1 rounded-lg bg-primary/30 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />
                  <Button size="lg" className="text-base relative">
                    <Brain className="mr-2 h-5 w-5" />
                    Start Learning Digital Computers
                  </Button>
                </motion.div>
              </Link>
              <Link href="/learn">
                <motion.div
                  whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Button variant="outline" size="lg" className="text-base">
                    Explore Topics
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </div>

          {/* Right Column - Image with animations */}
          <motion.div
            className="relative"
            variants={fadeInUp}
          >
            {/* Animated gradient border - theme purple */}
            <motion.div
              className="absolute -inset-[3px] rounded-2xl"
              style={{
                background: "linear-gradient(135deg, #8B7CFF, #a78bfa 50%, #8B7CFF)",
                backgroundSize: "200% 200%",
              }}
              animate={prefersReducedMotion ? undefined : {
                backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            />

            {/* Glow backdrop */}
            <motion.div
              className="absolute -inset-4 rounded-3xl blur-2xl opacity-40"
              style={{ background: "#8B7CFF" }}
              animate={prefersReducedMotion ? undefined : {
                opacity: [0.2, 0.4, 0.2],
                scale: [1, 1.05, 1]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Floating image container */}
            <motion.div
              className="relative rounded-2xl overflow-hidden bg-gray-900"
              animate={prefersReducedMotion ? undefined : {
                y: [0, -8, 0]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              whileHover={{ scale: 1.02 }}
            >
              <Image
                src="/hero-illustration.jpg"
                alt="COA Learning Illustration"
                width={600}
                height={500}
                className="w-full h-auto object-contain relative z-10"
                priority
              />

              {/* Shimmer overlay */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent z-20"
                initial={{ x: "-100%" }}
                animate={prefersReducedMotion ? undefined : { x: "200%" }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatDelay: 4,
                  ease: "easeInOut"
                }}
              />
            </motion.div>

            {/* Decorative floating elements */}
            {!prefersReducedMotion && (
              <>
                <motion.div
                  className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-[#8B7CFF]/50 blur-sm"
                  animate={{ y: [0, -10, 0], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                  className="absolute -bottom-4 -left-4 w-6 h-6 rounded-full bg-cyan-400/50 blur-sm"
                  animate={{ y: [0, 10, 0], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                />
                <motion.div
                  className="absolute top-1/2 -right-6 w-4 h-4 rounded-full bg-pink-400/50 blur-sm"
                  animate={{ x: [0, 8, 0], opacity: [0.3, 0.8, 0.3] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                />
              </>
            )}
          </motion.div>
        </div>
      </motion.section>

      {/* ================================================================== */}
      {/* VIDEO SECTION - Glow breathing + underline sweep */}
      {/* ================================================================== */}
      <motion.section
        ref={videoRef}
        className="container mx-auto px-4 py-16 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={videoInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-4xl mx-auto">
          {/* Headline with animated colors and effects */}
          <div className="relative w-full text-center mb-10">
            <motion.h2
              className="text-3xl md:text-5xl font-bold relative inline-block"
              initial={{ opacity: 0, y: 20 }}
              animate={videoInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
            >
              {/* Gradient text matching app theme */}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#8B7CFF] via-[#a78bfa] to-white">
                Introduction to Computer Organization
              </span>
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-[#a78bfa] to-[#8B7CFF]">
                & Architecture
              </span>

              {/* Shimmer overlay */}
              {!prefersReducedMotion && (
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  initial={{ x: "-100%" }}
                  animate={videoInView ? { x: "100%" } : {}}
                  transition={{
                    duration: 1.5,
                    delay: 0.5,
                    repeat: Infinity,
                    repeatDelay: 5,
                    ease: "easeInOut"
                  }}
                  style={{ mixBlendMode: "overlay" }}
                />
              )}
            </motion.h2>

            {/* Animated underline */}
            {!prefersReducedMotion && (
              <motion.div
                className="absolute -bottom-3 left-1/2 h-[3px] rounded-full bg-gradient-to-r from-[#8B7CFF] via-[#a78bfa] to-[#8B7CFF]"
                initial={{ width: 0, x: "-50%" }}
                animate={videoInView ? { width: "80%" } : {}}
                transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
              />
            )}

            {/* Glow effect behind text */}
            <div className="absolute inset-0 -z-10 blur-3xl opacity-30 bg-[#8B7CFF]" />
          </div>

          {/* Video container with glow breathing */}
          <motion.div
            className="relative rounded-2xl overflow-hidden"
            whileHover={prefersReducedMotion ? undefined : { y: -4 }}
            transition={{ duration: 0.2 }}
          >
            {/* Ambient glow */}
            <motion.div
              className="absolute -inset-2 rounded-3xl bg-purple-500/20 blur-xl -z-10"
              animate={prefersReducedMotion ? undefined : {
                opacity: [0.2, 0.35, 0.2],
                scale: [1, 1.02, 1]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <div className="border-2 border-[#8B7CFF]/60 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(139,124,255,0.3)]">
              <iframe
                src="https://player.cloudinary.com/embed/?cloud_name=dsh27hhgj&public_id=introductory-video&profile=cld-default"
                width="100%"
                height="450"
                allow="autoplay; fullscreen; encrypted-media"
                allowFullScreen
                className="w-full"
              />
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* ================================================================== */}
      {/* FEATURE CARDS - Staggered scroll reveal + hover effects */}
      {/* ================================================================== */}
      <motion.section
        className="container mx-auto px-4 py-16 relative z-10"
        variants={cardContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8">
          <FeatureCard
            icon={Brain}
            color="#8B7CFF"
            title="AI Learning"
            description="Personalized explanations powered by AI"
            prefersReducedMotion={prefersReducedMotion}
            index={0}
          />
          <FeatureCard
            icon={Video}
            color="#22d3ee"
            title="Video Lessons"
            description="Interactive video content for each topic"
            prefersReducedMotion={prefersReducedMotion}
            index={1}
          />
          <FeatureCard
            icon={Cpu}
            color="#4ade80"
            title="Visualizations"
            description="3D simulations and interactive diagrams"
            prefersReducedMotion={prefersReducedMotion}
            index={2}
          />
          <FeatureCard
            icon={FileQuestion}
            color="#fbbf24"
            title="Assessments"
            description="Adaptive quizzes and practice tests"
            prefersReducedMotion={prefersReducedMotion}
            index={3}
          />
        </div>
      </motion.section>

      {/* ================================================================== */}
      {/* COURSE OUTCOMES - Scale reveal + neon border trace */}
      {/* ================================================================== */}
      <motion.section
        className="container mx-auto px-4 py-16 relative z-10"
        variants={cardContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <div className="max-w-4xl mx-auto">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-center mb-4"
            variants={fadeInUp}
          >
            Course Outcomes
          </motion.h2>
          <motion.p
            className="text-center text-muted-foreground mb-10"
            variants={fadeInUp}
          >
            After completion of this course, the students will be able to
          </motion.p>

          {/* Outcomes with connector glow */}
          <div className="space-y-4 relative">
            {/* Faint connector line */}
            {!prefersReducedMotion && (
              <motion.div
                className="absolute left-8 top-12 bottom-12 w-px bg-gradient-to-b from-purple-500/30 via-cyan-500/30 to-pink-500/30"
                initial={{ opacity: 0, scaleY: 0 }}
                whileInView={{ opacity: 1, scaleY: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.5 }}
                style={{ transformOrigin: "top" }}
              />
            )}

            <CourseOutcome
              code="CO1"
              color="purple"
              text="Analyse the basics of instruction sets and their impact on processor design."
              prefersReducedMotion={prefersReducedMotion}
              index={0}
            />
            <CourseOutcome
              code="CO2"
              color="cyan"
              text="Demonstrate an understanding of the design of the functional units of a digital computer system."
              prefersReducedMotion={prefersReducedMotion}
              index={1}
            />
            <CourseOutcome
              code="CO3"
              color="green"
              text="Evaluate cost performance and design trade-offs in designing and constructing a computer processor including memory."
              prefersReducedMotion={prefersReducedMotion}
              index={2}
            />
            <CourseOutcome
              code="CO4"
              color="amber"
              text="Design a pipeline for consistent execution of instructions with minimum hazards."
              prefersReducedMotion={prefersReducedMotion}
              index={3}
            />
            <CourseOutcome
              code="CO5"
              color="pink"
              text="Recognize and manipulate representations of numbers stored in digital computers."
              prefersReducedMotion={prefersReducedMotion}
              index={4}
            />
          </div>
        </div>
      </motion.section>

      {/* ================================================================== */}
      {/* FOOTER - Fade in */}
      {/* ================================================================== */}
      <motion.footer
        className="border-t border-border/40 py-8 relative z-10"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
      >
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2026 COAverse. Built for Engineering Students.</p>
        </div>
      </motion.footer>
    </motion.div>
  )
}
