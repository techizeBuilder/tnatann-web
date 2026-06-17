"use client";
import { usePathname } from "next/navigation";
import LandingHeader from "../PagesComponent/LandingPage/LandingHeader";
import HomeHeader from "../PagesComponent/Home/HomeHeader";

const Header = () => {
  const pathname = usePathname();
  return pathname.endsWith("/landing") ? <LandingHeader /> : <HomeHeader />;
};

export default Header;
