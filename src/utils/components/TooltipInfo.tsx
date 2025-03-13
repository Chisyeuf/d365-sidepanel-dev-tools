import { Alert, paperClasses, Tooltip, TooltipProps } from "@mui/material";

function TooltipInfo({ maxWidth, title, ...props }: TooltipProps & { maxWidth?: number | false }) {
    return (
        <Tooltip
            {...props}
            title={
                <Alert variant="outlined" icon={false} severity='info'>
                    {title}
                </Alert>
            }
            slotProps={{
                tooltip: {
                    sx: [
                        (theme) => ({
                            p: 0,
                            [`& > .${paperClasses.root}`]: {
                                fontSize: '1.2rem',
                                p: 0.5,
                                bgcolor: 'background.paper',
                                borderColor: theme.palette.primary.main
                            }
                        }),
                        ...(maxWidth !== undefined ? [{ maxWidth: maxWidth !== false ? `${maxWidth}px` : 'none', }] : [])
                    ]
                },
                arrow: {
                    sx: (theme) => ({
                        "::before": {
                            bgcolor: theme.palette.primary.main//'rgb(3, 169, 244)'//'rgb(229, 246, 253)'
                        }
                    })
                },

            }}
        />
    )
}

export default TooltipInfo;