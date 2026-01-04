import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import styles from "./Accomplishment.module.css";
import star from "../../assets/Aramark_star.jpeg";

export default function Accomplishment() {
  const projects = [{ name: "Aramark" }];

  return (
    <section className={styles.card}>
      <h3>Accomplishments</h3>

      {projects.map((p) => (
        <Accordion
          key={p.name}
          disableGutters
          elevation={0}
          sx={{
            bgcolor: "transparent",
            color: "#e5e5e5",
            "&:before": { display: "none" }, // removes the default divider line
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: "#e5e5e5" }} />}
            sx={{
              bgcolor: "rgba(255,255,255,0.05)",
              borderRadius: "8px",
              px: 2,
              py: 0.5,
              "& .MuiAccordionSummary-content": {
                margin: 0,
              },
            }}
          >
            {p.name}
          </AccordionSummary>

          <AccordionDetails sx={{ display: "flex", justifyContent: "center", pt: 2 }}>
            <img
              src={star}
              alt="employee of the month"
              style={{
                width: "min(160px, 70vw)",
                height: "auto",
                borderRadius: 6,
                display: "block",
              }}
            />
          </AccordionDetails>
        </Accordion>
      ))}
    </section>
  );
}
