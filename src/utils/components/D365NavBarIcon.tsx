import React, { useMemo } from 'react';

const baseWidth = 32;
const navbarImagesWidth = 374;

interface D365NavBarIconProps {
    iconX: number,
    iconY: number,
    width: number,
}
function D365NavBarIcon(props: D365NavBarIconProps) {
    const { iconX, iconY, width } = props;

    const ratio = useMemo(() => width / baseWidth, [width, baseWidth]);
    const trueIconX = useMemo(() => iconX * ratio, [ratio, iconX]);
    const trueIconY = useMemo(() => iconY * ratio, [ratio, iconY]);
    const backgroundSize = useMemo(() => navbarImagesWidth * ratio, [navbarImagesWidth, ratio]);
    

    return (
        <div style={{
            background: `#666666 url(/_imgs/imagestrips/navbar_images.png) no-repeat scroll ${trueIconX}px ${trueIconY}px`,
            backgroundSize: backgroundSize + 'px',
            minWidth: width + 'px',
            minHeight: width + 'px',
        }} />
    );
}

export default D365NavBarIcon;