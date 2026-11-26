export function App() {
  return (
    <main>
      <div onClick={() => go()} className="card">Open</div>
      <button onClick={close}><XIcon /></button>
      <input type="text" placeholder="Search" />
    </main>
  );
}
