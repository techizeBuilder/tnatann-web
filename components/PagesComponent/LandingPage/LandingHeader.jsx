"use client";
import { t } from "@/utils";
import { useSelector } from "react-redux";
import { settingsData } from "@/redux/reducer/settingSlice";
import LanguageDropdown from "../../Common/LanguageDropdown";
import LandingMobileMenu from "@/components/PagesComponent/LandingPage/LandingMobileMenu";
import { useState, useEffect } from "react";
import CustomImage from "@/components/Common/CustomImage";

const LandingHeader = () => {
  const settings = useSelector(settingsData);
  const [isShowMobileMenu, setIsShowMobileMenu] = useState(false);
  const [activeSection, setActiveSection] = useState("anythingYouWant");

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

// Intersection Observer to track which section is currently visible
  useEffect(() => {
    const sections = ["anythingYouWant", "work_process", "faq", "ourBlogs"];
    const observerOptions = {
      root: null,
      rootMargin: "0px", // Trigger when section is 20% from top
      threshold: 0.7,
    };
    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };
    const observer = new IntersectionObserver(
      observerCallback,
      observerOptions
    );
    // Observe all sections
    sections.forEach((sectionId) => {
      const element = document.getElementById(sectionId);
      if (element) {
        observer.observe(element);
      }
    });
    // Cleanup observer on component unmount
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 bg-white shadow-2xs">
        <nav className="shadow-md">
          <div className="container py-5 lg:flex lg:items-center lg:justify-between">
            <div className="flex w-full lg:w-auto items-center justify-between">
              <CustomImage
                src={settings?.header_logo}
                className="w-full h-[52px] object-contain ltr:object-left rtl:object-right max-w-[195px]"
                alt="logo"
                width={195}
                height={52}
              />

              <LandingMobileMenu
                isOpen={isShowMobileMenu}
                setIsOpen={setIsShowMobileMenu}
                activeSection={activeSection}
              />
            </div>
            <div className="hidden lg:flex gap-6">
              <ul className="flex items-center gap-6">
                <li
                  className={`cursor-pointer transition-all duration-200 ${activeSection === "anythingYouWant" ? "text-primary" : "hover:text-primary"}`}
                  onClick={() => scrollToSection("anythingYouWant")}
                >
                  {t("home")}
                </li>
                <li
                  className={`cursor-pointer transition-all duration-200 ${activeSection === "work_process" ? "text-primary" : "hover:text-primary"}`}
                  onClick={() => scrollToSection("work_process")}
                >
                  {t("whyChooseUs")}
                </li>
                <li
                  className={`cursor-pointer transition-all duration-200 ${activeSection === "faq" ? "text-primary" : "hover:text-primary"}`}
                  onClick={() => scrollToSection("faq")}
                >
                  {t("faqs")}
                </li>
                <li
                  className={`cursor-pointer transition-all duration-200 ${activeSection === "ourBlogs" ? "text-primary" : "hover:text-primary"}`}
                  onClick={() => scrollToSection("ourBlogs")}
                >
                  {t("blog")}
                </li>
              </ul>
            </div>
            <div className="hidden lg:flex">
              <LanguageDropdown />
            </div>
          </div>
        </nav>
      </header>
    </>
  );
};

export default LandingHeader;
