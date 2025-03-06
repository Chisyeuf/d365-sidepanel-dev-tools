import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import { Textfit } from "react-textfit";


interface DirectNavigationButtonProps {
    icon: JSX.Element
    onClick: () => void
    label: string
    tooltip: string
}
export default function DirectNavigationButton(props: DirectNavigationButtonProps) {
    const { icon, onClick, label, tooltip } = props;

    return (
        <Tooltip placement='left' title={tooltip} disableInteractive arrow>
            <Button
                variant='outlined'
                onClick={() => onClick()}
                startIcon={icon}
                sx={{
                    width: '100%',
                    maxWidth: 'calc(100% - 10px)',
                    maxHeight: '30px',
                    gap: '0.4em',
                    padding: '5px 10px',
                    justifyContent: 'flex-start',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                }}
            >
                <Box width='calc(100% - 20px)'>
                    <Textfit mode='single'>
                        {label}
                    </Textfit>
                </Box>
            </Button>
        </Tooltip>
    )
}