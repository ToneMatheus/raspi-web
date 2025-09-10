import HomeSpot from "./HomeSpot";
import styles from "./SpotAI.module.css";

function SpotAI() {
 return (
    <>
      <div className={`${styles.appContainer} d-flex`}>
        <aside className={`${styles.sidebar} bg-dark text-white p-3`}>
          <h4>Your Library</h4>
          <button className="btn btn-outline-light w-100 mb-3">Create Playlist</button>
          <button className="btn btn-outline-light w-100">Browse Podcasts</button>
        </aside>

        <main className={`${styles.content} flex-grow-1 p-4`}>
          <HomeSpot />
        </main>
      </div>
    </>
  );
}
export default SpotAI;