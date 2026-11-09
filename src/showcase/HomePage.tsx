import React, { useState } from 'react';

interface HomePageProps {
  onOpenProject: (projectId: string) => void;
  onOpenPlayground: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onOpenProject, onOpenPlayground }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Author / Masthead Header */}
        <header style={styles.header}>
          <h1 style={styles.authorTitle}>Logan O'Neill</h1>
          <time style={styles.updateTime}>Updated Nov 3, 2026</time>
        </header>

        {/* Bio / Playground Statement */}
        <div style={styles.bioProse}>
          <p style={styles.paragraph}>
            I design my ideas and practice with AI to make them function.
          </p>
          <p style={styles.paragraph}>
            This is my AI playground. An open workshop where I craft visual foundations in Figma, explore various ways that interfaces can react, and build functional software using AI agents.
          </p>
          <p style={styles.paragraph}>
            You can explore the live experiment below. Reach me via{' '}
            <a href="mailto:loganoneill@gmail.com" style={styles.basicLink}>
              email
            </a>
            . I would love to connect and build!
          </p>
        </div>

        {/* Projects / Writing Section */}
        <section style={styles.section}>
          <h3 style={styles.sectionHeading}>Playground & Projects</h3>

          <div style={styles.postListContainer}>
            {/* Year Group: 2026 */}
            <div style={styles.yearRow}>
              <span style={styles.yearLabel}>2026</span>
              <div style={styles.yearDivider} />
            </div>

            <ul style={styles.projectList}>
              <li
                style={{
                  ...styles.projectItem,
                  transform: isHovered ? 'translateX(4px)' : 'none',
                  transition: 'transform 0.16s ease',
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={() => onOpenProject('cherrypick')}
              >
                <div style={styles.projectItemContent}>
                  <div style={styles.projectTitleRow}>
                    <h2 style={styles.projectTitle}>
                      CherryPick
                      <span style={styles.newBadge}>New</span>
                    </h2>
                    <span style={styles.projectDate}>03/11/2026</span>
                  </div>
                  <p style={styles.projectDescription}>
                    Live NBA multitasking extension for Chrome with gradient team expressions and ambient clutch detection.
                  </p>
                </div>
              </li>
            </ul>

            {/* Underneath CherryPick: simple, clean coming soon */}
            <div style={styles.comingSoonRow}>
              <span style={styles.comingSoonText}>More coming soon</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#ffffff',
    color: '#18181b',
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
    padding: '72px 24px 96px',
    fontSize: 14,
  },
  container: {
    maxWidth: 620,
    margin: '0 auto',
  },
  header: {
    marginBottom: 24,
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
  },
  authorTitle: {
    fontSize: 14,
    fontWeight: 600,
    letterSpacing: '-0.01em',
    color: '#111111',
    margin: 0,
  },
  updateTime: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.4)',
    fontWeight: 400,
  },
  bioProse: {
    marginBottom: 44,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 1.65,
    color: '#27272a',
    margin: '0 0 16px',
    fontWeight: 400,
  },
  basicLink: {
    color: '#111111',
    fontSize: 14,
    fontWeight: 400,
    textDecoration: 'none',
    borderBottom: '1px solid #d4d4d8',
    paddingBottom: 1,
    transition: 'border-color 0.2s ease',
  },
  section: {
    marginTop: 40,
    marginBottom: 40,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: 600,
    color: 'rgba(0, 0, 0, 0.4)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    margin: '0 0 16px',
  },
  postListContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  yearRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 6,
  },
  yearLabel: {
    fontSize: 14,
    fontWeight: 500,
    color: 'rgba(0, 0, 0, 0.4)',
  },
  yearDivider: {
    flex: 1,
    height: 1,
    background: '#f4f4f5',
  },
  projectList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  projectItem: {
    borderBottom: '1px solid #f4f4f5',
    padding: '16px 0',
    cursor: 'pointer',
  },
  projectItemContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  projectTitleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  projectTitle: {
    margin: 0,
    fontSize: 14,
    fontWeight: 600,
    letterSpacing: '-0.01em',
    color: '#111111',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  newBadge: {
    fontSize: 14,
    fontWeight: 600,
    color: 'rgb(255, 0, 170)',
    letterSpacing: '0.01em',
  },
  projectDate: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.4)',
    fontWeight: 400,
    letterSpacing: '-0.01em',
    fontVariantNumeric: 'normal',
    fontFamily: 'inherit',
  },
  projectDescription: {
    margin: '2px 0 0',
    fontSize: 14,
    lineHeight: 1.55,
    color: 'rgba(0, 0, 0, 0.4)',
    fontWeight: 400,
  },
  comingSoonRow: {
    padding: '16px 0 0',
  },
  comingSoonText: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.4)',
    fontWeight: 400,
  },
};
