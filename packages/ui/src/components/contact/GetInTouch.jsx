import { useState } from "react";
import Button from "../common/button/Button";
import ContactForm from "./ContactForm";
import styles from "./GetInTouch.module.css";

function GetInTouch() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className={styles["git-container"]}>
      <div className={styles.card}>
        <h2 className={styles.title}>Still have questions?</h2>
        <p className={styles.description}>
          Can&apos;t find the answer you&apos;re looking for? Please chat to our
          friendly team.
        </p>
        <Button
          onClick={openModal}
          className={styles["cta-button"]}
          variant="primary"
        >
          Get in touch
        </Button>
      </div>

      {isModalOpen && <ContactForm closeModal={closeModal} />}
    </div>
  );
}

export default GetInTouch;
