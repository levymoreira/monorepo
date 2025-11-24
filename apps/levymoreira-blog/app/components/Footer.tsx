import "remixicon/fonts/remixicon.css";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <a
        href="/contact"
        className={styles.socialLink}
      >
        <span className={styles.socialText}>Email</span>
        <i className="ri-mail-line"></i>
      </a>
      <a
        href="https://twitter.com/_levymoreira"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.socialLink}
      >
        <span className={styles.socialText}>Twitter</span>
        <i className="ri-twitter-line"></i>
      </a>
      <a
        href="https://github.com/levymoreira"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.socialLink}
      >
        <span className={styles.socialText}>GitHub</span>
        <i className="ri-github-line"></i>
      </a>
      <a
        href="https://linkedin.com/in/levymoreira"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.socialLink}
      >
        <span className={styles.socialText}>linkedin</span>
        <i className="ri-linkedin-line"></i>
      </a>
      <a
        href="https://instagram.com/levymoreira"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.socialLink}
      >
        <span className={styles.socialText}>Instagram</span>
        <i className="ri-instagram-line"></i>
      </a>
    </footer>
  );
}

