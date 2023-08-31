import * as React from "react";
import Box from "@mui/material/Box";
import { DataType, Property } from 'csstype';
import { Button, Divider, Stack, styled } from "@mui/material";
import { useEffect, useLayoutEffect, useState } from "react";
import { transform } from "lodash";
import { StyledProps } from "@mui/styles";

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
    [Position.start]: 'left',
    [Position.center]: 'center',
    [Position.end]: 'right',
} as const;

interface LegendRootProps {
    children: React.ReactNode,
    location: LocationType,
    position?: PositionType,
    selfHeight?: number
}

const LegendContainer = styled("span", {
    name: "LegendContainer",
    slot: "Root",
    overridesResolver: (props, styles) => styles.root
})<ComponentContainerProps & LegendRootProps>(({ theme, ...props }) => ({
    // backgroundColor: "white",
    position: "absolute",

    // ...((props.location === Location.left || props.location === Location.right) && {
    display: 'flex',
    alignItems: props.position ? PositionFlex[props.position] : PositionFlex[Position.center],
    justifyContent: props.position ? PositionFlex[props.position] : PositionFlex[Position.center],
    alignContent: 'center',
    // }),

    top: props.location === Location.top ? "-1px" : "0",
    bottom: props.location === Location.bottom ? "-1px" : "auto",
    left:
        props.location === Location.left
            ? "-1px"
            : props.location === Location.top || props.location === Location.bottom
                ? '0'
                : "auto",
    right: props.location === Location.right ? "-1px" : "auto",
    width:
        props.location === Location.top || props.location === Location.bottom
            ? "100%"
            : "auto",
    height:
        props.location === Location.left || props.location === Location.right
            ? "100%"
            : "auto",
    ...(props.location === Location.top && { transform: "translateY(-50%)" }),
    ...(props.location === Location.bottom && { transform: "translateY(50%)" }),
    ...(props.location === Location.left && { transform: "translateX(-50%)" }),
    ...(props.location === Location.right && { transform: "translateX(50%)" })
}));


const LegendContent = styled("span", {
    name: "LegendContent",
    slot: "Root",
    overridesResolver: (props, styles) => styles.root
})<ComponentContainerProps & LegendRootProps>(({ theme, ...props }) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    width: props.location === Location.top || props.location === Location.bottom ? "80%" : "auto",
    flexDirection:
        props.location === Location.left || props.location === Location.right
            ? "column"
            : "row",
    "&::before, &::after": {
        position: "relative",
        inlineSize:
            props.location === Location.left || props.location === Location.right
                ? "1px"
                : "initial",
        blockSize:
            props.location === Location.left || props.location === Location.right
                ? "initial"
                : "1px",
        content: '""'
    },
    "&::before": {
        marginInlineEnd:
            props.location === Location.left || props.location === Location.right
                ? "initial"
                : theme.spacing(1),
        marginBlockEnd:
            props.location === Location.left || props.location === Location.right
                ? theme.spacing(1)
                : "initial",
        flexBasis: "50%"
    },
    "&::after": {
        marginInlineStart:
            props.location === Location.left || props.location === Location.right
                ? "initial"
                : theme.spacing(1),
        marginBlockStart:
            props.location === Location.left || props.location === Location.right
                ? theme.spacing(1)
                : "initial",
        flexBasis: "50%"
    }
}));

type TLength = (string & {}) | 0;

export interface LegendProps {
    component: React.ReactNode,
    position?: PositionType,
    padding?: Property.Padding,
    margin?: Property.Margin,
}
export interface ComponentContainerProps {
    children: React.ReactNode,
    width?: Property.Width,
    borderStyle?: Property.BorderStyle,
    borderWidth?: Property.BorderWidth<TLength>,
    borderColor?: Property.BorderColor,
    borderRadius?: Property.BorderRadius<TLength>,
    padding?: string | number,
    Legends?: {
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
            width={props.width ?? 'fit-content'}
            sx={{
                p: props.padding ?? 0,
                borderStyle: props.borderStyle ?? 'solid',
                borderWidth: props.borderWidth ?? '1px',
                borderColor: (theme) => props.borderColor ?? theme.palette.divider,
                borderRadius: (theme) => props.borderRadius ?? theme.shape.borderRadius + 'px',
                paddingTop: props.Legends?.top?.padding,
                paddingBottom: props.Legends?.bottom?.padding,
                paddingLeft: props.Legends?.left?.padding,
                paddingRight: props.Legends?.right?.padding,
                marginTop: props.Legends?.top?.margin,
                marginBottom: props.Legends?.bottom?.margin,
                marginLeft: props.Legends?.left?.margin,
                marginRight: props.Legends?.right?.margin,
            }
            }
        >
            {props.Legends && (
                <>
                    {props.Legends.top && (
                        <LegendContainer
                            ref={refTop}
                            location="top"
                            position={props.Legends.top.position}
                        >
                            <LegendContent location="top">
                                {props.Legends.top.component}
                            </LegendContent>
                        </LegendContainer>
                    )}
                    {props.Legends?.bottom && (
                        <LegendContainer
                            ref={refBottom}
                            location="bottom"
                            position={props.Legends.bottom.position}
                        >
                            <LegendContent location="bottom">
                                {props.Legends.bottom.component}
                            </LegendContent>
                        </LegendContainer>
                    )}
                    {props.Legends?.left && (
                        <LegendContainer
                            ref={refLeft}
                            location="left"
                            position={props.Legends.left.position}
                        >
                            <LegendContent location="left">
                                {props.Legends.left.component}
                            </LegendContent>
                        </LegendContainer>
                    )}
                    {props.Legends?.right && (
                        <LegendContainer
                            ref={refRight}
                            location="right"
                            position={props.Legends.right.position}
                        >
                            <LegendContent location="right">
                                {props.Legends.right.component}
                            </LegendContent>
                        </LegendContainer>
                    )}
                </>
            )}
            {children}
        </Box >
    );
}

export default ComponentContainer;
// https://codesandbox.io/s/hardcore-https-0khoxd?file=/demo.tsx

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
//            <Button>Save</Button>
//             <Button>Save</Button>
//             <Stack>
//             <Button>Save</Button>
//             <Button>Save</Button>
//             <Button>Save</Button>
//             <Button>Save</Button>
//             <Button>Save</Button>
//             <Button>Save</Button>
//             <Button>Save</Button>
//             <Button>Save</Button>
//             <Button>Save</Button>
//             <Button>Save</Button>
//             <Button>Save</Button>
//             <Button>Save</Button>
//             </Stack>
//         </ComponentContainer>
//     );
// }