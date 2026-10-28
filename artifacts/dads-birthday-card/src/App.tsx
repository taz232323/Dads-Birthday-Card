import { type CSSProperties, type FormEvent, type ReactNode, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();

function Home() {
  const [screen, setScreen] = useState<'cover' | 'intro' | 'puzzle' | 'final-glitch' | 'reveal'>('cover');
  const [introIndex, setIntroIndex] = useState(0);
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [solved, setSolved] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [glitch, setGlitch] = useState(false);

  const introMessages = [
    'WELCOME, HUMAN. I HAVE BEEN ASSIGNED TO CREATE YOUR BIRTHDAY CARD.',
    'I AM AN ADVANCED ARTIFICIAL INTELLIGENCE.',
  ];
  const puzzles = [
    {
      title: 'WORD REPAIR',
      subtitle: 'My word processor got a little overexcited. Can you put this back together?',
      display: 'THDAYBIR',
      hint: 'Hint: it is the thing being celebrated today.',
      reaction: 'WORD REPAIRED. I KNEW YOU HAD THE REQUIRED HUMAN SKILLS.',
      accepted: (value: string) => value.trim().toUpperCase() === 'BIRTHDAY',
    },
    {
      title: 'BIRTHDAY RIDDLE',
      subtitle: 'My riddle module is online. Probably.',
      display: 'I have a face and two hands, but no eyes or fingers. What am I?',
      hint: 'Hint: you might hang me on a wall to check the time.',
      reaction: 'RIDDLE SOLVED. YOUR HUMAN BRAIN IS... MOST IMPRESSIVE.',
      accepted: (value: string) => ['clock', 'watch', 'aclock', 'awatch'].includes(value.toLowerCase().replace(/[^a-z]/g, '')),
    },
  ];

  useEffect(() => {
    if (screen !== 'final-glitch') return;
    const timer = window.setTimeout(() => setScreen('reveal'), 850);
    return () => window.clearTimeout(timer);
  }, [screen]);

  useEffect(() => {
    if (screen !== 'intro' && screen !== 'puzzle') return;
    let blinkTimer: number;
    const glitchTimer = window.setInterval(() => {
      setGlitch(true);
      blinkTimer = window.setTimeout(() => setGlitch(false), 520);
    }, 6800);
    return () => {
      window.clearInterval(glitchTimer);
      window.clearTimeout(blinkTimer);
    };
  }, [screen]);

  const startPuzzles = () => {
    setPuzzleIndex(0);
    setAnswer('');
    setFeedback('');
    setSolved(false);
    setShowHint(false);
    setScreen('puzzle');
  };

  const nextPuzzle = () => {
    setAnswer('');
    setFeedback('');
    setSolved(false);
    setShowHint(false);
    if (puzzleIndex === 0) setPuzzleIndex(1);
    else setScreen('final-glitch');
  };

  const submitAnswer = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (solved) return;
    const current = puzzles[puzzleIndex];
    if (current.accepted(answer)) {
      setSolved(true);
      setFeedback(current.reaction);
    } else {
      setFeedback(puzzleIndex === 0
        ? 'Close! Your birthday word is hiding in there. Give those letters another look.'
        : 'Not quite, but you’re close. Take another look at the riddle.');
      setShowHint(true);
    }
  };

  return (
    <main className={`birthday-shell ${screen === 'reveal' ? 'celebration-confetti' : ''}`} data-testid="birthday-card-experience">
      {screen === 'reveal' && <Confetti />}
      {screen === 'cover' && (
        <section className="scene scene-cover" aria-labelledby="cover-title" data-testid="screen-cover">
          <div className="cover-copy">
            <p className="eyebrow">A small transmission, from your kid</p>
            <h1 id="cover-title" className="cover-title" data-testid="heading-birthday-cover">
              HAPPY BIRTHDAY, DAD! <span>🎂</span>
            </h1>
            <p className="cover-subtitle">One very sincere birthday card. One very questionable robot. Made just for you.</p>
            <button className="primary-button open-button" type="button" onClick={() => setScreen('intro')} data-testid="button-open-card">
              OPEN YOUR CARD <span aria-hidden="true">→</span>
            </button>
          </div>
          <div className="cover-visual"><Robot /></div>
        </section>
      )}

      {screen === 'intro' && (
        <section className="scene screen-card intro-card" aria-label="Robot introduction" data-testid="screen-robot-intro">
          <div className={`intro-robot ${glitch ? 'robot-glitch' : ''}`}><Robot /></div>
          <div className="message-panel">
            <StepMark current={introIndex} count={2} />
            <p className="eyebrow">Incoming birthday transmission</p>
            <p className="message-text" aria-live="polite" data-testid="text-robot-message">{introMessages[introIndex]}</p>
            <button
              className="primary-button"
              type="button"
              data-testid="button-continue-intro"
              onClick={() => {
                if (introIndex === 0) setIntroIndex(1);
                else startPuzzles();
              }}
            >
              {introIndex === 0 ? 'CONTINUE' : 'LET’S SEE'}
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </section>
      )}

      {screen === 'puzzle' && (
        <section className={`scene screen-card puzzle-card ${glitch ? 'robot-glitch' : ''}`} aria-labelledby="puzzle-title" data-testid={`screen-puzzle-${puzzleIndex + 1}`}>
          <StepMark current={puzzleIndex} count={2} />
          <p className="eyebrow">A very tiny test of human intelligence</p>
          <h2 id="puzzle-title" className="puzzle-title" data-testid="heading-puzzle-title">{puzzles[puzzleIndex].title}</h2>
          <p className="puzzle-intro">{puzzles[puzzleIndex].subtitle}</p>
          <div
            className={puzzleIndex === 0 ? 'scramble' : 'riddle-prompt'}
            aria-label={`Puzzle: ${puzzles[puzzleIndex].display}`}
            data-testid="text-puzzle-prompt"
          >
            {puzzles[puzzleIndex].display}
          </div>
          <form className="answer-form" onSubmit={submitAnswer} data-testid="form-puzzle-answer">
            <label className="sr-only" htmlFor="puzzle-answer">Your answer</label>
            <input
              id="puzzle-answer"
              className="answer-input"
              type="text"
              autoComplete="off"
              value={answer}
              onChange={(event) => {
                setAnswer(event.target.value);
                if (feedback && !solved) setFeedback('');
              }}
              placeholder="Type your answer"
              aria-describedby={showHint ? 'puzzle-feedback puzzle-hint' : 'puzzle-feedback'}
              data-testid="input-puzzle-answer"
            />
            <button className="primary-button" type="submit" disabled={!answer.trim() || solved} data-testid="button-check-answer">
              CHECK IT
            </button>
          </form>
          <p id="puzzle-feedback" className={`feedback ${solved ? 'success' : ''}`} aria-live="polite" data-testid="status-puzzle-feedback">
            {feedback}{solved && <span className="reaction" data-testid="text-robot-reaction"> NICE WORK.</span>}
          </p>
          {showHint && <p id="puzzle-hint" className="hint" data-testid="text-puzzle-hint">{puzzles[puzzleIndex].hint}</p>}
          <div className="puzzle-footer">
            {solved
              ? <button className="primary-button" type="button" onClick={nextPuzzle} data-testid="button-continue-puzzle">CONTINUE <span aria-hidden="true">→</span></button>
              : <span className="eyebrow" style={{ margin: 0 }}>No pressure. It’s a birthday, not an exam.</span>}
          </div>
        </section>
      )}

      {screen === 'final-glitch' && (
        <section className="scene screen-card" aria-live="polite" aria-label="Robot restoring the birthday card" data-testid="screen-final-glitch">
          <div className="intro-card">
            <div className="robot-glitch"><Robot /></div>
            <div className="message-panel">
              <p className="eyebrow">One moment. My sincerity module is rebooting.</p>
              <p className="message-text">CARD GENERATION IN PROGRESS…</p>
            </div>
          </div>
        </section>
      )}

      {screen === 'reveal' && (
        <section className="scene reveal-scene" aria-labelledby="system-restored" data-testid="screen-birthday-reveal">
          <div className="system-status" id="system-restored" data-testid="status-system-restored">SYSTEM RESTORED!</div>
          <p className="system-caption" data-testid="text-card-generated">BIRTHDAY CARD SUCCESSFULLY GENERATED!</p>
          <article className="final-card" data-testid="card-birthday-message">
            <div className="reveal-robot" aria-hidden="true"><Robot /></div>
            <p className="card-kicker">A note, made with love</p>
            <p className="card-message" data-testid="text-final-birthday-message">{'Happy Birthday, Dad! ❤️\n\nThank you for all the laughs, the terrible jokes, and for always making life fun. I hope you have the best birthday ever. Love you!'}</p>
            <p className="card-signature" data-testid="text-cheeky-signature">This is the only AI thing you’re getting btw ur welcomeeee</p>
          </article>
          <p className="footer-note">Delivered with affection. Glitches not included.</p>
        </section>
      )}
    </main>
  );
}

function StepMark({ current, count }: { current: number; count: number }) {
  return (
    <div className="step-mark" aria-label={`Step ${current + 1} of ${count}`} data-testid="status-progress">
      {Array.from({ length: count }, (_, index) => <span key={index} className={index === current ? 'active' : ''} />)}
    </div>
  );
}

function Confetti() {
  const colors = ['#d26750', '#d8b660', '#6b9587', '#9e715c', '#8a9c72'];
  return (
    <div aria-hidden="true" data-testid="animation-confetti">
      {Array.from({ length: 42 }, (_, index) => (
        <span
          key={index}
          className="confetti-bit"
          style={{
            left: `${(index * 37 + 4) % 100}%`,
            backgroundColor: colors[index % colors.length],
            '--fall-time': `${3.2 + (index % 7) * 0.22}s`,
            '--fall-delay': `${(index % 12) * -0.33}s`,
            '--drift': `${((index * 19) % 90) - 45}px`,
          } as CSSProperties}
        />
      ))}
    </div>
  );
}

function Robot() {
  return (
    <div className="robot-stage" data-testid="illustration-birthday-robot">
      <svg className="robot-svg" viewBox="0 0 340 310" role="img" aria-label="A cheerful little robot holding a wrapped birthday present">
        <g className="sunburst" fill="none" stroke="#d9c68c" strokeWidth="2" strokeLinecap="round" opacity=".65">
          <path d="M170 14v18M170 278v18M25 162h20M295 162h20M67 58l14 14M259 252l14 14M273 58l-14 14M81 252l-14 14" />
        </g>
        <path d="M74 265c40-18 148-18 192 0" fill="none" stroke="#d7d0b7" strokeWidth="3" strokeLinecap="round" />
        <g className="robot-antenna">
          <path d="M170 63V41" stroke="#527d73" strokeWidth="7" strokeLinecap="round" />
          <circle cx="170" cy="32" r="11" fill="#d26750" stroke="#a94d3d" strokeWidth="3" />
          <circle cx="166" cy="28" r="3" fill="#fff6dd" opacity=".9" />
        </g>
        <path d="M113 89c0-12 10-22 22-22h70c12 0 22 10 22 22v77H113V89Z" fill="#e5e6d8" stroke="#506d64" strokeWidth="5" />
        <path d="M127 93c0-6 5-11 11-11h64c6 0 11 5 11 11v53c0 6-5 11-11 11h-64c-6 0-11-5-11-11V93Z" fill="#a9c8b6" stroke="#577a70" strokeWidth="3" />
        <path d="M129 100c16-14 58-19 78-8" fill="none" stroke="#e3f0d9" strokeWidth="5" strokeLinecap="round" opacity=".7" />
        <g className="robot-blink" fill="#314f4b">
          <ellipse cx="150" cy="119" rx="6" ry="9" />
          <ellipse cx="188" cy="119" rx="6" ry="9" />
        </g>
        <path className="robot-mouth" d="M157 137c8 8 17 8 25 0" fill="none" stroke="#314f4b" strokeWidth="3" />
        <ellipse className="robot-blush" cx="139" cy="135" rx="8" ry="4" fill="#d26750" />
        <ellipse className="robot-blush" cx="200" cy="135" rx="8" ry="4" fill="#d26750" />
        <path d="M121 169v34M219 169v34" stroke="#506d64" strokeWidth="9" strokeLinecap="round" />
        <path d="M139 167v45M202 167v45" stroke="#506d64" strokeWidth="9" strokeLinecap="round" />
        <path d="M139 211h-8M203 211h8" stroke="#506d64" strokeWidth="8" strokeLinecap="round" />
        <path d="M143 165h54v10h-54z" fill="#d6d5c5" />
        <g className="robot-gift">
          <path d="M210 160h75v68h-75z" fill="#d26750" stroke="#a94d3d" strokeWidth="4" />
          <path d="M210 176h75M244 160v68" stroke="#f2d28c" strokeWidth="9" />
          <path d="M245 160c-21-1-26-17-16-20 10-3 17 8 16 20Zm0 0c2-22 19-25 22-14 3 10-10 16-22 14Z" fill="#f2d28c" stroke="#a9824e" strokeWidth="3" />
          <path d="M216 193h14M216 202h9" stroke="#f9ded0" strokeWidth="3" strokeLinecap="round" opacity=".7" />
        </g>
        <path d="M99 218h142c6 0 10 5 10 10v24c0 6-5 11-11 11H100c-6 0-11-5-11-11v-23c0-6 4-11 10-11Z" fill="#e2e3d5" stroke="#506d64" strokeWidth="5" />
        <path d="M128 235h83" stroke="#a8b6a6" strokeWidth="4" strokeLinecap="round" />
        <circle cx="118" cy="235" r="4" fill="#d26750" />
        <circle className="robot-spark" cx="75" cy="106" r="4" fill="#d26750" />
        <path className="robot-spark" d="m272 95 3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="#d8b660" />
      </svg>
    </div>
  );
}

function Router() {
  return (
    // Keep a shared shell (sidebar, navbar) outside the boundary so it
    // survives a page crash.
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
