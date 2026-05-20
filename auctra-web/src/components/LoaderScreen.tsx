"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import styles from './LoaderScreen.module.css';

const messages = [
  'Initializing Oktra modules...',
  'Connecting auction network...',
  'Loading blockchain marketplace...',
  'Validating digital assets...',
  'Preparing bidding arena...',
  'Syncing collectible metadata...',
  'Launching immersive experience...',
  'Welcome to Oktra.'
];

export default function LoaderScreen() {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [show, setShow] = useState(true);

  useEffect(() => {
    let mounted = true;

    const messageInterval = setInterval(() => {
      setCurrentMessage((prev) => Math.min(prev + 1, messages.length - 1));
    }, 500);

    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 1, 100));
    }, 40);

    const finish = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        if (mounted) setShow(false);
      }, 1000);
    }, 4000);

    return () => {
      mounted = false;
      clearInterval(messageInterval);
      clearInterval(progressInterval);
      clearTimeout(finish);
    };
  }, []);

  if (!show) return null;

  return (
    <div className={styles.loaderContainer}>
      <div className={styles.background}>
        <div className={styles.particles}></div>
      </div>
      <motion.div
        className={styles.terminalCard}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.terminalText}>
          {messages.map((message, index) => (
            <motion.p
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: currentMessage >= index ? 1 : 0 }}
              transition={{ duration: 0.3, delay: index * 0.2 }}
            >
              {message}
            </motion.p>
          ))}
        </div>
        <div className={styles.progressBarContainer}>
          <motion.div
            className={styles.progressBar}
            style={{ width: `${progress}%` }}
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
          <span className={styles.progressText}>{progress}%</span>
        </div>
      </motion.div>
    </div>
  );
}
