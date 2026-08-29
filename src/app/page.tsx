import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Next.js + React</h1>
        <p className={styles.subtitle}>
          Your clean starter project is ready. Edit <code>src/app/page.tsx</code> to start building!
        </p>
      </div>
    </main>
  );
}
