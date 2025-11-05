import { LuMapPin } from "react-icons/lu";
import styles from "./ProfileIntro.module.css";
import img_ from '../../assets/tony.png';
import personalData from './details/me.json';
import persExp from './details/experience.json';
import schoolExp from './details/school.json';

export default function ProfileIntro() {
  return (
    <section className={styles.card}>
      <img src={img_} alt="avatar" className={styles.avatar} />
      <div>
        <h2 className={styles.name}>Hi, I am {personalData.name},</h2>
        <p className={styles.bio}>
          a full stack developer specializing in UI design and creating engaging user experiences
          with a strong attention to detail.
        </p>
        <p className={styles.location}><LuMapPin /> {personalData.city}, {personalData.location}</p>

         <ul className={styles.jobs}>
          {schoolExp.map((exp) => (
            <li key={exp.school}>
              <span className={styles.jobTitle}>
                {exp.degree} @ {exp.school}
              </span>{" "}
              — {exp.startYear} - {exp.endYear}
            </li>
          ))}
        </ul>

        <ul className={styles.jobs}>
          {persExp.map((exp) => (
            <li key={exp.company}>
              <span className={styles.jobTitle}>
                {exp.title} @ {exp.company}
              </span>{" "}
              — {exp.period}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
