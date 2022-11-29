import { Theme, ThemeProvider } from '@emotion/react';
import { CircularProgress, CircularProgressProps, Container, createTheme, styled } from '@mui/material';
import React, { MouseEventHandler, useEffect, useState } from 'react';

const CircularProgressOverflowTheme = createTheme({
    components: {
        MuiCircularProgress: {
            styleOverrides: {
                root: {
                    position: 'absolute'
                }
            }
        },
        MuiContainer: {
            styleOverrides: {
                root: {
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                    width: '100%',
                    padding: '0 !important'
                }
            }
        }
    },
});

export type CircularProgressOverflowProps = CircularProgressProps & {
    /**
     * The content of the component.
     */
    children?: React.ReactNode
    loading?: boolean
    onClick?: MouseEventHandler<HTMLDivElement> | undefined
    theme?: Theme
    onHover?: (isHover: boolean) => void
};

function CircularProgressOverflow(props: CircularProgressOverflowProps) {
    const { children, onClick, loading, style, theme, onHover, ...circularProgressProps } = props

    const [isHover, setIsHover] = useState<boolean>(false)

    useEffect(() => {
        onHover && onHover(isHover)
    }, [isHover])


    return (
        <ThemeProvider theme={CircularProgressOverflowTheme}>
            <Container
                component={'div'}
                onClick={onClick}
                style={{ ...style }}
                onMouseEnter={() => setIsHover(true)}
                onMouseLeave={() => setIsHover(false)}
            >
                <ThemeProvider theme={theme ?? {}}>
                    {props.children}
                </ThemeProvider>
                {loading && <CircularProgress size={30} {...circularProgressProps} />}
            </Container>
        </ThemeProvider>
    );
}

export default CircularProgressOverflow;