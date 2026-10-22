import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  IDEAS,
  PATHS,
  byId,
  books as catalogBooks,
  formatYear,
  ideasInPath,
  pathOf,
} from './data';
import * as store from './store';
import './Commonplace.css';

function useTick() {
  const [n, setN] = useState(0);
  return [n, () => setN((x) => x + 1)];
}

function goParams(setParams, next) {
  setParams(next, { replace: false });
}

export default function Commonplace() {
  const [params, setParams] = useSearchParams();
  const [, refresh] = useTick();
  const view = params.get('v') || 'today';
  const ideaId = params.get('id');
  const pathId = params.get('p');

  const snapshot = store.load();
  const figures = store.stats(IDEAS);
  const today = useMemo(() => store.pickToday(IDEAS), [figures.seen, figures.kept, view]);

  useEffect(() => {
    document.documentElement.classList.add('cp-root');
    const prev = document.title;
    document.title = 'Commonplace — cuaderno de ideas';
    return () => {
      document.documentElement.classList.remove('cp-root');
      document.title = prev;
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view, ideaId, pathId]);

  const openIdea = (id) => {
    store.markSeen(id);
    refresh();
    goParams(setParams, { v: 'idea', id });
  };

  return (
    <div className="cp">
      <aside className="cp__margin" aria-hidden="true" />
      <header className="cp__top">
        <button type="button" className="cp__mark" onClick={() => goParams(setParams, { v: 'today' })}>
          <span className="cp__mark-kicker">cuaderno</span>
          <span className="cp__mark-name">Commonplace</span>
        </button>
        <nav className="cp__nav" aria-label="Commonplace">
          <NavBtn active={view === 'today'} onClick={() => goParams(setParams, { v: 'today' })}>
            Hoy
          </NavBtn>
          <NavBtn active={view === 'paths' || view === 'path'} onClick={() => goParams(setParams, { v: 'paths' })}>
            Caminos
          </NavBtn>
          <NavBtn active={view === 'shelf'} onClick={() => goParams(setParams, { v: 'shelf' })}>
            Estante
          </NavBtn>
          <NavBtn active={view === 'kept'} onClick={() => goParams(setParams, { v: 'kept' })}>
            Guardadas
          </NavBtn>
        </nav>
        <Link className="cp__exit" to="/projects">
          Portfolio
        </Link>
      </header>

      <main className="cp__main">
        <AnimatePresence mode="wait">
          {view === 'today' && (
            <Screen key="today">
              <Today
                idea={today}
                figures={figures}
                onOpen={() => openIdea(today.id)}
                onPaths={() => goParams(setParams, { v: 'paths' })}
              />
            </Screen>
          )}
          {view === 'idea' && !byId[ideaId] && (
            <Screen key="missing">
              <p className="cp-lede">Esa idea no está en el cuaderno.</p>
              <button type="button" className="cp-btn cp-btn--ink" onClick={() => goParams(setParams, { v: 'today' })}>
                Volver a hoy
              </button>
            </Screen>
          )}
          {view === 'idea' && byId[ideaId] && (
            <Screen key={`idea-${ideaId}`}>
              <Idea
                idea={byId[ideaId]}
                snapshot={snapshot}
                onKeep={() => {
                  store.keep(ideaId);
                  refresh();
                }}
                onLater={() => {
                  store.later(ideaId);
                  const nxt = store.nextUnread(IDEAS, ideaId);
                  if (nxt) openIdea(nxt.id);
                  else goParams(setParams, { v: 'today' });
                }}
                onNext={() => {
                  const nxt = store.nextUnread(IDEAS, ideaId);
                  if (nxt) openIdea(nxt.id);
                }}
                onAnswer={(text) => {
                  store.saveAnswer(ideaId, text);
                  refresh();
                }}
                onRelated={openIdea}
                onPath={(p) => goParams(setParams, { v: 'path', p })}
              />
            </Screen>
          )}
          {view === 'paths' && (
            <Screen key="paths">
              <PathsView onOpen={(p) => goParams(setParams, { v: 'path', p })} />
            </Screen>
          )}
          {view === 'path' && pathOf(pathId) && (
            <Screen key={`path-${pathId}`}>
              <PathView
                path={pathOf(pathId)}
                seen={snapshot.seen}
                onIdea={openIdea}
                onBack={() => goParams(setParams, { v: 'paths' })}
              />
            </Screen>
          )}
          {view === 'shelf' && (
            <Screen key="shelf">
              <Shelf seen={snapshot.seen} onIdea={openIdea} />
            </Screen>
          )}
          {view === 'kept' && (
            <Screen key="kept">
              <Kept
                items={store.keptIdeas(IDEAS)}
                onIdea={openIdea}
                onDrop={(id) => {
                  store.unkeep(id);
                  refresh();
                }}
              />
            </Screen>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function Screen({ children }) {
  return (
    <motion.div
      className="cp__screen"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function NavBtn({ active, onClick, children }) {
  return (
    <button type="button" className={`cp__nav-btn${active ? ' is-on' : ''}`} onClick={onClick}>
      {children}
    </button>
  );
}

function Today({ idea, figures, onOpen, onPaths }) {
  const path = pathOf(idea.path);
  return (
    <section className="cp-today">
      <p className="cp-kicker">Una idea. Un libro. Un contrapunto.</p>
      <h1 className="cp-today__title">No es un feed. Es un cuaderno.</h1>
      <p className="cp-lede">
        Deepstash te da tarjetas para pasar el rato. Aquí lees una tesis de un libro canónico, el argumento,
        el siglo que la hizo nacer, y otro libro que le lleva la contraria. Luego escribes. Lo que guardas
        vuelve — en dos días, en una semana, cuando ya no lo recuerdas tan limpio.
      </p>

      <ul className="cp-stats">
        <li>
          <strong>{figures.seen}</strong>
          <span>leídas / {figures.total}</span>
        </li>
        <li>
          <strong>{figures.kept}</strong>
          <span>guardadas</span>
        </li>
        <li>
          <strong>{figures.answered}</strong>
          <span>respuestas</span>
        </li>
        <li>
          <strong>{figures.streak}</strong>
          <span>días seguidos</span>
        </li>
      </ul>

      <article className="cp-hero">
        <div className="cp-hero__meta">
          <span>{path?.label}</span>
          <span aria-hidden="true">·</span>
          <span>{formatYear(idea.year)}</span>
          <span aria-hidden="true">·</span>
          <span>{idea.place}</span>
        </div>
        <p className="cp-hero__book">
          {idea.book}
          <em> — {idea.author}</em>
        </p>
        <h2 className="cp-hero__claim">{idea.claim}</h2>
        <div className="cp-hero__actions">
          <button type="button" className="cp-btn cp-btn--ink" onClick={onOpen}>
            Leer la idea
          </button>
          <button type="button" className="cp-btn cp-btn--ghost" onClick={onPaths}>
            Elegir un camino
          </button>
        </div>
      </article>

      <p className="cp-note">
        Comentario original sobre el canon — no citamos los libros. Gilgamesh, las Analectas, el Quijote,
        el Manifiesto, 1984, Orientalismo: el mapa, no la transcripción.
      </p>
    </section>
  );
}

function Idea({ idea, snapshot, onKeep, onLater, onNext, onAnswer, onRelated, onPath }) {
  const path = pathOf(idea.path);
  const kept = Boolean(snapshot.seen[idea.id]?.kept);
  const existing = snapshot.answers[idea.id] || '';
  const [draft, setDraft] = useState(existing);
  const related = (idea.related || []).map((id) => byId[id]).filter(Boolean);
  const due = store.dueIn(idea.id);

  useEffect(() => {
    setDraft(store.load().answers[idea.id] || '');
  }, [idea.id]);

  return (
    <article className="cp-idea">
      <header className="cp-idea__head">
        <button type="button" className="cp-chip" onClick={() => onPath(idea.path)}>
          {path?.label}
        </button>
        <p className="cp-idea__biblio">
          <span className="cp-idea__book">{idea.book}</span>
          <span>
            {idea.author} · {formatYear(idea.year)} · {idea.place}
          </span>
        </p>
      </header>

      <h1 className="cp-idea__claim">{idea.claim}</h1>

      <section className="cp-block">
        <h2>El argumento</h2>
        <p>{idea.argument}</p>
      </section>
      <section className="cp-block">
        <h2>El siglo</h2>
        <p>{idea.context}</p>
      </section>
      <section className="cp-block cp-block--echo">
        <h2>Otro libro contesta</h2>
        <p>{idea.echo}</p>
      </section>

      <section className="cp-ask">
        <h2>Pregunta para ti</h2>
        <p>{idea.ask}</p>
        <label className="cp-ask__label" htmlFor="cp-answer">
          Una línea. Nadie más la ve.
        </label>
        <textarea
          id="cp-answer"
          className="cp-ask__input"
          rows={3}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => onAnswer(draft)}
          placeholder="Escribe y sal. Se guarda aquí, en este navegador."
        />
        {draft.trim() && draft.trim() !== existing && (
          <button type="button" className="cp-btn cp-btn--tiny" onClick={() => onAnswer(draft)}>
            Guardar respuesta
          </button>
        )}
      </section>

      <div className="cp-idea__bar">
        <button type="button" className="cp-btn cp-btn--ink" onClick={onKeep}>
          {kept ? 'Volver a guardar' : 'Guardar para volver'}
        </button>
        <button type="button" className="cp-btn cp-btn--ghost" onClick={onLater}>
          Más tarde
        </button>
        <button type="button" className="cp-btn cp-btn--ghost" onClick={onNext}>
          Siguiente idea
        </button>
      </div>
      {kept && due && <p className="cp-due">Esta idea vuelve {due}.</p>}

      {related.length > 0 && (
        <section className="cp-related">
          <h2>Sigue el hilo</h2>
          <ul>
            {related.map((r) => (
              <li key={r.id}>
                <button type="button" onClick={() => onRelated(r.id)}>
                  <span>{r.book}</span>
                  <em>{r.claim}</em>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}

function PathsView({ onOpen }) {
  return (
    <section>
      <p className="cp-kicker">Ocho hilos, no mil tags</p>
      <h1 className="cp-page-title">Caminos</h1>
      <p className="cp-lede">
        Elige un problema humano. Los libros se ordenan alrededor de él, no alrededor de un algoritmo.
      </p>
      <ul className="cp-paths">
        {PATHS.map((p) => {
          const n = ideasInPath(p.id).length;
          return (
            <li key={p.id}>
              <button type="button" className="cp-path" onClick={() => onOpen(p.id)}>
                <span className="cp-path__n">{String(n).padStart(2, '0')}</span>
                <span>
                  <strong>{p.label}</strong>
                  <em>{p.blurb}</em>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function PathView({ path, seen, onIdea, onBack }) {
  const items = ideasInPath(path.id).sort((a, b) => a.year - b.year);
  return (
    <section>
      <button type="button" className="cp-back" onClick={onBack}>
        ← Caminos
      </button>
      <p className="cp-kicker">Camino</p>
      <h1 className="cp-page-title">{path.label}</h1>
      <p className="cp-lede">{path.blurb}</p>
      <ol className="cp-timeline">
        {items.map((idea) => (
          <li key={idea.id} className={seen[idea.id] ? 'is-read' : ''}>
            <button type="button" onClick={() => onIdea(idea.id)}>
              <time>{formatYear(idea.year)}</time>
              <span className="cp-timeline__book">{idea.book}</span>
              <span className="cp-timeline__claim">{idea.claim}</span>
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Shelf({ seen, onIdea }) {
  const rows = catalogBooks();
  return (
    <section>
      <p className="cp-kicker">Del barro al velo de ignorancia</p>
      <h1 className="cp-page-title">Estante</h1>
      <p className="cp-lede">
        El mismo canon, en el orden en que el mundo lo escribió. Un libro, una o dos ideas. Toca para leer.
      </p>
      <ol className="cp-shelf">
        {rows.map((row) => (
          <li key={row.book}>
            <div className="cp-shelf__biblio">
              <time>{formatYear(row.year)}</time>
              <h2>{row.book}</h2>
              <p>
                {row.author} · {row.place}
              </p>
            </div>
            <ul>
              {row.ideas.map((idea) => (
                <li key={idea.id}>
                  <button type="button" className={seen[idea.id] ? 'is-read' : ''} onClick={() => onIdea(idea.id)}>
                    {idea.claim}
                  </button>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Kept({ items, onIdea, onDrop }) {
  return (
    <section>
      <p className="cp-kicker">Lo que pediste que volviera</p>
      <h1 className="cp-page-title">Guardadas</h1>
      {items.length === 0 ? (
        <p className="cp-lede">Todavía no hay nada aquí. Lee una idea y pulsa guardar. Volverá cuando se te haya enfriado.</p>
      ) : (
        <ul className="cp-kept">
          {items.map((idea) => (
            <li key={idea.id}>
              <button type="button" className="cp-kept__open" onClick={() => onIdea(idea.id)}>
                <span className="cp-kept__book">{idea.book}</span>
                <span className="cp-kept__claim">{idea.claim}</span>
                <span className="cp-kept__due">Vuelve {store.dueIn(idea.id)}</span>
              </button>
              <button type="button" className="cp-kept__drop" onClick={() => onDrop(idea.id)}>
                Soltar
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
