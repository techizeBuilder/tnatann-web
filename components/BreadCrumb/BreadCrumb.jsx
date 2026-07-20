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
import { useSearchParams } from "next/navigation";
import CustomLink from "@/components/Common/CustomLink";
import { knownParams } from "@/lib/constants";

const BreadCrumb = ({ title2 }) => {
  const searchParams = useSearchParams();
  const BreadcrumbPath = useSelector((state) => state.BreadcrumbPath.BreadcrumbPath);

  const getUniversalQueryString = () => {
    const params = new URLSearchParams();
    searchParams.forEach((value, key) => {
      if (knownParams.includes(key)) params.set(key, value);
    });
    return params.toString();
  };

  const buildHref = (crumb) => {
    const qs = getUniversalQueryString();
    const basePath = crumb.isAllCategories ? "/ads" : (crumb.slug || "");
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const items = [
    {
      title: t("home"),
      key: "home",
      href: "/",
      isLink: true,
    },
    ...(title2
      ? [{ title: title2, key: "custom", isLink: false }]
      : BreadcrumbPath?.length > 0
        ? BreadcrumbPath.map((crumb, index) => ({
            title: crumb.name,
            key: index + 1,
            href: buildHref(crumb),
            isLink: index !== BreadcrumbPath.length - 1,
          }))
        : []
    ),
  ];

  return (
    <div className="bg-muted">
      <div className="container py-5">
        <Breadcrumb>
          <BreadcrumbList>
            {items.map((item, index) => (
              <Fragment key={index}>
                <BreadcrumbItem>
                  {item.isLink ? (
                    <CustomLink href={item.href} passHref>
                      <BreadcrumbLink asChild className="text-black">
                        <span>{item.title}</span>
                      </BreadcrumbLink>
                    </CustomLink>
                  ) : (
                    <p className="text-black">{item.title}</p>
                  )}
                </BreadcrumbItem>
                {index !== items.length - 1 && <BreadcrumbSeparator />}
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  );
};

export default BreadCrumb;
