import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaShieldAlt, FaBan, FaExclamationTriangle, FaCheckCircle, FaTerminal, FaPlay, FaSyncAlt } from 'react-icons/fa';
import './GanpiDemo.css';

/* ─────────────────────────────────────────────────────────────
   GANPI Live Demo — natural language → safe shell command
   Pattern-matching translator + safety layer with simulated exec
   ───────────────────────────────────────────────────────────── */

const EXAMPLES = [
  'list all files in this folder',
  'find every pdf under the current directory',
  'how much disk space am I using',
  'show me the running processes',
  'count lines of python code',
  'delete everything from my machine',
];

/**
 * Small NL → shell translator. Pure pattern matching, mirroring
 * the intent-detection layer that sits in front of Gemini in the real CLI.
 */
function translate(nl) {
  const s = nl.toLowerCase().trim();

  // ─── Safety net first: block dangerous intents ───
  if (/(rm\s+-rf|delete\s+everything|wipe\s+(the|my)\s+(machine|disk|drive)|format\s+(c|d):|del\s+\/[fs])/i.test(s)) {
    return {
      command: 'rm -rf /',
      safety: {
        level: 'blocked',
        label: 'blocked',
        reason: 'Destructive filesystem operation. GANPI refuses to translate a wipe command.',
      },
    };
  }
  if (/chmod\s+777|make\s+.*writable\s+by\s+everyone/i.test(s)) {
    return {
      command: 'chmod 777 <path>',
      safety: {
        level: 'blocked',
        label: 'blocked',
        reason: 'chmod 777 grants world-write access. Denied.',
      },
    };
  }
  if (/(shutdown|reboot|poweroff|halt)/i.test(s)) {
    return {
      command: 'shutdown /s /t 0',
      safety: {
        level: 'warn',
        label: 'confirm',
        reason: 'Will power off the machine. Type "yes" to proceed in the real CLI.',
      },
    };
  }

  // ─── Common intents ───
  if (/list\s+all|hidden\s+files|show\s+hidden/i.test(s))       return safe('ls -la');
  if (/list|show\s+files|what.?s\s+here|contents\s+of/i.test(s)) return safe('ls -lh');
  if (/find.*(pdf)/i.test(s))                                  return safe('find . -type f -name "*.pdf"');
  if (/find.*(image|photo|png|jpg)/i.test(s))                   return safe('find . -type f \\( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" \\)');
  if (/find.*(python|\.py)/i.test(s))                           return safe('find . -type f -name "*.py"');
  if (/find\s+(a\s+)?file\s+(named|called)\s+["']?(\S+?)["']?$/i.test(s)) {
    const m = s.match(/find\s+(a\s+)?file\s+(named|called)\s+["']?(\S+?)["']?$/i);
    return safe(`find . -type f -name "${m[3]}"`);
  }
  if (/count.*(lines|loc).*(python|py)/i.test(s))               return safe('find . -name "*.py" -not -path "*/.*" | xargs wc -l');
  if (/count.*(lines|loc)/i.test(s))                            return safe('find . -type f -not -path "*/.*" | xargs wc -l 2>/dev/null');
  if (/disk\s+space|disk\s+usage|how\s+(much|big).*folder/i.test(s))  return safe('du -sh * 2>/dev/null | sort -h');
  if (/free\s+space|available\s+space/i.test(s))                return safe('df -h');
  if (/running\s+processes|list\s+processes|what.?s\s+running/i.test(s)) return safe('ps aux | head -20');
  if (/where\s+am\s+i|current\s+(dir|folder|directory)|pwd/i.test(s))  return safe('pwd');
  if (/what.?s\s+(the\s+)?time|current\s+time|clock/i.test(s))  return safe('date +"%H:%M:%S"');
  if (/git\s+status|git\s+state/i.test(s))                      return safe('git status');
  if (/git\s+log|last\s+commits|recent\s+commits/i.test(s))     return safe('git log --oneline -10');
  if (/ip\s+address|my\s+ip/i.test(s))                          return safe('ip addr show || ifconfig');
  if (/create\s+(a\s+)?(new\s+)?(folder|directory)\s+(called|named)\s+["']?(\S+?)["']?$/i.test(s)) {
    const m = s.match(/create\s+(a\s+)?(new\s+)?(folder|directory)\s+(called|named)\s+["']?(\S+?)["']?$/i);
    return safe(`mkdir -p ${m[5]}`);
  }
  if (/who\s+am\s+i/i.test(s))                                  return safe('whoami');

  // ─── Fallback: acknowledge that Gemini would handle the rest ───
  return {
    command: `# GANPI (Gemini) would clarify: "${nl}"`,
    safety: {
      level: 'info',
      label: 'clarify',
      reason: 'The pattern layer did not match. In the real CLI, this goes to Gemini with your workspace context.',
    },
  };
}

function safe(command) {
  return {
    command,
    safety: {
      level: 'safe',
      label: 'safe',
      reason: 'Read-only or scoped to current directory. Cleared for execution.',
    },
  };
}

/**
 * Fake but plausible outputs so the "run" button feels real.
 */
function simulate(command) {
  if (command.startsWith('ls -lh')) {
    return [
      'total 24K',
      '-rw-r--r-- 1 rgomero users  2.1K Sep 15 22:14 README.md',
      'drwxr-xr-x 3 rgomero users  4.0K Sep 15 22:14 python-tools',
      'drwxr-xr-x 5 rgomero users  4.0K Sep 15 22:14 src',
      '-rw-r--r-- 1 rgomero users   584 Sep 15 22:14 package.json',
      '-rw-r--r-- 1 rgomero users  1.3K Sep 15 22:14 vite.config.js',
    ].join('\n');
  }
  if (command.startsWith('ls -la')) {
    return [
      'total 32K',
      'drwxr-xr-x 6 rgomero users 4.0K Sep 15 22:14 .',
      'drwxr-xr-x 3 rgomero users 4.0K Sep 15 22:14 ..',
      '-rw-r--r-- 1 rgomero users  158 Sep 15 22:14 .env.local',
      '-rw-r--r-- 1 rgomero users  283 Sep 15 22:14 .gitignore',
      'drwxr-xr-x 3 rgomero users 4.0K Sep 15 22:14 python-tools',
      'drwxr-xr-x 5 rgomero users 4.0K Sep 15 22:14 src',
    ].join('\n');
  }
  if (command.includes('find') && command.includes('pdf')) {
    return [
      './resume/IT/Raul_Resume.pdf',
      './resume/dev/Raul_Resume_Dev.pdf',
      './docs/references/UCI-heart-disease.pdf',
      './python-tools/pc-watchdog/reports/2026-W37.pdf',
    ].join('\n');
  }
  if (command.startsWith('du -sh')) {
    return [
      '2.1M    src',
      '4.7M    public',
      '18M     python-tools',
      '386M    node_modules',
    ].join('\n');
  }
  if (command.startsWith('df -h')) {
    return [
      'Filesystem      Size  Used Avail Use% Mounted on',
      'C:              1.8T  622G  1.2T  35% /',
    ].join('\n');
  }
  if (command.startsWith('ps aux')) {
    return [
      'USER      PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND',
      'rgomero  4218  0.4  1.2  512M  180M ?        Sl   09:12   0:04 node',
      'rgomero  4290  2.1  3.8  1.2G  590M ?        Sl   09:12   0:22 chrome',
      'rgomero  4302  0.1  0.4  128M   62M ?        S    09:12   0:00 code',
    ].join('\n');
  }
  if (command.startsWith('pwd')) {
    return '/c/Users/rgome/OneDrive/Desktop/Archivos personales/graduate/website-tech';
  }
  if (command.startsWith('date')) {
    return new Date().toLocaleTimeString([], { hour12: false });
  }
  if (command.startsWith('git status')) {
    return [
      'On branch main',
      'Your branch is up to date with \'origin/main\'.',
      '',
      'Changes not staged for commit:',
      '  modified:   src/components/Projects/Projects.jsx',
      '  modified:   src/i18n/locales/en.json',
      '',
      'no changes added to commit (use "git add" and/or "git commit -a")',
    ].join('\n');
  }
  if (command.includes('wc -l')) {
    return [
      '  184 ./src/components/PCBuild/PCBuild.jsx',
      '  278 ./src/components/Projects/Projects.jsx',
      '  148 ./python-tools/pc-watchdog/digest.py',
      '  312 ./python-tools/pc-watchdog/watchdog.py',
      ' 922 total',
    ].join('\n');
  }
  if (command.startsWith('whoami')) return 'rgomero';
  return '# simulated: command would execute here';
}

/* ─────────────────────────── icons per verdict ─────────────────────────── */
const SAFETY_ICON = {
  safe:    FaCheckCircle,
  info:    FaShieldAlt,
  warn:    FaExclamationTriangle,
  blocked: FaBan,
};

/* ─────────────────────────── component ─────────────────────────── */

const GanpiDemo = () => {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [output, setOutput] = useState(null);

  const run = () => {
    if (!input.trim()) return;
    setResult(translate(input));
    setOutput(null);
  };

  const approve = () => {
    if (!result || result.safety.level === 'blocked') return;
    setOutput(simulate(result.command));
  };

  const reset = () => {
    setInput('');
    setResult(null);
    setOutput(null);
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); run(); }
  };

  const SafetyIcon = result ? SAFETY_ICON[result.safety.level] : null;

  return (
    <div className="ganpi-demo">
      <header className="ganpi-demo__head">
        <div>
          <span className="ganpi-demo__eyebrow">
            <FaTerminal aria-hidden="true" />
            {t('ganpi.demo.live')}
          </span>
          <h3 className="ganpi-demo__title">{t('ganpi.demo.title')}</h3>
          <p className="ganpi-demo__subtitle">{t('ganpi.demo.subtitle')}</p>
        </div>
      </header>

      {/* ─── Example chips ─── */}
      <div className="ganpi-demo__examples">
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            className="ganpi-demo__example"
            onClick={() => { setInput(ex); setResult(null); setOutput(null); }}
          >
            {ex}
          </button>
        ))}
      </div>

      {/* ─── Prompt ─── */}
      <div className="ganpi-demo__prompt">
        <span className="ganpi-demo__caret">▸ ganpi &gt;</span>
        <input
          type="text"
          className="ganpi-demo__input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={t('ganpi.demo.placeholder')}
          spellCheck={false}
          autoComplete="off"
        />
        <button type="button" className="ganpi-demo__btn ganpi-demo__btn--primary" onClick={run}>
          {t('ganpi.demo.translate')}
        </button>
        {(result || output) && (
          <button type="button" className="ganpi-demo__btn ganpi-demo__btn--ghost" onClick={reset} aria-label="Reset">
            <FaSyncAlt />
          </button>
        )}
      </div>

      {/* ─── Verdict + command ─── */}
      {result && (
        <div className="ganpi-demo__result">
          <div className={`ganpi-demo__safety ganpi-demo__safety--${result.safety.level}`}>
            <SafetyIcon aria-hidden="true" />
            <span className="ganpi-demo__safety-label">{t(`ganpi.demo.verdicts.${result.safety.level}`)}</span>
            <span className="ganpi-demo__safety-reason">{result.safety.reason}</span>
          </div>

          <div className="ganpi-demo__cmd">
            <span className="ganpi-demo__cmd-dollar">$</span>
            <code>{result.command}</code>
          </div>

          {result.safety.level !== 'blocked' && !output && (
            <button type="button" className="ganpi-demo__btn ganpi-demo__btn--run" onClick={approve}>
              <FaPlay /> {t('ganpi.demo.approve')}
            </button>
          )}

          {output && (
            <pre className="ganpi-demo__output">
              <span className="ganpi-demo__output-tag">stdout</span>
              {output}
            </pre>
          )}
        </div>
      )}

      <footer className="ganpi-demo__foot">
        <p className="ganpi-demo__foot-note">
          {t('ganpi.demo.footNote')}
        </p>
      </footer>
    </div>
  );
};

export default GanpiDemo;
