"use client";
import { useParams, useRouter } from "next/navigation";

export const useNavigate = () => {

  const router = useRouter();
  const { lang } = useParams();

  const navigate = (path = "", options = {}) => {
    const finalPath = path.startsWith("/") ? path : `/${path}`;
    router.push(`/${lang}${finalPath}`, options);
  };

  return { navigate };
};
