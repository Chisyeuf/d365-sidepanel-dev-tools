import * as React from "react";
import Box from "@mui/material/Box";
import { DataType, Property } from 'csstype';
import { Button, Divider, styled } from "@mui/material";
import { useEffect, useLayoutEffect, useState } from "react";
import { transform } from "lodash";

enum Location {
    top = 'top',
    bottom = 'bottom',
    left = 'left',
    right = 'right'
}
type LocationType = Location | keyof typeof Location;
enum Position {
    start = 'start',
    center = 'center',
    end = 'end'
}
type PositionType = Position | keyof typeof Position;
const PositionFlex = {
    [Position.start]: 'flex-start',
    [Position.end]: 'flex-end',
    [Position.center]: 'center'
};

interface LegendRootProps {
    children: React.ReactNode,
    location: LocationType,
    position?: PositionType,
    selfHeight?: number
}

const LegendContainer = styled('span', {
    name: 'LegendContainer',
    slot: 'Root',
    overridesResolver: (props, styles) => styles.root,
})<ComponentContainerProps & LegendRootProps>(({ theme, ...props }) => ({
    backgroundColor: 'white',
    position: "absolute",
    display: 'flex',
    alignItems: props.position ? PositionFlex[props.position] : PositionFlex[Position.center],
    justifyContent: props.position ? PositionFlex[props.position] : PositionFlex[Position.center],
    alignContent: 'center',
    top: props.location === Location.top ? '-1px' : 'auto',
    bottom: props.location === Location.bottom ? '-1px' : 'auto',
    left: props.location === Location.left ? '-1px' : (props.location === Location.top || props.location === Location.bottom ? theme.spacing(theme.shape.borderRadius / 2) : 'auto'),
    right: props.location === Location.right ? '-1px' : 'auto',
    width: props.location === Location.top || props.location === Location.bottom ? 'calc(100% - ' + theme.spacing(theme.shape.borderRadius) + ')' : 'auto',
    height: props.location === Location.left || props.location === Location.right ? 'calc(100% - ' + theme.spacing(theme.shape.borderRadius) + ')' : 'auto',
    ...(props.location === Location.top && { transform: 'translateY(-50%)' }),
    ...(props.location === Location.bottom && { transform: 'translateY(50%)' }),
    ...(props.location === Location.left && { transform: 'translateX(-50%)' }),
    ...(props.location === Location.right && { transform: 'translateX(50%)' }),
}));

type TLength = (string & {}) | 0;

export interface LegendProps {
    component: React.ReactNode,
    position?: PositionType,
}
export interface ComponentContainerProps {
    children: React.ReactNode,
    title?: string,
    borderStyle?: Property.BorderStyle,
    borderWidth?: Property.BorderWidth<TLength>,
    borderColor?: Property.BorderColor,
    borderRadius?: Property.BorderRadius<TLength>,
    padding?: string | number,
    Legend?: {
        top?: LegendProps,
        bottom?: LegendProps,
        left?: LegendProps,
        right?: LegendProps,
    }
}
function ComponentContainer(props: ComponentContainerProps) {
    const { children } = props;

    const refTop = React.useRef<HTMLSpanElement>(null);
    const refBottom = React.useRef<HTMLSpanElement>(null);
    const refLeft = React.useRef<HTMLSpanElement>(null);
    const refRight = React.useRef<HTMLSpanElement>(null);

    const [topComponentHeight, setTopComponentHeight] = useState<number>(0);
    const [bottomComponentHeight, setBottomComponentHeight] = useState<number>(0);
    const [leftComponentWidth, setLeftComponentWidth] = useState<number>(0);
    const [rightComponentWidth, setRightComponentWidth] = useState<number>(0);

    useEffect(() => {
        setTopComponentHeight(refTop.current?.clientHeight ?? 0);
    }, [refTop.current])
    useEffect(() => {
        setBottomComponentHeight(refBottom.current?.clientHeight ?? 0);
    }, [refBottom.current])
    useEffect(() => {
        setLeftComponentWidth(refLeft.current?.clientWidth ?? 0);
    }, [refLeft.current])
    useEffect(() => {
        setRightComponentWidth(refRight.current?.clientWidth ?? 0);
    }, [refRight.current])

    return (
        <Box
            component='div'
            position='relative'
            height='fit-content'
            width='fit-content'
            sx={{
                p: props.padding ?? 0,
                borderStyle: props.borderStyle ?? 'solid',
                borderWidth: props.borderWidth ?? '1px',
                borderColor: (theme) => props.borderColor ?? theme.palette.divider,
                borderRadius: (theme) => props.borderRadius ?? theme.shape.borderRadius,
                paddingTop: topComponentHeight/2 + 'px',
                paddingBottom: bottomComponentHeight/2 + 'px',
                paddingLeft: leftComponentWidth/2 + 'px',
                paddingRight: rightComponentWidth/2 + 'px',
            }}
        >
            {props.Legend &&
                <>
                    {
                        props.Legend.top &&
                        <LegendContainer
                            ref={refTop}
                            location='top'
                            position={props.Legend.top.position}
                        >
                            <Box component='span' width='100%'>
                                <Divider>{props.Legend.top.component}</Divider>
                            </Box>
                        </LegendContainer>
                    }
                    {
                        props.Legend?.bottom &&
                        <LegendContainer
                            ref={refBottom}
                            location='bottom'
                            position={props.Legend.bottom.position}
                        >
                            <Box component='span' width='100%'>
                                <Divider>{props.Legend.bottom.component}</Divider>
                            </Box>
                        </LegendContainer>
                    }
                    {
                        props.Legend?.left &&
                        <LegendContainer
                            ref={refLeft}
                            location='left'
                            position={props.Legend.left.position}
                        >
                            <Box component='span' height='100%'>
                                <Divider orientation='vertical'>{props.Legend.left.component}</Divider>
                            </Box>
                        </LegendContainer>
                    }
                    {
                        props.Legend?.right &&
                        <LegendContainer
                            ref={refRight}
                            location='right'
                            position={props.Legend.right.position}
                        >
                            <Box component='span' height='100%'>
                                <Divider orientation='vertical'>{props.Legend.right.component}</Divider>
                            </Box>
                        </LegendContainer>
                    }
                </>
            }
            {children}
        </Box>
    );
}

export default ComponentContainer;

// export default function BoxComponent() {
//     return (
//         <ComponentContainer
//             // borderStyle="solid"
//             // borderWidth="2px"
//             // borderColor="lightgray"
//             padding={1}
//             // borderRadius='10px'
//             Legend={{
//                 top: { component: <>rty</> },
//                 bottom: { component: <Button variant="contained">Save</Button>, position: 'start' },
//                 left: { component: <Button variant="contained" sx={{ height: '200%' }}>Save</Button>, position: 'end' },
//                 right: { component: <>right</> },
//             }}
//         >
//             {/* <Stack> */}
//             <Button>Save</Button>
//             <Button>Save</Button>
//             {/* </Stack> */}
//         </ComponentContainer>
//     );
// }