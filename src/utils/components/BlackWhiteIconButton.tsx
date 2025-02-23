import IconButton, { IconButtonProps } from "@mui/material/IconButton";


interface BlackWhiteIconProps {
    sx?: IconButtonProps['sx'];
    color?: string;
}
const BlackWhiteIconButton = (props: BlackWhiteIconProps & Omit<IconButtonProps, 'color'>) => {
    const { color, sx, ...buttonProps } = props;

    return (
        <IconButton
            sx={[
                {
                    filter: 'saturate(0%)',
                    color: color,
                },
                color && {
                    "&:hover": {
                        filter: 'unset'
                    }
                },
                ...(Array.isArray(sx) ? sx : [sx])
            ]}
            {...buttonProps}
        />
    )
}

export default BlackWhiteIconButton;