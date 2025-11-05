import Header from '../AboutMe/Header';
import SpendingBrains from './SpendingBrains';

function SpendingPage() {
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem" }}>
      <Header />
      <main style={{ display: "grid", gap: "2rem", marginTop: "3rem" }}>
        <SpendingBrains />
      </main>
    </div>
  );
};

export default SpendingPage;
