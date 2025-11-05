import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { LuSun, LuMoon, LuGlobe } from "react-icons/lu";
import styles from "./Header.module.css";

export default function Header() {
  const [dark, setDark] = useState(true);
  const [lang, setLang] = useState<"EN" | "NL">("EN");
  const [time, setTime] = useState(dayjs().format("h:mm A"));
  const [temp, setTemp] = useState<string | null>(null);


  useEffect(() => {
    const interval = setInterval(() => setTime(dayjs().format("h:mm A")), 1000);
    return () => clearInterval(interval);
  }, []);

    useEffect(() => {
    const getWeather = async () => {
      try {
        // Get weather based on IP automatically (wttr.in handles location)
        const response = await fetch("https://wttr.in/?format=j1");
        const data = await response.json();

        // Current temperature in Celsius
        const currentTemp = data.current_condition?.[0]?.temp_C;
        if (currentTemp) setTemp(currentTemp);
      } catch (error) {
        console.error("Failed to get weather", error);
      }
    };

    getWeather();
  }, []);

  return (
    <header className={styles.header}>
      <h1 className={styles.title}>TONYDEV</h1>

      <div className={styles.right}>
        <span>
          {time} | {temp !== null ? `${temp}°C` : "…"}
        </span>
        <span className={styles.status}>
          <span className={styles.dot} /> Available for work
        </span>
        <button onClick={() => setLang(lang === "EN" ? "NL" : "EN")}>
          <LuGlobe /> {lang}
        </button>
        <button onClick={() => setDark(!dark)}>
          {dark ? <LuMoon /> : <LuSun />}
        </button>
      </div>
    </header>
  );
}
