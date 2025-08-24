"use client";
import styles from "./Header.module.scss";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brand}>
          <img src="/logo-sankofa.svg" alt="Sankofa" className={styles.logo} />
        </div>
        <div className={styles.right}>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}