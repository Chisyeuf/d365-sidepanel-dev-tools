import { Avatar, SxProps, Theme } from "@mui/material";
import React from 'react';



function stringToColor(string: string) {
    let hash = 0;
    let i;

    /* eslint-disable no-bitwise */
    for (i = 0; i < string.length; i += 1) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = '#';

    for (i = 0; i < 3; i += 1) {
        const value = (hash >> (i * 8)) & 0xff;
        color += `00${value.toString(16)}`.slice(-2);
    }
    /* eslint-enable no-bitwise */

    return color;
}



interface AvatarColorProps {
    fullname?: string
    src?: string
    size?: number
    sx?:SxProps<Theme> 
}

function AvatarColor(props: AvatarColorProps) {
    const { src, fullname, size, sx } = props;

    return (
        <Avatar src={src} sx={{
            ...(fullname && { bgcolor: stringToColor(fullname) }),
            ...(
                size && {
                    width: size,
                    height: size,
                    fontSize: size / 2
                }
            ),
            ...sx,
        }} >
            {fullname && `${fullname.split(' ')[0][0]}${fullname.split(' ')[1][0]}`}
        </Avatar>
    );
}

export default AvatarColor;