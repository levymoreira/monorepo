import { Metadata } from "next";
import styles from "./page.module.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "Projects - Side Projects & Products",
  description: "Explore my side projects and products including Social Scrapper, Viralize Hub, Red Heart AI, and Open Lobby. A collection of web apps, APIs, and tools I've built.",
  keywords: ["side projects", "portfolio", "web applications", "Social Scrapper", "Viralize Hub", "Red Heart AI", "Open Lobby", "software projects"],
  openGraph: {
    title: "Projects - Levy Moreira",
    description: "Side projects and products by Levy Moreira. From social media tools to AI chat apps.",
    type: "website",
    url: "https://levymoreira.com/projects",
  },
  twitter: {
    card: "summary_large_image",
    title: "Projects - Levy Moreira",
    description: "Side projects and products I've built.",
  },
  alternates: {
    canonical: "https://levymoreira.com/projects",
  },
};

interface Project {
  name: string;
  url: string;
  description: string;
}

const projects: Record<string, Project[]> = {
  "2024": [
    {
      name: "Social Scrapper",
      url: "https://socialscrapper.com/",
      description: "Simple API and SDK for social media platforms",
    },
  ],
  "2023": [
    {
      name: "Viralize Hub",
      url: "https://viralizehub.com/",
      description: "Collection of tools for social media giveaways including raffles, leads and etc.",
    },
    {
      name: "Red Heart AI",
      url: "https://redheart.ai/",
      description: "Chat with AI friends",
    },
  ],
  "2022": [
    {
      name: "Open Lobby",
      url: "https://openlobby.com/",
      description: "Audio chat for Sony and XBOX consoles",
    },
  ],
};

export default function Projects() {
  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <div className={styles.content}>
          <div>
            <h1 className={styles.gradientHeading}>Work. Hobby. Open Source.</h1>
            <p>
              I'm obsessed with <strong>building</strong> products. Here you can navigate to <strong>different</strong> websites, apps, and libraries I have worked on. Some projects are still active, others have been discontinued.
            </p>
            
            <h2>Featured Projects</h2>
            <div className={styles.featuredProjects}>
              <a
                href="https://socialscrapper.com/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.projectCard}
              >
                <span className={styles.projectCardContent}>
                  <div style={{ width: "24px", height: "24px", marginBottom: "10px" }}></div>
                  <div className={styles.projectCardText}>
                    <p className={styles.projectTitle}>Social Scrapper</p>
                    <p className={styles.projectDescription}>Simple API and SDK for social media platforms</p>
                  </div>
                </span>
              </a>
              <a
                href="https://viralizehub.com/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.projectCard}
              >
                <span className={styles.projectCardContent}>
                  <div style={{ width: "24px", height: "24px", marginBottom: "10px" }}></div>
                  <div className={styles.projectCardText}>
                    <p className={styles.projectTitle}>Viralize Hub</p>
                    <p className={styles.projectDescription}>Collection of tools for social media giveaways including raffles, leads and etc.</p>
                  </div>
                </span>
              </a>
            </div>

            <h2>All Projects</h2>
            {Object.entries(projects).map(([year, yearProjects]) => (
              <div key={year} className={styles.yearSection}>
                <h3>{year}</h3>
                <ul>
                  {yearProjects.map((project) => (
                    <li key={project.url} className={styles.projectListItem}>
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.projectName}
                      >
                        {project.name}
                      </a>
                      <p className={styles.projectDesc}>{project.description}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
