import {
  SiReact,
  SiAngular,
  SiIonic,
  SiJavascript,
  SiTypescript,
  SiSharp,
  SiCplusplus,
  SiC,
  SiPhp,
  SiMysql,
  SiGnubash,
  SiLinux,
  SiGit,
  SiGithub,
} from "react-icons/si";
import { FaJava, FaDatabase  } from "react-icons/fa";
import styles from "./Technologies.module.css";

const techs = [
  { icon: <SiReact color="#61DAFB" />, name: "React" },
  { icon: <SiAngular color="#DD0031" />, name: "Angular" },
  { icon: <SiIonic color="#3880FF" />, name: "Ionic" },
  { icon: <SiJavascript color="#F7DF1E" />, name: "JavaScript" },
  { icon: <SiTypescript color="#3178C6" />, name: "TypeScript" },
  { icon: <FaJava color="#f89820" />, name: "Java" },
  { icon: <SiSharp color="#68217A" />, name: "C#" },
  { icon: <SiCplusplus color="#00599C" />, name: "C++" },
  { icon: <SiC color="#A8B9CC" />, name: "C" },
  { icon: <SiPhp color="#777BB4" />, name: "PHP" },
  { icon: <SiMysql color="#4479A1" />, name: "MySQL" },
  { icon: <FaDatabase  color="#336791" />, name: "SQL" },
  { icon: <SiGnubash color="#4EAA25" />, name: "Bash" },
  { icon: <SiLinux color="#FCC624" />, name: "Linux" },
  { icon: <SiGit color="#F05032" />, name: "Git" },
  { icon: <SiGithub color="#FFFFFF" />, name: "GitHub" },
];

export default function Technologies() {
  return (
    <section className={styles.card}>
      <h3>Technologies</h3>
      <div className={styles.grid}>
        {techs.map((t) => (
          <div key={t.name} className={styles.tech}>
            {t.icon}
            <span>{t.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
