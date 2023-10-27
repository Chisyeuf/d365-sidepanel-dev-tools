import React, { useMemo } from 'react';

const baseWidth = 16;
const navbarImagesWidth = 590;

interface D365RibbonHomePageIconProps {
    iconX: number,
    iconY: number,
    width: number,
}
function D365RibbonHomePageIcon(props: D365RibbonHomePageIconProps) {
    const { iconX, iconY, width } = props;

    const ratio = useMemo(() => width / baseWidth, [width, baseWidth]);
    const trueIconX = useMemo(() => iconX * ratio, [ratio, iconX]);
    const trueIconY = useMemo(() => iconY * ratio, [ratio, iconY]);
    const backgroundSize = useMemo(() => navbarImagesWidth * ratio, [navbarImagesWidth, ratio]);
    

    return (
        <div style={{
            background: `transparent url(/_imgs/imagestrips/ribbonhomepage.png?ver=-1354407217) no-repeat scroll ${trueIconX}px ${trueIconY}px`,
            backgroundSize: backgroundSize + 'px',
            minWidth: width + 'px',
            minHeight: width + 'px',
        }} />
    );
}

export default D365RibbonHomePageIcon;