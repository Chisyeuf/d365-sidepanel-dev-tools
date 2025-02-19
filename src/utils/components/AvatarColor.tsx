import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { SxProps, Theme } from "@mui/material";


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
    size: number
    loading?: boolean
    circularProgressRatio?: number
    circularProgressThickness?: number
    sx?: SxProps<Theme>
}

function AvatarColor(props: AvatarColorProps) {
    const { src, fullname, size, circularProgressRatio = 1, circularProgressThickness, loading = false, sx } = props;

    return (
        <Box sx={{ position: 'relative' }}>
            <Avatar src={src} sx={(theme) => ({
                ...(fullname && { bgcolor: stringToColor(fullname) }),
                width: size,
                height: size,
                fontSize: size / 2
                ,
                ...(typeof sx === "function" ? sx?.(theme) : { sx }),
            })} >
                {fullname && fullname.match(/(^\S?|\s\S)?/g)?.map(v => v.trim()).join("").match(/(^\S|\S$)?/g)?.join("").toLocaleUpperCase()}
            </Avatar>
            {loading && (
                <CircularProgress
                    size={size + size * (circularProgressRatio - 1)}
                    disableShrink
                    thickness={circularProgressThickness}
                    sx={{
                        position: 'absolute',
                        top: -(size * (circularProgressRatio - 1) * 0.5),
                        left: -(size * (circularProgressRatio - 1) * 0.5),
                    }}
                />
            )}
        </Box>
    );
}

export default AvatarColor;