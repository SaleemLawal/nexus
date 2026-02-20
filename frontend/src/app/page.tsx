'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  LayoutGrid,
  MessageSquare,
  BarChart3,
  Calendar,
  ArrowRight,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react';

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
};

const cardItem = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: 'easeOut' as const },
  },
};

const features = [
  {
    icon: LayoutGrid,
    title: 'Visual Boards',
    description:
      'Collect images, links, notes, and checklists on beautiful masonry boards. Drag to reorder, collaborate in real time.',
    accent: '#D4654A',
    bg: '#FEF3EF',
  },
  {
    icon: MessageSquare,
    title: 'Live Chat',
    description:
      'Keep your group in sync with real-time messaging. See who\'s online, share ideas instantly.',
    accent: '#7C6FCD',
    bg: '#F3F1FD',
  },
  {
    icon: BarChart3,
    title: 'Polls & Voting',
    description:
      'Make decisions together. Create polls with animated live results — no more endless group chats.',
    accent: '#3B9E8C',
    bg: '#EDFAF7',
  },
  {
    icon: Calendar,
    title: 'Shared Calendar',
    description:
      'One calendar for the whole group. Add events, track dates, and never miss a detail.',
    accent: '#C08B3A',
    bg: '#FDF6EC',
  },
];

const testimonials = [
  {
    quote: 'We used Nexus to plan our whole Euro trip. The boards feature alone saved us hours.',
    name: 'Mia L.',
    tag: 'Trip planner',
    color: '#D4654A',
  },
  {
    quote: "Finally, one place for ideas, chat, and dates. No more 40-person group texts.",
    name: 'Jordan K.',
    tag: 'Event organizer',
    color: '#7C6FCD',
  },
  {
    quote: "The poll feature settled every debate. What restaurant? What date? Done.",
    name: 'Sam W.',
    tag: 'Weekend warrior',
    color: '#3B9E8C',
  },
];

export default function LandingPage() {
  return (
    <div
      className="min-h-screen"
      style={{ background: 'oklch(0.978 0.006 72)' }}
    >
      {/* Nav */}
      <motion.nav
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex items-center justify-between px-8 py-5 max-w-6xl mx-auto"
      >
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: '#D4654A' }}
          >
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span
            className="font-display font-800 text-xl tracking-tight"
            style={{ color: 'oklch(0.22 0.03 52)' }}
          >
            Nexus
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/spaces"
            className="font-display text-sm font-500 px-4 py-2 rounded-full transition-all"
            style={{ color: 'oklch(0.45 0.025 58)' }}
          >
            Sign in
          </Link>
          <Link
            href="/spaces"
            className="font-display text-sm font-600 px-5 py-2 rounded-full text-white transition-all hover:opacity-90 active:scale-95"
            style={{ background: '#D4654A' }}
          >
            Get started
          </Link>
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="px-6 pt-16 pb-20 max-w-6xl mx-auto">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="text-center max-w-4xl mx-auto"
        >
          {/* Badge */}
          <motion.div variants={item} className="flex justify-center mb-8">
            <span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-display font-600 uppercase tracking-widest"
              style={{
                background: '#FEF3EF',
                color: '#D4654A',
                border: '1px solid #F5C9BC',
              }}
            >
              <Zap className="w-3 h-3" />
              Plan together, beautifully
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={item}
            className="font-display leading-[0.95] mb-6"
            style={{
              fontSize: 'clamp(3.5rem, 8vw, 7rem)',
              fontWeight: 800,
              color: 'oklch(0.22 0.03 52)',
              letterSpacing: '-0.03em',
            }}
          >
            Every event,
            <br />
            <span style={{ color: '#D4654A' }}>perfectly planned.</span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            variants={item}
            className="font-editorial text-xl leading-relaxed mb-10 max-w-2xl mx-auto"
            style={{
              color: 'oklch(0.50 0.025 58)',
              fontStyle: 'italic',
              fontWeight: 300,
            }}
          >
            Nexus brings visual boards, live chat, group polls, and a shared
            calendar into one beautiful space. From weekend trips to dinner
            parties — plan with everyone, stress with no one.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={item}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <Link
              href="/spaces"
              className="inline-flex items-center gap-2 font-display font-700 text-base px-8 py-4 rounded-full text-white transition-all hover:opacity-90 hover:-translate-y-0.5 active:scale-95"
              style={{ background: '#D4654A', boxShadow: '0 4px 20px #D4654A44' }}
            >
              Start planning free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/spaces"
              className="inline-flex items-center gap-2 font-display font-500 text-base px-8 py-4 rounded-full transition-all hover:-translate-y-0.5"
              style={{
                background: '#fff',
                color: 'oklch(0.30 0.04 52)',
                border: '1px solid oklch(0.88 0.015 68)',
                boxShadow: '0 2px 8px oklch(0.22 0.03 52 / 8%)',
              }}
            >
              <Users className="w-4 h-4" />
              Join a space
            </Link>
          </motion.div>
        </motion.div>

        {/* Hero visual — decorative board mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-20 max-w-5xl mx-auto"
        >
          <div
            className="rounded-3xl overflow-hidden"
            style={{
              background: '#fff',
              border: '1px solid oklch(0.88 0.015 68)',
              boxShadow:
                '0 8px 32px oklch(0.22 0.03 52 / 8%), 0 24px 64px oklch(0.22 0.03 52 / 6%)',
            }}
          >
            {/* Mock browser bar */}
            <div
              className="flex items-center gap-2 px-5 py-3"
              style={{
                background: 'oklch(0.96 0.009 70)',
                borderBottom: '1px solid oklch(0.88 0.015 68)',
              }}
            >
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-400/70" />
                <div className="w-3 h-3 rounded-full bg-green-400/70" />
              </div>
              <div
                className="flex-1 mx-4 rounded-md px-3 py-1 text-xs font-display"
                style={{
                  background: '#fff',
                  color: 'oklch(0.55 0.025 58)',
                  maxWidth: 240,
                }}
              >
                nexus.app/spaces/euro-trip
              </div>
            </div>

            {/* Mock board content */}
            <div className="p-6" style={{ background: 'oklch(0.978 0.006 72)' }}>
              <div className="flex items-center gap-3 mb-5">
                <span className="text-2xl">🌍</span>
                <h3 className="font-display font-700 text-lg" style={{ color: 'oklch(0.22 0.03 52)' }}>
                  Euro Summer Trip
                </h3>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {/* Mock pin cards */}
                {[
                  { type: 'image', color: '#E8D5C4', label: 'Amalfi Coast', tag: 'Photo' },
                  { type: 'note', color: '#D4E8D4', label: 'Packing checklist', tag: 'List' },
                  { type: 'link', color: '#D4D8E8', label: 'Best restaurants in Rome', tag: 'Link' },
                  { type: 'image', color: '#E8D4D4', label: 'Hotel Colosseo', tag: 'Photo' },
                  { type: 'note', color: '#E8E4D4', label: 'Train schedule Milan→Florence', tag: 'Note' },
                  { type: 'link', color: '#D4E8E4', label: 'Airbnb Barcelona', tag: 'Link' },
                ].map((card, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + i * 0.07, duration: 0.4, ease: 'easeOut' }}
                    className="rounded-2xl overflow-hidden"
                    style={{
                      background: '#fff',
                      border: '1px solid oklch(0.88 0.015 68)',
                      boxShadow: '0 2px 8px oklch(0.22 0.03 52 / 6%)',
                    }}
                  >
                    <div
                      className="h-20"
                      style={{ background: card.color, opacity: 0.6 }}
                    />
                    <div className="px-3 py-2">
                      <div className="text-xs font-display font-600" style={{ color: 'oklch(0.22 0.03 52)' }}>
                        {card.label}
                      </div>
                      <div className="text-[10px] font-display mt-0.5" style={{ color: 'oklch(0.55 0.025 58)' }}>
                        {card.tag}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="px-6 py-24" style={{ background: '#fff' }}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-16"
          >
            <h2
              className="font-display font-800 mb-4"
              style={{
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                letterSpacing: '-0.025em',
                color: 'oklch(0.22 0.03 52)',
              }}
            >
              Everything your group needs
            </h2>
            <p
              className="font-editorial text-lg max-w-xl mx-auto"
              style={{ color: 'oklch(0.50 0.025 58)', fontStyle: 'italic', fontWeight: 300 }}
            >
              Four powerful tools, one shared space. Built for groups who
              actually want to get things done.
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {features.map((f) => (
              <motion.div
                key={f.title}
                variants={cardItem}
                className="rounded-2xl p-6 transition-all"
                style={{
                  background: f.bg,
                  border: `1px solid ${f.accent}22`,
                }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: f.accent }}
                >
                  <f.icon className="w-5 h-5 text-white" />
                </div>
                <h3
                  className="font-display font-700 text-base mb-2"
                  style={{ color: 'oklch(0.22 0.03 52)' }}
                >
                  {f.title}
                </h3>
                <p
                  className="font-editorial text-sm leading-relaxed"
                  style={{ color: 'oklch(0.45 0.025 58)', fontWeight: 400 }}
                >
                  {f.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-6 py-24" style={{ background: 'oklch(0.978 0.006 72)' }}>
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <h2
              className="font-display font-800 mb-3"
              style={{
                fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
                letterSpacing: '-0.025em',
                color: 'oklch(0.22 0.03 52)',
              }}
            >
              People love planning with Nexus
            </h2>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-40px' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-5"
          >
            {testimonials.map((t) => (
              <motion.div
                key={t.name}
                variants={cardItem}
                className="rounded-2xl p-6"
                style={{
                  background: '#fff',
                  border: '1px solid oklch(0.88 0.015 68)',
                  boxShadow: '0 2px 12px oklch(0.22 0.03 52 / 6%)',
                }}
              >
                <p
                  className="font-editorial text-base leading-relaxed mb-5"
                  style={{
                    color: 'oklch(0.30 0.04 52)',
                    fontStyle: 'italic',
                    fontWeight: 400,
                  }}
                >
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-display font-700"
                    style={{ background: t.color }}
                  >
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="font-display font-600 text-sm" style={{ color: 'oklch(0.22 0.03 52)' }}>
                      {t.name}
                    </div>
                    <div className="font-display text-xs" style={{ color: 'oklch(0.55 0.025 58)' }}>
                      {t.tag}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA section */}
      <section className="px-6 py-24" style={{ background: '#fff' }}>
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl mx-auto text-center rounded-3xl px-8 py-16"
          style={{
            background: 'linear-gradient(135deg, #FEF3EF 0%, #FDF6EC 100%)',
            border: '1px solid #F5C9BC',
          }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: '#D4654A' }}
          >
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h2
            className="font-display font-800 mb-4"
            style={{
              fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
              letterSpacing: '-0.025em',
              color: 'oklch(0.22 0.03 52)',
            }}
          >
            Your next great adventure
            <br />
            starts here.
          </h2>
          <p
            className="font-editorial text-lg mb-8"
            style={{
              color: 'oklch(0.50 0.025 58)',
              fontStyle: 'italic',
              fontWeight: 300,
            }}
          >
            Free forever for groups of any size. No accounts required, just a
            name and you&apos;re in.
          </p>
          <Link
            href="/spaces"
            className="inline-flex items-center gap-2 font-display font-700 text-base px-9 py-4 rounded-full text-white transition-all hover:opacity-90 hover:-translate-y-0.5"
            style={{ background: '#D4654A', boxShadow: '0 4px 20px #D4654A44' }}
          >
            Create your first space
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer
        className="px-8 py-8 flex items-center justify-between max-w-6xl mx-auto"
        style={{ borderTop: '1px solid oklch(0.88 0.015 68)' }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center"
            style={{ background: '#D4654A' }}
          >
            <Sparkles className="w-3 h-3 text-white" />
          </div>
          <span className="font-display font-600 text-sm" style={{ color: 'oklch(0.22 0.03 52)' }}>
            Nexus
          </span>
        </div>
        <p className="font-display text-xs" style={{ color: 'oklch(0.55 0.025 58)' }}>
          Plan together. Live better.
        </p>
      </footer>
    </div>
  );
}
