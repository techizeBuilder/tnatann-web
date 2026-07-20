"use client";
import Layout from "@/components/Layout/Layout";
import { getAboutUs } from "@/redux/reducer/settingSlice";
import parse from "html-react-parser";
import { useSelector } from "react-redux";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import { t } from "@/utils";
import { getReduxCurrentLangCode } from "@/redux/reducer/languageSlice";

const AboutUs = () => {
  const currentLangCode = useSelector(getReduxCurrentLangCode);
  const aboutUs = useSelector(getAboutUs);

  return (
    <Layout>
      <BreadCrumb title2={t("aboutUs")} />
      <div className="container">
        <div className="max-w-full prose lg:prose-lg py-7">{parse(aboutUs || "")}</div>
      </div>
    </Layout>
  );
};

export default AboutUs;
