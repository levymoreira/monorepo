"use client";

import { useRef } from "react";
import Image from "next/image";
import styles from "./page.module.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "remixicon/fonts/remixicon.css";

// Metadata is added via layout wrapper since this is a client component

export default function About() {
  const audioRef = useRef<HTMLAudioElement>(null);

  const handlePlayPronunciation = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <div className={styles.content}>
          <div>
            <h1 className={styles.gradientHeading}>Create. Share. Repeat.</h1>
            <div className={styles.aboutLayout}>
              <div className={styles.avatarContainer}>
                <div className={styles.avatarPlaceholder}>
                  <Image
                    src="/static/images/avatar.jpg"
                    alt="Levy Moreira - Software Engineer at Microsoft"
                    fill
                    className={styles.avatarImage}
                    priority
                  />
                </div>
              </div>
              <div className={styles.textContainer}>
                <p className={styles.paragraph}>
                  <strong>Hey, I'm Levy Moreira</strong>
                  <button
                    role="button"
                    aria-label="How to pronounce my name"
                    className={styles.pronunciationButton}
                    onClick={handlePlayPronunciation}
                  >
                    <i className="ri-play-circle-fill"></i>
                  </button>
                  <audio ref={audioRef} src="/static/audio/pronunciation.mp3"></audio>
                  I started as a software engineer back in 2009, working with Delphi and Java.
                </p>
                <p className={styles.paragraph}>
                  I'm currently Software Engineer at Microsoft. I'm originally from Brazil and now living in <strong>Dublin, Ireland</strong> with my amazing wife and beautiful son.
                </p>
                <p className={styles.paragraph}>
                  I have many <strong>side projects</strong> and keep history of them here. When I'm not working, I like running, watching movies, and <strong>eating burgers</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

