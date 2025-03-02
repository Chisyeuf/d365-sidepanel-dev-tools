import { Alert, paperClasses, styled, Theme, Tooltip, tooltipClasses, TooltipProps } from "@mui/material";
import React from "react";

// export const TooltipInfo2: React.ComponentType<TooltipProps> = styled(({ className, ...props }: TooltipProps) => {
//     console.log("TooltipInfo", className, tooltipClasses, paperClasses);
//     return <Tooltip {...props} classes={{ popper: className }} />;
// })
//     (({ theme }) => ({
//         [`& .${tooltipClasses.tooltip}`]: {
//             maxWidth: '540px',
//             p: 0,

//         },
//         [`& .${paperClasses.root}`]: {
//             fontSize: '1.2rem',
//             p: 0.5,
//             bgcolor: 'background.paper',
//             borderColor: theme.palette.primary.main
//         },
//         [`& .${tooltipClasses.arrow}`]: {
//             "::before": {
//                 bgcolor: theme.palette.primary.main
//             }
//         },
//     }));

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