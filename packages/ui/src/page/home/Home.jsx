import { useContext } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import About from "../../components/about/About";
import Demo from "../../components/demo/Demo";
import Features from "../../components/features/Features";
import HeroSection from "../../components/hero/HeroSection";
import FAQs from "../../components/faqs/FAQs";
import Pricing from "../../components/pricing/Pricing";
import GetInTouch from "../../components/contact/GetInTouch";
import { AuthContext, UserContext } from "../../contexts/Contexts";

import ScrollReveal from "../../components/common/scroll/ScrollReveal";

const Home = ({ openAuthModal }) => {
  const navigate = useNavigate();
  const { userData } = useContext(UserContext);
  const { isAuthenticated } = useContext(AuthContext);

  const onHeroSectionButtonClick = () =>
    isAuthenticated ? navigate("/dashboard") : openAuthModal();

  return (
    <>
      <ScrollReveal>
        <HeroSection
          onPrimaryButtonClick={onHeroSectionButtonClick}
          isAuthenticated={isAuthenticated}
        />
      </ScrollReveal>
      <ScrollReveal>
        <Demo openAuthModal={openAuthModal} />
      </ScrollReveal>
      <ScrollReveal>
        <Features />
      </ScrollReveal>
      <ScrollReveal>
        <Pricing
          openAuthModal={openAuthModal}
          activePlan={userData?.subscription?.type}
        />
      </ScrollReveal>
      <ScrollReveal>
        <About />
      </ScrollReveal>
      <ScrollReveal>
        <FAQs />
      </ScrollReveal>
      <ScrollReveal>
        <GetInTouch />
      </ScrollReveal>
    </>
  );
};

Home.propTypes = {
  openAuthModal: PropTypes.func.isRequired,
};

export default Home;
