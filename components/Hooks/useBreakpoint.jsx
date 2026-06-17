"use client";
import { useEffect, useState } from "react";

export const useBreakpoint = () => {
    const [state, setState] = useState({
        isSmallMobile: false,
        isMobile: false,
        isTablet: false,
        isTabletLarge: false,
        isDesktop: false,
    });

    useEffect(() => {
        const queries = {
            isSmallMobile: window.matchMedia("(max-width: 575px)"),
            isMobile: window.matchMedia("(min-width: 576px) and (max-width: 767px)"),
            isTablet: window.matchMedia("(min-width: 768px) and (max-width: 991px)"),
            isTabletLarge: window.matchMedia("(min-width: 992px) and (max-width: 1199px)"),
            isDesktop: window.matchMedia("(min-width: 1200px)"),
        };

        const update = () => {
            setState({
                isSmallMobile: queries.isSmallMobile.matches,
                isMobile: queries.isMobile.matches,
                isTablet: queries.isTablet.matches,
                isTabletLarge: queries.isTabletLarge.matches,
                isDesktop: queries.isDesktop.matches,
            });
        };

        update();

        Object.values(queries).forEach((mq) =>
            mq.addEventListener("change", update)
        );

        return () => {
            Object.values(queries).forEach((mq) =>
                mq.removeEventListener("change", update)
            );
        };
    }, []);

    return state;
};