import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>BLIH Web</h1>
        <p>Frontend architecture is now feature-first and ready for module implementation.</p>
        <p>
          Start building in <code>src/features</code> and keep route composition in{" "}
          <code>src/app</code>.
        </p>
      </main>
    </div>
  );
}
