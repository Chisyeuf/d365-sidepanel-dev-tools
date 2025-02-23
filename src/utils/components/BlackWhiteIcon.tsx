import { SvgIconComponent } from "@mui/icons-material";
import { SvgIconProps } from "@mui/material/SvgIcon";


interface BlackWhiteIconProps {
    IconComponent: SvgIconComponent;
    sx?: SvgIconProps['sx'];
    color?: string;
}
const BlackWhiteIcon = (props: BlackWhiteIconProps & Omit<SvgIconProps, 'color'>) => {
    const { IconComponent, color, sx, ...iconProps } = props;

    return (
        <IconComponent
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
            {...iconProps}
        />
    )
}

export default BlackWhiteIcon;