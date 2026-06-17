"use client";
import Link from "next/link";
import { useParams } from "next/navigation";

const CustomLink = ({ href, children, ...props }) => {
  const { lang } = useParams();

  const [basePath, hash] = href.split("#");

  const finalPath = basePath.startsWith("/")
    ? basePath
    : `/${basePath}`;

  const newHref = `/${lang}${finalPath}${hash ? `#${hash}` : ""}`;

  return (
    <Link href={newHref} {...props}>
      {children}
    </Link>
  );
};

export default CustomLink;
