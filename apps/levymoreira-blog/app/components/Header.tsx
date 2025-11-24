"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import "remixicon/fonts/remixicon.css";
import styles from "./Header.module.css";

export default function Header() {
  const pathname = usePathname();
  
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.logo}>
        L
      </Link>
      <nav className={styles.nav}>
        <ul className={styles.navList}>
          <li>
            <Link href="/about" className={styles.navLink}>
              <span className={`${styles.navText} ${pathname === "/about" ? styles.navTextActive : ""}`}>About</span>
            </Link>
          </li>
          <li>
            <Link href="/projects" className={styles.navLink}>
              <span className={`${styles.navText} ${pathname === "/projects" ? styles.navTextActive : ""}`}>Projects</span>
            </Link>
          </li>
          <li>
            <Link href="/uses" className={styles.navLink}>
              <span className={`${styles.navText} ${pathname === "/uses" ? styles.navTextActive : ""}`}>Uses</span>
            </Link>
          </li>
        </ul>
      </nav>
      <div className={styles.commandButton}>
        <button
          type="button"
          aria-label="Command"
          className={styles.commandBtn}
        >
          <i className="ri-command-line"></i>
        </button>
      </div>
    </header>
  );
}

