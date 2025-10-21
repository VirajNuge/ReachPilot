import styles from "./guestNavBar.module.css";

const GuestNavBar = () => {
  return (
    <div className={styles.guestNavBarContainer}>
      <div className={styles.guestNavBarTitle}>
        <img src="/images/logo.svg" alt="Logo" />
        <p>ReachPilot</p>
      </div>

      <div className={styles.guestNavBarLinks}>
        <a href="/" aria-current="page">
          HOME
        </a>
        <a href="/services">SERVICES</a>
        <a href="/pricing">PRICING</a>
        <a href="/inspirations">INSPIRATIONS</a>
        <a href="/contact">CONTACT US</a>
      </div>

      <div className={styles.guestNavBarButtons}>
        <button className={styles.login}>LOGIN</button>
        <button className={styles.signup}>SIGN UP</button>
      </div>
    </div>
  );
};

export default GuestNavBar;
