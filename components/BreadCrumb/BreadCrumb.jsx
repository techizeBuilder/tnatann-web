"use client";
import { Fragment } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useSelector } from "react-redux";
import { t } from "@/utils";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import CustomLink from "@/components/Common/CustomLink";
import { useNavigate } from "../Hooks/useNavigate";

const BreadCrumb = ({ title2 }) => {
  const { navigate } = useNavigate();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { lang } = useParams();
  const BreadcrumbPath = useSelector(
    (state) => state.BreadcrumbPath.BreadcrumbPath
  );

  const items = [
    {
      title: t("home"),
      key: "home",
      href: "/",
      isLink: true,
    },
    ...(title2
      ? [
        {
          title: title2,
          key: "custom",
          isLink: false,
        },
      ]
      : BreadcrumbPath && BreadcrumbPath.length > 0
        ? BreadcrumbPath.map((crumb, index) => {

          const isLast = index === BreadcrumbPath.length - 1;

          // 1. Determine the core path
          const slug = crumb.isAllCategories ? "/ads" : (crumb.slug || "");
          const formattedSlug = slug.startsWith('/') ? slug : `/${slug}`;

          return {
            title: crumb.name,
            key: index + 1,
            href: `/${lang}${formattedSlug}`,
            isLink: !isLast && !crumb.isCurrent,
            onClick: (e) => {
              e.preventDefault();
              if (crumb.isAllCategories) {

                const newSearchParams = new URLSearchParams(searchParams);
                newSearchParams.delete("category");
                const queryString = newSearchParams.toString();
                const newUrl = `/ads${queryString ? `?${queryString}` : ""}`;

                if (pathname === `/${lang}/ads`) {
                  window.history.pushState(null, "", `/${lang}${newUrl}`);
                } else {
                  navigate(newUrl);
                }
              } else {
                const newUrl = crumb.slug;
                const targetPath = newUrl.split('?')[0];
                if (pathname === `/${lang}${targetPath}`) {
                  window.history.pushState(null, "", `/${lang}${newUrl}`);
                } else {
                  navigate(newUrl);
                }
              }
            },
          };
        })
        : []),
  ];

  return (
    <div className="bg-muted">
      <div className="container py-5">
        <Breadcrumb>
          <BreadcrumbList>
            {items?.map((item, index) => {
              return (
                <Fragment key={index}>
                  <BreadcrumbItem>
                    {item.isLink && item.onClick ? (
                      <BreadcrumbLink
                        href={item.href}
                        className="text-black"
                        onClick={(e) => {
                          e.preventDefault();
                          item.onClick(e);
                        }}
                      >
                        {item.title}
                      </BreadcrumbLink>
                    ) : item.isLink ? (
                      <CustomLink href={item?.href} passHref>
                        <BreadcrumbLink asChild className="text-black">
                          <span>{item.title}</span>
                        </BreadcrumbLink>
                      </CustomLink>
                    ) : (
                      <p className="text-black">{item.title}</p>
                    )}
                  </BreadcrumbItem>
                  {index !== items?.length - 1 && <BreadcrumbSeparator />}
                </Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  );
};

export default BreadCrumb;
