import { LuArrowRight } from "react-icons/lu";
import styles from "./RecentWork.module.css";

export default function RecentWork() {
    const projects = [
    {name: "MoneyBalance", url: "/moneybalance"},
    {name: "HobbyCount", url: "/hobbycount"},
    { name: "GitHub", url: "https://github.com/ToneMatheus" },
    { name: "Project Spending Page", url: "/spending" },
  ];
  return (
    <section className={styles.card}>
      <h3>Recent Work</h3>
      <ul>
        {projects.map((p) => (
          <li key={p.name}>
            <a href={p.url}>
              {p.name} <LuArrowRight />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
