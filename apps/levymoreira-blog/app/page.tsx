import Link from "next/link";
import styles from "./page.module.css";
import Header from "./components/Header";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <div className={styles.content}>
          <div>
            <h1>Levy Moreira</h1>
            <p>
              <strong>
                Software Engineer at{" "}
                <a href="https://microsoft.com/" target="_blank" rel="noopener noreferrer">
                  Microsoft
                </a>{" "}
                and founder of many{" "}
                <Link href="/projects">
                  side projects
                </Link>
              </strong>
              <br />
              Obsessed with software development and and developing amazing products
            </p>
            <div></div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
