export function App({ query, setQuery }) {
  return (
    <main>
      <button type="button" onClick={() => go()} className="card focus-visible:outline-2">Open</button>
      <button type="button" onClick={close} aria-label="Close"><XIcon aria-hidden /></button>
      <label htmlFor="search">Search products</label>
      <input id="search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} />
    </main>
  );
}
