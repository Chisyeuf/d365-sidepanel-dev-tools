import { Box, Paper, Slider, SliderProps, Stack, Typography } from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import { useHover } from "usehooks-ts";



interface MarkProps {
    "data-index": number
    className: string
    ownerState: {
        marks: boolean | { value: number, label: string }[]
        sx: {
            "& .MuiSlider-markLabel": {
                fontSize: string
            }
        }
        slots: {}
        size: string
        value: number
        max: number
        valueLabelDisplay: string
        isRtl: boolean
        min: number
        disabled: boolean
        disableSwap: boolean
        orientation: string
        color: string
        step: number
        track: string
        marked: boolean
        dragging: boolean
        focusedThumbIndex: number
        onChange?: (event: any, value: number) => void
    }
    markLabelActive: boolean
    style: {
        right: string
    }
}
function MarkComponent(props: MarkProps & React.PropsWithChildren) {
    const { ownerState, children, markLabelActive, "data-index": dataIndex, ...markProps } = props;

    const value = useMemo(() => {
        if (typeof ownerState.marks !== "boolean") {
            return ownerState.marks[dataIndex].value;
        }
        return ownerState.value;
    }, [dataIndex, ownerState.marks, ownerState.value]);

    return (
        <Typography
            onMouseDown={(e) => { e.stopPropagation(); }}
            onClick={(e) => { ownerState.onChange?.(e, value); }}

            sx={{
                // ...props.style,
                // border: "solid 1px red",

                fontWeight: 400,
                fontSize: '0.875rem',
                lineHeight: 1.43,
                letterSpacing: '0.01071em',
                color: markLabelActive ? 'rgba(0, 0, 0, 0.87)' : 'rgba(0, 0, 0, 0.6);',
                position: 'absolute',
                whiteSpace: 'nowrap',
                top: '30px',
                transform: 'translateX(-50%)',
            }}
            {...markProps}
        >
            x{children}
        </Typography>
    )
}

interface ZoomSliderProps extends Pick<SliderProps, 'min' | 'max' | 'step'> {
    defaultValue?: number
    onChange: (newZoom: number) => void
    width?: number
}
function ZoomSlider(props: ZoomSliderProps) {
    const { defaultValue = 1, max, min, step, onChange, width } = props;

    const [zoom, setZoom] = useState(defaultValue);

    const zoomPaperRef = useRef(null);
    const isHover = useHover(zoomPaperRef);

    const handleChange = (e: Event, newValue: number | any) => {
        setZoom(newValue);
        onChange(newValue);
        e.stopPropagation();
    }

    return (
        <Box height='30px' zIndex={1} >
            <Paper
                ref={zoomPaperRef}
                elevation={isHover ? 3 : 0}
                sx={{
                    pb: 1,
                    pr: 1,
                    pl: 1,
                    height: '20px',
                    overflow: 'hidden',
                    border: 'solid 1px',
                    borderColor: 'background.paper',
                    transition:'height 0.2s linear',
                    "&:hover": {
                        height: '50px',
                        // borderColor: 'grey.500',
                        // borderTop: '0'
                    }
                }}>
                <Stack direction='row' alignItems='center' spacing={1}>
                    <ZoomInIcon fontSize='small' />
                    <Slider
                        value={zoom}
                        onChange={handleChange}
                        size='small'
                        step={step}
                        min={min}
                        max={max}
                        slots={{
                            markLabel: MarkComponent,
                        }}
                        marks={[
                            {
                                value: 0.5,
                                label: '0.5'
                            },
                            {
                                value: 1,
                                label: '1.0'
                            },
                            {
                                value: 1.5,
                                label: '1.5'
                            },
                            {
                                value: 2,
                                label: '2.0'
                            },
                        ]}
                        sx={{
                            width: width,
                        }}
                    />
                    <Typography variant='caption'>x{zoom.toFixed(1)}</Typography>
                </Stack>
            </Paper>
        </Box >
    )
}

export default ZoomSlider;